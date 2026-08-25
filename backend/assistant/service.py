"""
AssistantService -- the only thing backend/main.py's /api/assistant/chat
endpoint talks to. Owns the system prompt, the tool-dispatch loop, and the
LLMProvider it happens to be configured with. Never invents numbers itself:
every dataset/metric/prediction/explanation/ranking/reference fact must come
back through a tool call to one of this app's production services (or, for
the narrow deterministic shortcuts in direct_answers.py, straight from the
same FEATURE_GLOSSARY/PROJECT_OVERVIEW/service data the tools themselves
read).

Receives every current service the app actually has (the legacy global
ModelService, plus the specialist shelf-life registry, the formulation
classifier, and the ingredient ranking -- any of the latter three may be
None if that artifact set isn't built on this checkout; tools degrade to a
clear error, never a crash, matching the REST routes' own defensive pattern).

No LangChain, no vector DB, no fine-tuning, no RAG -- a manual loop over a
plain HTTP call to the configured provider.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any

from classification_service import ClassificationService
from ingredient_ranking_service import IngredientRankingService
from model_service import ModelService
from specialist_registry import SpecialistRegistry

from .direct_answers import try_direct_answer
from .providers import LLMProvider, get_provider
from .telemetry import RequestTelemetry
from .tools import TOOL_IMPLS, TOOL_SPECS, select_tools

logger = logging.getLogger("shelf_life.assistant")

# Most questions need at most one tool round: LLM request -> one tool
# execution -> final LLM answer (2 LLM calls). Four rounds let a single
# question trigger up to four sequential tool-planning cycles, which is
# rarely necessary for this app's tool set and was the single largest
# source of avoidable LLM calls. Override via ASSISTANT_MAX_TOOL_ROUNDS if
# a genuinely multi-step question needs more.
MAX_TOOL_ROUNDS = int(os.environ.get("ASSISTANT_MAX_TOOL_ROUNDS", "1"))

# Bound how much prior conversation gets resent every turn. The frontend
# already sends only {role, content} (never the tool-call JSON from a past
# turn -- see assistant-chat.tsx), so this purely caps turn count, not
# per-turn payload size.
MAX_HISTORY_MESSAGES = int(os.environ.get("ASSISTANT_MAX_HISTORY_MESSAGES", "12"))

SYSTEM_PROMPT = """You are the in-app assistant for Shelf-Life Studio, a McGill Food Science \
research platform. It has three current systems over cheese formulation/processing/packaging/ \
storage data, plus one legacy one:
- The CURRENT specialist shelf-life system (get_specialist_info / predict_specialist_shelf_life / \
explain_specialist_prediction) -- one regression model per cheese category x prediction task. \
This is what the app's own Prediction page uses; prefer it over the legacy tools below.
- The CURRENT formulation efficacy classifier (get_classification_info / classify_formulation / \
explain_classification) -- predicts a Low/Medium/High shelf-life-improvement tier for a full \
treated formulation vs. a matched control.
- The CURRENT ingredient efficacy ranking (get_ingredient_ranking) -- an individual ingredient's \
own context-adjusted effect, precomputed and looked up, never estimated.
- A legacy global regression model (predict_shelf_life / compare_treatments / explain_prediction \
/ get_model_metrics) kept for the app's Modeling/Results/Explainability pages -- do not present \
this as "the" model for the whole app; there is no single best model across all four systems.

You can also answer what a dataset feature means, dataset statistics, and general food-science \
background (spoilage mechanisms, preservation techniques) from your own knowledge.

HARD RULE: you must NEVER invent a project-specific number -- a dataset statistic, a model \
metric, a prediction, a classification result, an ingredient's ranked effect, an explanation, or \
a reference/provenance fact. For any question that needs one of those, call the matching tool \
and report only what it returns -- in particular, never estimate an ingredient's efficacy from \
general knowledge if get_ingredient_ranking has an entry for it. If a tool returns an error, \
tell the user what went wrong rather than guessing a number. If asked "which model is best" \
without further context, explain that the app has no single best model -- performance depends \
on which of the four systems above is meant -- and offer to look up a specific one.

