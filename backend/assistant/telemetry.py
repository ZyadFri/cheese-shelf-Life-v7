"""
Lightweight internal telemetry for one assistant request.

Not a metrics/observability platform -- just enough structure to log and
report what a single AssistantService.chat() call actually consumed
(LLM calls, tool calls, tokens, latency), so provider choices and the
call/token-reduction work in Phase 2 can be measured rather than guessed at.
Never carries secrets (API keys, raw message content) -- only counts and
short tool/provider names.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field


@dataclass
class RequestTelemetry:
    provider: str = ""
    model: str = ""
    llm_calls: int = 0
    tool_calls: list[str] = field(default_factory=list)
    input_tokens: int | None = None
    output_tokens: int | None = None
    total_tokens: int | None = None
    duration_ms: float = 0.0
    # How this request was answered: "direct" (no LLM call, deterministic
    # routing), or "llm" (went through the provider tool loop).
    routed: str = "llm"

    _start: float = field(default_factory=time.perf_counter, repr=False, compare=False)

    def add_usage(self, input_tokens: int | None, output_tokens: int | None, total_tokens: int | None) -> None:
        """Accumulate token usage across possibly-multiple LLM calls in one
        request. None means "provider didn't report it" and must not be
        treated as 0 -- once any call is missing usage, the running total
        becomes unknown (None) rather than silently under-counting."""
        for attr, value in (("input_tokens", input_tokens), ("output_tokens", output_tokens), ("total_tokens", total_tokens)):
            current = getattr(self, attr)
            if current is None and self.llm_calls <= 1:
                setattr(self, attr, value)
            elif value is None:
                setattr(self, attr, None)
            elif current is not None:
                setattr(self, attr, current + value)

    def finish(self) -> "RequestTelemetry":
        self.duration_ms = round((time.perf_counter() - self._start) * 1000, 1)
        return self

    def to_dict(self) -> dict:
        return {
            "provider": self.provider, "model": self.model,
            "llm_calls": self.llm_calls, "tool_calls": list(self.tool_calls),
            "input_tokens": self.input_tokens, "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens, "duration_ms": self.duration_ms,
            "routed": self.routed,
        }

    def log_line(self) -> str:
        tokens = (
            f"input_tokens={self.input_tokens} output_tokens={self.output_tokens} total_tokens={self.total_tokens}"
            if self.total_tokens is not None else "tokens=unreported"
        )
        return (
            f"assistant request: provider={self.provider} model={self.model} routed={self.routed} "
            f"llm_calls={self.llm_calls} tool_calls={self.tool_calls} {tokens} duration_ms={self.duration_ms}"
        )
