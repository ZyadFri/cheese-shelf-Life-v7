"""
Before/after benchmark for the Phase 2 call/token-reduction work.

Run with:
    python -m backend.assistant.optimization_benchmark

Uses whichever provider LLM_PROVIDER resolves to (falls back through
gemini/cerebras/groq/cloudflare/ollama, whichever has credentials/is
reachable, unless LLM_PROVIDER is already set) and runs representative
questions -- covering glossary lookups, the project overview, a V7/specialist
prediction, a V7/specialist explanation, formulation classification,
ingredient ranking, and a complex multi-tool comparison -- twice against the
REAL AssistantService, wired to the REAL production services:

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
import time
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from .provider_benchmark import _missing_env, _ollama_reachable, load_services  # noqa: E402
from .providers import PROVIDER_CLASSES  # noqa: E402
from .service import AssistantService  # noqa: E402

QUESTIONS = [
    ("glossary", "What is matrix_water_activity?"),
    ("glossary", "What does storage_temperature_c mean?"),
    ("project overview", "What is this project about?"),
    ("dataset stats", "How many rows are in the dataset?"),
    ("legacy model info", "Which model performs best?"),
    ("V7/specialist prediction", "Predict shelf life for a soft cheese with a fresh_ball physical form, tracking listeria_monocytogenes, stored at 4 degrees C."),
    ("V7/specialist explanation", "Why would a soft cheese stored warm have a shorter shelf life? Explain using the specialist model."),
    ("formulation classification", "Classify a soft cheese formulation treated with potassium sorbate at 1500 ppm."),
    ("ingredient ranking", "What is potassium sorbate's rank in the ingredient efficacy ranking?"),
    ("complex comparison", "Compare adding potassium sorbate versus rosemary extract for a soft cheese and tell me which looks preferable."),
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
                return PROVIDER_CLASSES["ollama"]()
            continue
        if name in PROVIDER_CLASSES and not _missing_env(name):
            return PROVIDER_CLASSES[name]()
    return None


def _run(assistant: AssistantService, question: str, *, before: bool) -> dict:
    from .providers import ProviderUnavailableError

    kwargs = {"allow_direct_routing": False, "tool_rounds": 4} if before else {}
    # Free-tier per-minute quotas are tight enough that back-to-back
    # benchmark questions can trip a 429 even after the provider's own
    # retry budget -- one extra retry with a real pause is appropriate here
    # (a one-off benchmark run, not a latency-sensitive production request).
    for attempt in range(2):
        try:
            response = assistant.chat([{"role": "user", "content": question}], **kwargs)
            break
        except ProviderUnavailableError:
            if attempt == 1:
                raise
            time.sleep(15.0)
    meta = response.get("meta", {})
    return {
        "llm_calls": meta.get("llm_calls", 0),
        "tool_calls": len(response.get("tool_calls", [])),
        "input_tokens": meta.get("input_tokens"),
        "output_tokens": meta.get("output_tokens"),
        "duration_ms": meta.get("duration_ms", 0.0),
    }


def main() -> None:
    try:
        from dotenv import load_dotenv
        load_dotenv(ROOT / "backend" / ".env", override=False)
    except ImportError:
        pass

    provider = _pick_available_provider()
    if provider is None:
        print(
            "No provider is currently configured/reachable (checked gemini, cerebras, groq, "
            "cloudflare env vars, and a local Ollama server). Set at least one provider's "
            "credentials (see backend/.env.example) and re-run this script."
        )
        return

    print(f"Using provider: {provider.name} (model={getattr(provider, 'model', '?')})\n")
    services = load_services()
    assistant = AssistantService(
        model_service=services["model_service"], specialist_registry=services["specialist_registry"],
        classification_service=services["classification_service"], ingredient_ranking_service=services["ingredient_ranking_service"],
        provider=provider,
    )

    def _tok(row: dict) -> str:
        if row["input_tokens"] is None:
            return "n/a"
        return f"{row['input_tokens']}+{row['output_tokens']}"

    before_rows, after_rows = [], []
    header = f"{'Category':<28} {'Before LLM':<11} {'After LLM':<10} {'Before tok':<12} {'After tok':<12} {'Before ms':<10} {'After ms'}"
    print(header)
    print("-" * len(header))
    for i, (category, q) in enumerate(QUESTIONS):
        if i > 0:
            time.sleep(3.0)  # stay comfortably under free-tier per-minute quotas
        before = _run(assistant, q, before=True)
        after = _run(assistant, q, before=False)
        before_rows.append(before)
        after_rows.append(after)
        print(f"{category:<28} {before['llm_calls']:<11} {after['llm_calls']:<10} {_tok(before):<12} {_tok(after):<12} {before['duration_ms']:<10.0f} {after['duration_ms']:.0f}")

    total_before_calls = sum(r["llm_calls"] for r in before_rows)
    total_after_calls = sum(r["llm_calls"] for r in after_rows)
    call_reduction = (1 - total_after_calls / total_before_calls) * 100 if total_before_calls else 0.0

    def _sum_tokens(rows: list[dict]) -> int | None:
        vals = [(r["input_tokens"] or 0) + (r["output_tokens"] or 0) for r in rows if r["input_tokens"] is not None]
        return sum(vals) if len(vals) == len(rows) else None

    before_tok = _sum_tokens(before_rows)
    after_tok = _sum_tokens(after_rows)
    token_reduction = (1 - after_tok / before_tok) * 100 if (before_tok and after_tok is not None and before_tok > 0) else None

    total_before_ms = sum(r["duration_ms"] for r in before_rows)
    total_after_ms = sum(r["duration_ms"] for r in after_rows)

    print()
    print(f"Total LLM calls: before={total_before_calls} after={total_after_calls} ({call_reduction:.0f}% reduction)")
    if token_reduction is not None:
        print(f"Total tokens:    before={before_tok} after={after_tok} ({token_reduction:.0f}% reduction)")
    else:
        print("Total tokens:    provider did not report usage for one or more calls -- see per-question table above")
    print(f"Total latency:   before={total_before_ms:.0f}ms after={total_after_ms:.0f}ms")


if __name__ == "__main__":
    main()
