#!/usr/bin/env python
"""
Provider-level tests for backend/assistant/providers.py: 429 retry/backoff,
the retryable-vs-hard-failure classification that gates fallback, usage
(token) parsing, and FallbackProvider's switchover behavior. All via mocked
HTTP (unittest.mock) -- no network calls, no credentials required, and
therefore always runnable regardless of what's configured in backend/.env.

Live behavior against real provider APIs is covered separately by
provider_benchmark.py, which only runs against providers that actually have
credentials configured.

Usage: python -m pytest test_assistant_providers.py -v
"""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from backend.assistant.providers import (
    CerebrasProvider,
    FallbackProvider,
    GeminiProvider,
    GroqProvider,
    ProviderMessage,
    ProviderUnavailableError,
    get_provider,
)


def _resp(status: int, json_body: dict | None = None, headers: dict | None = None, text: str = ""):
    r = MagicMock()
    r.status_code = status
    r.ok = 200 <= status < 300
    r.json.return_value = json_body or {}
    r.headers = headers or {}
    r.text = text
    return r


@pytest.fixture()
def gemini_provider(monkeypatch) -> GeminiProvider:
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key-for-mock-test")
    return GeminiProvider()


def test_happy_path_parses_tool_call_and_usage(gemini_provider: GeminiProvider) -> None:
    fake_response = _resp(200, {
        "choices": [{"message": {
            "content": None,
            "tool_calls": [{"id": "call_1", "function": {"name": "get_model_metrics", "arguments": '{"model": "lightgbm"}'}}],
        }}],
        "usage": {"prompt_tokens": 120, "completion_tokens": 15, "total_tokens": 135},
    })
    with patch("requests.post", return_value=fake_response) as mock_post:
        msg = gemini_provider.chat(
            [{"role": "user", "content": "which model is best"}],
            tools=[{"type": "function", "function": {"name": "get_model_metrics"}}],
        )
    assert mock_post.call_count == 1
    assert msg.tool_calls == [{"id": "call_1", "name": "get_model_metrics", "arguments": {"model": "lightgbm"}}]
    assert (msg.input_tokens, msg.output_tokens, msg.total_tokens) == (120, 15, 135)


def test_429_retries_then_succeeds(gemini_provider: GeminiProvider) -> None:
    responses = [
        _resp(429, headers={"Retry-After": "0"}, text="rate limited"),
        _resp(429, headers={"Retry-After": "0"}, text="rate limited"),
        _resp(200, {"choices": [{"message": {"content": "ok", "tool_calls": []}}]}),
    ]
    with patch("requests.post", side_effect=responses) as mock_post:
        msg = gemini_provider.chat([{"role": "user", "content": "hi"}], tools=[])
    assert mock_post.call_count == 3
    assert msg.content == "ok"


def test_429_exhausted_raises_provider_unavailable(gemini_provider: GeminiProvider) -> None:
    responses = [_resp(429, headers={"Retry-After": "0"}, text="rate limited")] * 4
    with patch("requests.post", side_effect=responses):
        with pytest.raises(ProviderUnavailableError):
            gemini_provider.chat([{"role": "user", "content": "hi"}], tools=[])


def test_hard_400_does_not_raise_provider_unavailable(gemini_provider: GeminiProvider) -> None:
    """A malformed request is a real bug -- it must NOT be classified as
    fallback-eligible, or a broken tool schema would silently fail over to
    another provider instead of surfacing the actual problem."""
    with patch("requests.post", return_value=_resp(400, text="bad request: malformed tool schema")):
        with pytest.raises(RuntimeError) as exc_info:
            gemini_provider.chat([{"role": "user", "content": "hi"}], tools=[])
        assert not isinstance(exc_info.value, ProviderUnavailableError)


def test_5xx_raises_provider_unavailable(gemini_provider: GeminiProvider) -> None:
    with patch("requests.post", return_value=_resp(503, text="service unavailable")):
        with pytest.raises(ProviderUnavailableError):
            gemini_provider.chat([{"role": "user", "content": "hi"}], tools=[])


def test_402_payment_required_raises_provider_unavailable(gemini_provider: GeminiProvider) -> None:
    """A real live finding (Cerebras, 2026-08): an account without free-tier
    billing completed returns 402 for every model. This is account-level
    unavailability, not a malformed request, so it must be fallback-eligible
    like a 429 -- otherwise a configured fallback provider never gets a
    chance and the whole turn fails outright."""
    with patch("requests.post", return_value=_resp(402, text='{"message":"Payment required"}')):
        with pytest.raises(ProviderUnavailableError):
            gemini_provider.chat([{"role": "user", "content": "hi"}], tools=[])


