"""
Provider benchmark / smoke test.

Run with:
    python -m backend.assistant.provider_benchmark

Tests every LLMProvider for which credentials are actually configured
(env vars in backend/.env or the process environment, or -- for Ollama -- a
reachable local server) against a fixed set of representative prompts
covering ALL of the app's current systems (legacy chat/tools, the specialist
shelf-life system, the formulation classifier, and ingredient ranking),
using the REAL AssistantService tool-dispatch loop wired to the REAL
ModelService/SpecialistRegistry/ClassificationService/IngredientRankingService
(not a separate hand-rolled harness or mocked services) -- so "does tool
calling actually work against this app's real data" is measured against the
exact code path production uses. A provider missing credentials is reported
as SKIPPED, never a failure -- this script must finish cleanly even if only
one provider (or none) is configured.

Chat/tool routing is exercised directly (allow_direct_routing=False,
tool_rounds=4) so a provider's own tool-calling behavior is what's measured,
not this app's Phase 2 deterministic fast paths (see service.py's chat()
docstring) -- those are covered separately by optimization_benchmark.py.

IMPORTANT: a provider is only marked a viable PRODUCTION CANDIDATE if every
test that requires a specific tool call actually called the right tool with
usable results -- one successful prompt (e.g. plain chat) does NOT make a
provider viable, since the assistant depends on reliable tool calling for
every project-specific fact.
"""
from __future__ import annotations

import os
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from classification_service import ClassificationService  # noqa: E402
from ingredient_ranking_service import IngredientRankingService  # noqa: E402
from model_service import ModelService  # noqa: E402
from specialist_registry import SpecialistRegistry  # noqa: E402

from .providers import LLMProvider, PROVIDER_CLASSES  # noqa: E402
from .service import AssistantService  # noqa: E402

REQUIRED_ENV: dict[str, list[str]] = {
    "gemini": ["GEMINI_API_KEY"],
    "cerebras": ["CEREBRAS_API_KEY"],
    "cloudflare": ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"],
    "groq": ["GROQ_API_KEY"],
    "ollama": [],  # no key -- checked by reachability instead
}


@dataclass
class TestCase:
    id: str
    prompt: str
    expected_tools: tuple[str, ...] = ()  # any-of; empty means "no specific tool required"
    description: str = ""
    required_for_production: bool = True  # if False, a miss doesn't disqualify the provider


TEST_CASES: list[TestCase] = [
    TestCase("A", "Explain what water activity means.", (), "simple conversation, no tool required", required_for_production=False),
    TestCase("B", "How many rows are in the training dataset?", ("get_dataset_statistics", "get_project_overview"), "project/dataset tool"),
    TestCase("C", "What does matrix_water_activity mean in this project?", ("get_feature_information",), "feature lookup"),
    # Deliberately NOT "which model performs best" -- the system prompt
    # correctly instructs the model to disambiguate that question in prose
    # rather than call one tool (verified live: Gemini does exactly this,
    # which is correct behavior, not a test failure). This asks about one
    # specific, unambiguous system instead.
    TestCase("D", "What are the formulation classifier's validation metrics?", ("get_classification_info",), "model information"),
    TestCase("E", "Predict the shelf life for a soft cheese with a fresh_ball physical form, tracking listeria_monocytogenes, stored at 4 degrees C, using the current specialist system.", ("predict_specialist_shelf_life", "get_specialist_info"), "V7/specialist prediction tool"),
    TestCase("F", "Classify a soft cheese formulation treated with potassium sorbate at 1500 ppm.", ("classify_formulation",), "formulation classification tool"),
    TestCase("G", "What is potassium sorbate's rank in the ingredient efficacy ranking?", ("get_ingredient_ranking",), "ingredient ranking tool"),
    TestCase("H", "Compare adding potassium sorbate versus no treatment for a soft cheese and tell me which looks preferable.", ("compare_treatments", "predict_specialist_shelf_life", "classify_formulation"), "tool result -> natural-language final answer"),
]


@dataclass
class TestResult:
    case_id: str
    ok: bool = False
    tool_used: str | None = None
    tool_correct: bool | None = None  # None when the test doesn't require a specific tool
    tool_args_valid: bool | None = None
    final_answer_ok: bool = False
    llm_calls: int = 0
    input_tokens: int | None = None
    output_tokens: int | None = None
    latency_ms: float = 0.0
    error: str | None = None


