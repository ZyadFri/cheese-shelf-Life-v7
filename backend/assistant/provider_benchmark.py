"""
Provider benchmark / smoke test.

Run with:
    python -m backend.assistant.provider_benchmark

Tests every LLMProvider for which credentials are actually configured
(env vars, or -- for Ollama -- a reachable local server) against a fixed set
of representative prompts, using the REAL AssistantService tool-dispatch
loop (not a separate hand-rolled harness), so "does tool calling actually
work" is measured against the exact code path production uses. A provider
missing credentials is reported as SKIPPED, never a failure -- this script
must finish cleanly even if only one provider (or none) is configured.

Chat/tool routing is exercised directly (allow_direct_routing=False,
tool_rounds=4) so a provider's own tool-calling behavior is what's measured,
not this app's Phase 2 deterministic fast paths (see service.py's chat()
docstring) -- those are covered separately by optimization_benchmark.py.
"""
from __future__ import annotations

import os
import sys
import time
import traceback
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from model_service import ModelService  # noqa: E402

from .providers import (  # noqa: E402
    CerebrasProvider, CloudflareProvider, GeminiProvider, GroqProvider,
    LLMProvider, OllamaProvider,
)
from .service import AssistantService  # noqa: E402

REQUIRED_ENV: dict[str, list[str]] = {
    "gemini": ["GEMINI_API_KEY"],
    "cerebras": ["CEREBRAS_API_KEY"],
    "cloudflare": ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"],
    "groq": ["GROQ_API_KEY"],
    "ollama": [],  # no key -- checked by reachability instead
}

PROVIDER_CTORS: dict[str, type[LLMProvider]] = {
    "gemini": GeminiProvider, "cerebras": CerebrasProvider,
    "cloudflare": CloudflareProvider, "groq": GroqProvider, "ollama": OllamaProvider,
}


@dataclass
class TestCase:
    id: str
    prompt: str
    expected_tools: tuple[str, ...] = ()  # any-of; empty means "no specific tool required"
    description: str = ""


TEST_CASES: list[TestCase] = [
    TestCase("A", "Explain what water activity means.", (), "simple conversation, no tool required"),
    TestCase("B", "How many rows are in the training dataset?", ("get_dataset_statistics", "get_project_overview"), "project tool"),
    TestCase("C", "What does matrix_water_activity mean in this project?", ("get_feature_information",), "feature lookup"),
    TestCase("D", "Which model performs best?", ("get_model_metrics",), "model information"),
    TestCase("E", "Predict the shelf life for a soft cheese stored at 4 degrees C.", ("predict_shelf_life",), "prediction tool execution"),
    TestCase("F", "Compare adding potassium sorbate versus no treatment for a soft cheese.", ("compare_treatments",), "tool result -> natural-language final answer"),
]


@dataclass
class TestResult:
    case_id: str
    ok: bool = False
    tool_used: str | None = None
    tool_correct: bool | None = None  # None when the test doesn't require a specific tool
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

    tools_used = [tc["name"] for tc in response.get("tool_calls", [])]
    result.tool_used = ", ".join(tools_used) if tools_used else None
    if case.expected_tools:
        result.tool_correct = any(t in tools_used for t in case.expected_tools)
    result.final_answer_ok = bool(response.get("reply", "").strip())
    result.ok = result.final_answer_ok and (result.tool_correct is not False)
    return result


def run_provider(name: str, model_service: ModelService) -> ProviderReport:
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
        provider = PROVIDER_CTORS[name]()
    except Exception as exc:  # noqa: BLE001
        report.status = "ERROR"
        report.error = f"construction failed: {exc}"
        return report

    report.model = getattr(provider, "model", "")
    report.connection_ok = True
    assistant = AssistantService(model_service, provider=provider)

    for case in TEST_CASES:
        report.results.append(_run_case(assistant, case))

    report.status = "OK" if any(r.ok for r in report.results) else "ERROR"
    if report.status == "ERROR" and not report.error:
        errs = [r.error for r in report.results if r.error]
        report.error = errs[0] if errs else "no test produced a usable answer"
    return report


def _fmt_tokens(report: ProviderReport) -> str:
    total = report.total_tokens
    return f"~{total}" if total is not None else "unreported"


def _fmt_reliability(report: ProviderReport) -> str:
    rel = report.tool_call_reliability
    return f"{rel * 100:.0f}%" if rel is not None else "n/a"


def print_report(reports: list[ProviderReport]) -> None:
    header = f"{'Provider':<11} {'Chat':<5} {'Tools':<7} {'Latency':<10} {'Requests':<9} {'Tokens':<10} {'Result'}"
    print(header)
    print("-" * len(header))
    for r in reports:
        if r.status == "SKIPPED":
            print(f"{r.name:<11} {'-':<5} {'-':<7} {'-':<10} {'-':<9} {'-':<10} SKIPPED ({r.skip_reason})")
            continue
        chat_mark = "✓" if r.chat_ok else "✗"
        tools_mark = _fmt_reliability(r)
        latency = f"{r.avg_latency_ms:.0f}ms" if r.avg_latency_ms else "n/a"
        result_note = "OK" if r.status == "OK" else f"ERROR: {r.error}"
        print(f"{r.name:<11} {chat_mark:<5} {tools_mark:<7} {latency:<10} {r.total_requests:<9} {_fmt_tokens(r):<10} {result_note}")

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
            err_note = f" error={res.error}" if res.error else ""
            print(f"  [{res.case_id}] {status:<4} {case.description:<38} {tool_note} latency={res.latency_ms:.0f}ms{err_note}")
        print()


def main() -> None:
    print("Loading ModelService (shared across all providers)...")
    model_service = ModelService()
    reports = [run_provider(name, model_service) for name in ("gemini", "cloudflare", "cerebras", "groq", "ollama")]
    print()
    print_report(reports)


if __name__ == "__main__":
    main()
