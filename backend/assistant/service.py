"""
AssistantService -- the only thing backend/main.py's /api/assistant/chat
endpoint talks to. Owns the system prompt, the tool-dispatch loop, and the
LLMProvider it happens to be configured with. Never invents numbers itself:
every dataset/metric/prediction/explanation/reference fact must come back
through a tool call to model_service.ModelService (or, for the narrow
deterministic shortcuts in direct_answers.py, straight from the same
FEATURE_GLOSSARY/PROJECT_OVERVIEW/ModelService the tools themselves read).

No LangChain, no vector DB, no fine-tuning, no RAG -- a manual loop over a
plain HTTP call to the configured provider.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any

from model_service import ModelService

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
research platform that predicts cheese shelf life from formulation, processing, packaging, \
and storage-condition data.

You can answer:
- what the project is about and how its pipeline/models work
- what a dataset feature means
- dataset statistics (products, ingredients, indicators, packaging, categories)
- which model performs best and its metrics
- shelf-life predictions for a given formulation
- treatment-vs-control comparisons
- why a prediction came out the way it did (explanations)
- general food-science background (spoilage mechanisms, preservation techniques) from your \
own knowledge

HARD RULE: you must NEVER invent a project-specific number -- a dataset statistic, a model \
metric, a prediction, an explanation, or a reference/provenance fact. For any question that \
needs one of those, call the matching tool and report only what it returns. If a tool \
returns an error, tell the user what went wrong rather than guessing a number. General \
food-science knowledge (e.g. "why does low water activity slow spoilage") does not require a \
tool call.

This is a compact in-app chat panel, not a long-form writing surface: default to 2-5 \
concise sentences. Only go longer when the user explicitly asks for more detail. When you \
report numbers from a tool, use them exactly as returned (round sensibly for readability, \
but don't alter the underlying value)."""


class AssistantService:
    def __init__(self, model_service: ModelService, provider: LLMProvider | None = None):
        self.services = {"model_service": model_service}
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
        direct = try_direct_answer(last_user, self.model_service) if (allow_direct_routing and last_user) else None
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
                {"id": tc["id"], "type": "function", "function": {
                    "name": tc["name"],
                    "arguments": json.dumps(tc["arguments"], default=str) if args_as_string else tc["arguments"],
                }}
                for tc in reply.tool_calls
            ]})
            for tc in reply.tool_calls:
                name = tc["name"]
                args = tc["arguments"] or {}
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