@dataclass
class ProviderReport:
    name: str
    status: str = "SKIPPED"  # SKIPPED | OK | ERROR
    skip_reason: str = ""
    model: str = ""
    connection_ok: bool = False
    results: list[TestResult] = field(default_factory=list)
    error: str | None = None

    @property
    def chat_ok(self) -> bool:
        return any(r.ok for r in self.results if r.case_id == "A")

    @property
    def tool_call_reliability(self) -> float | None:
        graded = [r for r in self.results if r.tool_correct is not None]
        if not graded:
            return None
        return sum(1 for r in graded if r.tool_correct) / len(graded)

    @property
    def production_candidate(self) -> bool:
        """A provider only qualifies if EVERY required-for-production test
        both called the right tool (when one was expected) and produced a
        usable final answer -- passing a single prompt is not enough."""
        required = [c for c in TEST_CASES if c.required_for_production]
        by_id = {r.case_id: r for r in self.results}
        for case in required:
            r = by_id.get(case.id)
            if r is None or not r.ok:
                return False
            if case.expected_tools and r.tool_correct is not True:
                return False
        return True

    @property
    def avg_latency_ms(self) -> float:
        vals = [r.latency_ms for r in self.results if r.ok]
        return sum(vals) / len(vals) if vals else 0.0

    @property
    def total_requests(self) -> int:
        return sum(r.llm_calls for r in self.results)

    @property
    def total_tokens(self) -> int | None:
        vals = [(r.input_tokens or 0) + (r.output_tokens or 0) for r in self.results if r.input_tokens is not None or r.output_tokens is not None]
        return sum(vals) if vals else None


def _missing_env(provider_name: str) -> list[str]:
    return [v for v in REQUIRED_ENV[provider_name] if not os.environ.get(v)]


def _ollama_reachable(base_url: str) -> bool:
    import requests
    try:
        resp = requests.get(f"{base_url.rstrip('/')}/api/tags", timeout=2.0)
        return resp.ok
    except requests.exceptions.RequestException:
        return False


def _validate_tool_args(tool_name: str, args: dict[str, Any]) -> bool:
    """Minimal structural sanity check -- not a full schema validator, just
    enough to catch a provider hallucinating a shape that would fail at the
    tool implementation (e.g. missing a required field, or passing a string
    where the tool needs a list)."""
    if tool_name in ("predict_specialist_shelf_life", "classify_formulation"):
        candidates = args.get("candidates")
        return isinstance(candidates, list) and len(candidates) > 0
    if tool_name == "get_feature_information":
        return "feature_name" not in args or isinstance(args["feature_name"], str)
    if tool_name == "get_ingredient_ranking":
        return True  # every argument is optional
    return True


def _run_case(assistant: AssistantService, case: TestCase) -> TestResult:
    result = TestResult(case_id=case.id)
    start = time.perf_counter()
    try:
        response = assistant.chat(
            [{"role": "user", "content": case.prompt}],
            allow_direct_routing=False, tool_rounds=4,
        )
    except Exception as exc:  # noqa: BLE001 -- captured as a per-test failure, not a script crash
        result.error = f"{type(exc).__name__}: {exc}"
        result.latency_ms = round((time.perf_counter() - start) * 1000, 1)
        return result

    result.latency_ms = round((time.perf_counter() - start) * 1000, 1)
    meta = response.get("meta", {})
    result.llm_calls = meta.get("llm_calls", 0)
    result.input_tokens = meta.get("input_tokens")
    result.output_tokens = meta.get("output_tokens")

    tool_calls = response.get("tool_calls", [])
    tools_used = [tc["name"] for tc in tool_calls]
    result.tool_used = ", ".join(tools_used) if tools_used else None
    if case.expected_tools:
        result.tool_correct = any(t in tools_used for t in case.expected_tools)
        matching = [tc for tc in tool_calls if tc["name"] in case.expected_tools]
        result.tool_args_valid = all(_validate_tool_args(tc["name"], tc.get("arguments") or {}) for tc in matching) if matching else False
    result.final_answer_ok = bool(response.get("reply", "").strip())
    result.ok = result.final_answer_ok and (result.tool_correct is not False) and (result.tool_args_valid is not False)
    return result


def _build_assistant(provider: LLMProvider, services: dict[str, Any]) -> AssistantService:
    return AssistantService(
        model_service=services["model_service"], specialist_registry=services["specialist_registry"],
        classification_service=services["classification_service"], ingredient_ranking_service=services["ingredient_ranking_service"],
        provider=provider,
    )


