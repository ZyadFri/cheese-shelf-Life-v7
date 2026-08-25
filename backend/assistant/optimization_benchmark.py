"""
Before/after benchmark for the Phase 2 call/token-reduction work.

Run with:
    python -m backend.assistant.optimization_benchmark

Uses whichever provider LLM_PROVIDER resolves to (falls back through
gemini/cerebras/groq/ollama, whichever has credentials/is reachable, unless
LLM_PROVIDER is already set) and runs the 7 representative questions from
the task twice against the REAL AssistantService:

  BEFORE: allow_direct_routing=False, tool_rounds=4 (the exact pre-Phase-2
          behavior: full tool schema every time, unbounded tool-planning
          rounds, no glossary/overview/best-model shortcuts).
  AFTER:  production defaults (allow_direct_routing=True, tool_rounds=
          MAX_TOOL_ROUNDS).

Prints a before/after table with % reduction in LLM calls and tokens. Each
question is run as an independent conversation (no shared history) so
results are directly comparable.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from model_service import ModelService  # noqa: E402

from .provider_benchmark import PROVIDER_CTORS, _missing_env, _ollama_reachable  # noqa: E402
from .service import AssistantService  # noqa: E402

QUESTIONS = [
    "What is this project about?",
    "What is matrix_water_activity?",
    "What does storage_temperature_c mean?",
    "How many rows are in the dataset?",
    "Which model performs best?",
    "Explain why a shelf-life prediction of 48 days came out that way for a soft cheese.",
    "Compare adding potassium sorbate versus rosemary extract for a soft cheese and tell me which looks preferable.",
]


def _pick_available_provider():
    preferred = os.environ.get("LLM_PROVIDER")
    order = [preferred] if preferred else []
    order += ["gemini", "cerebras", "groq", "cloudflare", "ollama"]
    seen = set()
    for name in order:
        if not name or name in seen:
            continue
        seen.add(name)
        if name == "ollama":
            if _ollama_reachable(os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")):
                return PROVIDER_CTORS["ollama"]()
            continue
        if name in PROVIDER_CTORS and not _missing_env(name):
            return PROVIDER_CTORS[name]()
    return None


def _run(assistant: AssistantService, question: str, *, before: bool) -> dict:
    kwargs = {"allow_direct_routing": False, "tool_rounds": 4} if before else {}
    response = assistant.chat([{"role": "user", "content": question}], **kwargs)
    meta = response.get("meta", {})
    return {
        "llm_calls": meta.get("llm_calls", 0),
        "tool_calls": len(response.get("tool_calls", [])),
        "input_tokens": meta.get("input_tokens"),
        "output_tokens": meta.get("output_tokens"),
        "duration_ms": meta.get("duration_ms", 0.0),
    }


def _sum_tokens(rows: list[dict], key: str) -> int | None:
    vals = [r[key] for r in rows if r[key] is not None]
    return sum(vals) if len(vals) == len(rows) else None


def main() -> None:
    provider = _pick_available_provider()
    if provider is None:
        print(
            "No provider is currently configured/reachable (checked gemini, cerebras, groq, "
            "cloudflare env vars, and a local Ollama server). Set at least one provider's "
            "credentials (see backend/.env.example) and re-run this script."
        )
        return

    print(f"Using provider: {provider.name} (model={getattr(provider, 'model', '?')})\n")
    model_service = ModelService()
    assistant = AssistantService(model_service, provider=provider)

    before_rows, after_rows = [], []
    header = f"{'Question':<62} {'Before LLM':<11} {'After LLM':<10} {'Before tok':<11} {'After tok'}"
    print(header)
    print("-" * len(header))
    for q in QUESTIONS:
        before = _run(assistant, q, before=True)
        after = _run(assistant, q, before=False)
        before_rows.append(before)
        after_rows.append(after)
        b_tok = (before["input_tokens"] or 0) + (before["output_tokens"] or 0) if before["input_tokens"] is not None else None
        a_tok = (after["input_tokens"] or 0) + (after["output_tokens"] or 0) if after["input_tokens"] is not None else None
        label = (q[:59] + "...") if len(q) > 62 else q
        print(f"{label:<62} {before['llm_calls']:<11} {after['llm_calls']:<10} {str(b_tok) if b_tok is not None else 'n/a':<11} {a_tok if a_tok is not None else 'n/a'}")

    total_before_calls = sum(r["llm_calls"] for r in before_rows)
    total_after_calls = sum(r["llm_calls"] for r in after_rows)
    call_reduction = (1 - total_after_calls / total_before_calls) * 100 if total_before_calls else 0.0

    before_tok = _sum_tokens(
        [{"t": (r["input_tokens"] or 0) + (r["output_tokens"] or 0)} if r["input_tokens"] is not None else {"t": None} for r in before_rows], "t",
    )
    after_tok = _sum_tokens(
        [{"t": (r["input_tokens"] or 0) + (r["output_tokens"] or 0)} if r["input_tokens"] is not None else {"t": None} for r in after_rows], "t",
    )
    token_reduction = (1 - after_tok / before_tok) * 100 if (before_tok and after_tok is not None and before_tok > 0) else None

    print()
    print(f"Total LLM calls: before={total_before_calls} after={total_after_calls} ({call_reduction:.0f}% reduction)")
    if token_reduction is not None:
        print(f"Total tokens:    before={before_tok} after={after_tok} ({token_reduction:.0f}% reduction)")
    else:
        print("Total tokens:    provider did not report usage for one or more calls -- see per-question table above")


if __name__ == "__main__":
    main()