def test_missing_api_key_fails_fast_with_no_network_call(monkeypatch) -> None:
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    provider = GeminiProvider()
    with patch("requests.post") as mock_post:
        with pytest.raises(RuntimeError) as exc_info:
            provider.chat([{"role": "user", "content": "hi"}], tools=[])
        assert mock_post.call_count == 0
        assert "GEMINI_API_KEY" in str(exc_info.value)


def test_missing_credentials_for_every_provider_reports_clear_env_var(monkeypatch) -> None:
    for env_var, cls in [
        ("GEMINI_API_KEY", GeminiProvider), ("CEREBRAS_API_KEY", CerebrasProvider), ("GROQ_API_KEY", GroqProvider),
    ]:
        monkeypatch.delenv(env_var, raising=False)
        provider = cls()
        with pytest.raises(RuntimeError) as exc_info:
            provider.chat([{"role": "user", "content": "hi"}], tools=[])
        assert env_var in str(exc_info.value)


def test_fallback_provider_switches_on_unavailable() -> None:
    class AlwaysUnavailable:
        name = "primary"
        ARGS_AS_JSON_STRING = True
        def chat(self, messages, tools):
            raise ProviderUnavailableError("simulated outage")

    class AlwaysWorks:
        name = "secondary"
        ARGS_AS_JSON_STRING = True
        def chat(self, messages, tools):
            return ProviderMessage(content="fallback answered", tool_calls=[])

    fb = FallbackProvider(AlwaysUnavailable(), [AlwaysWorks()])
    msg = fb.chat([{"role": "user", "content": "hi"}], tools=[])
    assert msg.content == "fallback answered"
    assert fb.name == "secondary"


def test_fallback_provider_does_not_fall_back_on_hard_error() -> None:
    """A hard (non-retryable) error must propagate, not trigger a silent
    fallback that could mask a real configuration bug."""
    class HardFailure:
        name = "primary"
        ARGS_AS_JSON_STRING = True
        def chat(self, messages, tools):
            raise RuntimeError("bad request: malformed schema")

    class ShouldNeverBeCalled:
        name = "secondary"
        ARGS_AS_JSON_STRING = True
        def chat(self, messages, tools):
            raise AssertionError("fallback must not run for a hard error")

    fb = FallbackProvider(HardFailure(), [ShouldNeverBeCalled()])
    with pytest.raises(RuntimeError, match="malformed schema"):
        fb.chat([{"role": "user", "content": "hi"}], tools=[])


def test_fallback_provider_exhausts_all_and_raises_last_error() -> None:
    class Unavailable1:
        name = "p1"
        ARGS_AS_JSON_STRING = True
        def chat(self, messages, tools):
            raise ProviderUnavailableError("p1 down")

    class Unavailable2:
        name = "p2"
        ARGS_AS_JSON_STRING = True
        def chat(self, messages, tools):
            raise ProviderUnavailableError("p2 down")

    fb = FallbackProvider(Unavailable1(), [Unavailable2()])
    with pytest.raises(ProviderUnavailableError, match="p2 down"):
        fb.chat([{"role": "user", "content": "hi"}], tools=[])


def test_get_provider_wires_fallback_from_env(monkeypatch) -> None:
    monkeypatch.setenv("LLM_PROVIDER", "gemini")
    monkeypatch.setenv("GEMINI_API_KEY", "fake")
    monkeypatch.setenv("LLM_FALLBACK_PROVIDERS", "groq")
    monkeypatch.setenv("GROQ_API_KEY", "fake")
    provider = get_provider()
    assert isinstance(provider, FallbackProvider)
    assert provider.primary.name == "gemini"
    assert provider.fallback_names == ["groq"]


def test_get_provider_without_fallback_env_returns_bare_provider(monkeypatch) -> None:
    monkeypatch.setenv("LLM_PROVIDER", "groq")
    monkeypatch.setenv("GROQ_API_KEY", "fake")
    monkeypatch.delenv("LLM_FALLBACK_PROVIDERS", raising=False)
    provider = get_provider()
    assert not isinstance(provider, FallbackProvider)
    assert provider.name == "groq"