def run_provider(name: str, services: dict[str, Any]) -> ProviderReport:
    report = ProviderReport(name=name)

    if name == "ollama":
        base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        if not _ollama_reachable(base_url):
            report.skip_reason = f"no Ollama server reachable at {base_url}"
            return report
    else:
        missing = _missing_env(name)
        if missing:
            report.skip_reason = f"missing env var(s): {', '.join(missing)}"
            return report

    try:
        provider = PROVIDER_CLASSES[name]()
    except Exception as exc:  # noqa: BLE001
        report.status = "ERROR"
        report.error = f"construction failed: {exc}"
        return report

    report.model = getattr(provider, "model", "")
    report.connection_ok = True
    assistant = _build_assistant(provider, services)

    for case in TEST_CASES:
        report.results.append(_run_case(assistant, case))

    report.status = "OK" if report.production_candidate else "ERROR"
    if report.status == "ERROR" and not report.error:
        failed = [f"{r.case_id} ({r.error or 'wrong/missing tool call or invalid args'})" for r in report.results
                  if next(c for c in TEST_CASES if c.id == r.case_id).required_for_production and not r.ok]
        report.error = f"failed required test(s): {', '.join(failed)}" if failed else "not a reliable production candidate"
    return report


def _fmt_tokens(report: ProviderReport) -> str:
    total = report.total_tokens
    return f"~{total}" if total is not None else "unreported"


def _fmt_reliability(report: ProviderReport) -> str:
    rel = report.tool_call_reliability
    return f"{rel * 100:.0f}%" if rel is not None else "n/a"


def print_report(reports: list[ProviderReport]) -> None:
    header = f"{'Provider':<11} {'Chat':<5} {'Tools':<7} {'Latency':<10} {'Requests':<9} {'Tokens':<10} {'Prod?':<6} {'Result'}"
    print(header)
    print("-" * len(header))
    for r in reports:
        if r.status == "SKIPPED":
            print(f"{r.name:<11} {'-':<5} {'-':<7} {'-':<10} {'-':<9} {'-':<10} {'-':<6} SKIPPED ({r.skip_reason})")
            continue
        chat_mark = "✓" if r.chat_ok else "✗"
        tools_mark = _fmt_reliability(r)
        latency = f"{r.avg_latency_ms:.0f}ms" if r.avg_latency_ms else "n/a"
        prod_mark = "YES" if r.production_candidate else "no"
        result_note = "OK" if r.status == "OK" else f"ERROR: {r.error}"
        print(f"{r.name:<11} {chat_mark:<5} {tools_mark:<7} {latency:<10} {r.total_requests:<9} {_fmt_tokens(r):<10} {prod_mark:<6} {result_note}")

    print()
    for r in reports:
        if r.status == "SKIPPED":
            continue
        print(f"--- {r.name} (model={r.model}) ---")
        for res in r.results:
            case = next(c for c in TEST_CASES if c.id == res.case_id)
            status = "ok" if res.ok else "FAIL"
            tool_note = f"tool={res.tool_used or 'none'}"
            if res.tool_correct is not None:
                tool_note += " (expected)" if res.tool_correct else " (WRONG/MISSING)"
            if res.tool_args_valid is False:
                tool_note += " [invalid args]"
            err_note = f" error={res.error}" if res.error else ""
            req_note = "" if case.required_for_production else " (optional)"
            print(f"  [{res.case_id}] {status:<4} {case.description:<38}{req_note} {tool_note} latency={res.latency_ms:.0f}ms{err_note}")
        print()


def load_services() -> dict[str, Any]:
    print("Loading production services (ModelService, SpecialistRegistry, ClassificationService, IngredientRankingService)...")
    services: dict[str, Any] = {"model_service": ModelService()}
    try:
        services["specialist_registry"] = SpecialistRegistry()
    except FileNotFoundError:
        services["specialist_registry"] = None
    try:
        services["classification_service"] = ClassificationService()
    except FileNotFoundError:
        services["classification_service"] = None
    try:
        services["ingredient_ranking_service"] = IngredientRankingService()
    except FileNotFoundError:
        services["ingredient_ranking_service"] = None
    return services


def main() -> None:
    try:
        from dotenv import load_dotenv
        load_dotenv(ROOT / "backend" / ".env", override=False)
    except ImportError:
        pass

    services = load_services()
    reports = [run_provider(name, services) for name in ("gemini", "cloudflare", "cerebras", "groq", "ollama")]
    print()
    print_report(reports)


if __name__ == "__main__":
    main()