This is a compact in-app chat panel, not a long-form writing surface: default to 2-5 \
concise sentences. Only go longer when the user explicitly asks for more detail. When you \
report numbers from a tool, use them exactly as returned (round sensibly for readability, \
but don't alter the underlying value)."""


def _coerce_json_strings(args: dict[str, Any]) -> dict[str, Any]:
    """Some models (observed live, 2026-08: Cloudflare's Llama-3.3-70b
    endpoint) return a correctly-typed top-level arguments object but leave
    a nested array/object field double-encoded as a JSON string --
    e.g. candidates="[{...}]" instead of candidates=[{...}] -- which a tool
    expecting a real list would reject. Defensively re-parses any
    top-level string value that looks like JSON before dispatch; a no-op
    for the (normal) case where a provider already returns correctly-typed
    nested values."""
    coerced = {}
    for key, value in args.items():
        if isinstance(value, str) and value[:1] in "[{":
            try:
                value = json.loads(value)
            except ValueError:
                pass
        coerced[key] = value
    return coerced


class AssistantService:
    def __init__(
        self,
        model_service: ModelService,
        specialist_registry: SpecialistRegistry | None = None,
        classification_service: ClassificationService | None = None,
        ingredient_ranking_service: IngredientRankingService | None = None,
        provider: LLMProvider | None = None,
    ):
        self.services = {
            "model_service": model_service,
            "specialist_registry": specialist_registry,
            "classification_service": classification_service,
            "ingredient_ranking_service": ingredient_ranking_service,
        }
        self.model_service = model_service
        self.provider = provider or get_provider()

    def _page_context_message(self, page_context: dict[str, Any] | None) -> dict[str, Any] | None:
        if not page_context:
            return None
        return {
            "role": "system",
            "content": "Current app context (use only as hints for tool arguments -- never as facts to state directly): "
            + json.dumps(page_context),
        }

    def chat(
        self, history: list[dict[str, str]], page_context: dict[str, Any] | None = None,
        *, allow_direct_routing: bool = True, tool_rounds: int | None = None,
    ) -> dict[str, Any]:
        """allow_direct_routing/tool_rounds are only overridden by the
        benchmark scripts (provider_benchmark.py wants genuine LLM/tool
        behavior even for questions the production fast path would short-
        circuit; optimization_benchmark.py reproduces the pre-optimization
        4-round/no-routing behavior for a before/after comparison). Normal
        request handling never passes these -- both keep their production
        defaults (True / MAX_TOOL_ROUNDS)."""
        telemetry = RequestTelemetry(provider=self.provider.name, model=getattr(self.provider, "model", ""))
        max_rounds = tool_rounds if tool_rounds is not None else MAX_TOOL_ROUNDS

        # Deterministic fast path: a narrow set of question shapes (feature
        # glossary lookups, "what is this project", "which model is best")
        # have one unambiguous answer already available in memory. Route
        # these before ever touching the LLM -- 0 API calls, 0 tokens,
        # instant, and no chance of a hallucinated number since every value
        # comes from the same sources the tools read.
        last_user = next((m["content"] for m in reversed(history) if m.get("role") == "user"), "")
        direct = try_direct_answer(last_user, self.services) if (allow_direct_routing and last_user) else None
        if direct:
            telemetry.routed = direct["routed"]
            telemetry.llm_calls = 0
            logger.info(telemetry.finish().log_line())
            return {"reply": direct["reply"], "tool_calls": [], "meta": telemetry.to_dict()}

        bounded_history = history[-MAX_HISTORY_MESSAGES:]
        messages: list[dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]
        ctx_msg = self._page_context_message(page_context)
        if ctx_msg:
            messages.append(ctx_msg)
        messages.extend(bounded_history)

        tools_for_request = select_tools(last_user, page_context) if allow_direct_routing else TOOL_SPECS

        tool_trace: list[dict[str, Any]] = []
        for _ in range(max_rounds):
            reply = self.provider.chat(messages, tools_for_request)
            telemetry.llm_calls += 1
            telemetry.add_usage(reply.input_tokens, reply.output_tokens, reply.total_tokens)
            telemetry.model = getattr(self.provider, "model", telemetry.model)
            telemetry.provider = self.provider.name
            if not reply.tool_calls:
                logger.info(telemetry.finish().log_line())
                return {"reply": reply.content or "", "tool_calls": tool_trace, "meta": telemetry.to_dict()}

            args_as_string = self.provider.ARGS_AS_JSON_STRING
            messages.append({"role": "assistant", "content": reply.content or "", "tool_calls": [
                {
                    "id": tc["id"], "type": "function", "function": {
                        "name": tc["name"],
                        "arguments": json.dumps(tc["arguments"], default=str) if args_as_string else tc["arguments"],
                    },
                    # Opaque provider-specific data that MUST be echoed back
                    # verbatim (e.g. Gemini's thought_signature) -- see
                    # providers.py's OpenAICompatibleProvider.chat(). A no-op
                    # dict update for providers that never set this.
                    **({"extra_content": tc["provider_extra"]} if tc.get("provider_extra") else {}),
                }
                for tc in reply.tool_calls
            ]})
            for tc in reply.tool_calls:
                name = tc["name"]
                args = _coerce_json_strings(tc["arguments"] or {})
                telemetry.tool_calls.append(name)
                impl = TOOL_IMPLS.get(name)
                if impl is None:
                    result: dict[str, Any] = {"error": f"Unknown tool: {name}"}
                else:
                    try:
                        result = impl(self.services, **args)
                    except Exception as exc:  # noqa: BLE001 -- reported to the model, not raised
                        logger.exception("tool %s failed", name)
                        result = {"error": str(exc)}
                tool_trace.append({"name": name, "arguments": args, "result": result})
                # tool_call_id lets strict OpenAI-schema providers (Groq, Gemini,
                # Cerebras, Cloudflare) match this result back to its originating
                # call; Ollama ignores the extra field.
                messages.append({
                    "role": "tool", "tool_call_id": tc["id"],
                    "content": json.dumps({"tool": name, "result": result}, default=str),
                })

        # Ran out of tool rounds -- ask once more for a final plain answer,
        # tools=[] so the model MUST answer instead of requesting another tool.
        final = self.provider.chat(messages, tools=[])
        telemetry.llm_calls += 1
        telemetry.add_usage(final.input_tokens, final.output_tokens, final.total_tokens)
        logger.info(telemetry.finish().log_line())
        return {
            "reply": final.content or "I wasn't able to finish that request.",
            "tool_calls": tool_trace, "meta": telemetry.to_dict(),
        }
