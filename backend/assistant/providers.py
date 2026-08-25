"""
LLM provider abstraction for the assistant.

AssistantService talks only to the LLMProvider interface below -- it never
calls any provider's HTTP API directly. Swapping LLM_PROVIDER=groq for
LLM_PROVIDER=gemini (or any other supported name) requires no changes to
AssistantService or the tool-dispatch loop, only a new provider class and a
line in get_provider().

Every hosted provider except Ollama speaks the same OpenAI-compatible
chat-completions wire format (Groq, Gemini, Cerebras, and Cloudflare Workers
AI's OpenAI-compatible endpoint all do), so OpenAICompatibleProvider factors
out that shared request/retry/parse logic once; each concrete provider is
just base_url + auth + default model.
"""
from __future__ import annotations

import abc
import json
import logging
import os
import re
import time
from dataclasses import dataclass, field
from typing import Any

import requests

logger = logging.getLogger("shelf_life.assistant")


def _parse_retry_after(resp: requests.Response) -> float | None:
    header = resp.headers.get("Retry-After")
    if header:
        try:
            return float(header)
        except ValueError:
            pass
    match = re.search(r"try again in ([\d.]+)s", resp.text)
    return float(match.group(1)) if match else None


class ProviderUnavailableError(RuntimeError):
    """Raised for infra/transient failures a caller may reasonably retry on
    a different provider: exhausted 429 retries, timeouts, connection
    failures, temporary 5xx. Deliberately NOT raised for hard failures
    (missing API key, 4xx other than 429, malformed request) -- those are
    real bugs that falling back to another provider would only hide."""


@dataclass
class ProviderMessage:
    """Normalized shape every provider must return from chat(), regardless
    of how the underlying API represents assistant turns, tool calls, and
    usage accounting."""
    content: str | None
    tool_calls: list[dict[str, Any]] = field(default_factory=list)
    raw: dict[str, Any] | None = None
    # Normalized token usage, when the provider reports it. None (not 0)
    # when the provider gives no usage info, so callers can distinguish
    # "used zero tokens" from "unknown."
    input_tokens: int | None = None
    output_tokens: int | None = None
    total_tokens: int | None = None


class LLMProvider(abc.ABC):
    # Whether this provider's wire format wants function.arguments as a
    # JSON-encoded string (OpenAI-compatible) rather than a parsed object
    # (Ollama) when an assistant tool-call message is echoed back into
    # history.
    ARGS_AS_JSON_STRING: bool = False

    # Human-readable name used in telemetry/benchmark output.
    name: str = "unknown"

    @abc.abstractmethod
    def chat(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ProviderMessage:
        """messages: OpenAI-style [{role, content, ...}]. tools: OpenAI-style
        function-calling tool specs. Must return a ProviderMessage."""
        raise NotImplementedError


class OllamaProvider(LLMProvider):
    """Talks to a local Ollama server's /api/chat endpoint (OpenAI-compatible
    tool-calling support since Ollama 0.3+). Never called from Next.js --
    only ever invoked from this backend process. Local development only;
    not required for a deployed production instance."""

    name = "ollama"

    def __init__(self, base_url: str | None = None, model: str | None = None, timeout: float = 180.0):
        self.base_url = (base_url or os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")).rstrip("/")
        # qwen3:4b was tried as a faster default but on this CPU it doesn't
        # reliably use structured tool calls -- it narrates its reasoning as
        # plain content instead of calling the tool, which breaks the "never
        # invent numbers" guarantee. qwen3:8b follows the tool-calling format
        # correctly, so it stays the default despite being slower per round.
        self.model = model or os.environ.get("OLLAMA_MODEL", "qwen3:8b")
        self.timeout = timeout

    def chat(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ProviderMessage:
        payload = {
            "model": self.model,
            "messages": messages,
            "tools": tools,
            "stream": False,
            "think": False,  # qwen3's chain-of-thought adds ~30-70s of latency on CPU for no
                              # accuracy benefit on these tool-routing decisions; keep it off.
            "options": {"temperature": 0.2, "num_predict": 300},  # bound worst-case generation length
        }
        try:
            resp = requests.post(f"{self.base_url}/api/chat", json=payload, timeout=self.timeout)
            resp.raise_for_status()
        except requests.exceptions.ConnectionError as exc:
            raise ProviderUnavailableError(
                f"Could not reach Ollama at {self.base_url}. Is it running? Start it with `ollama serve` "
                f"(or the desktop app) and make sure `{self.model}` is pulled (`ollama pull {self.model}`)."
            ) from exc
        except requests.exceptions.Timeout as exc:
            raise ProviderUnavailableError(f"Ollama at {self.base_url} timed out after {self.timeout}s.") from exc
        data = resp.json()
        message = data.get("message", {})
        tool_calls = []
        for i, tc in enumerate(message.get("tool_calls", []) or []):
            fn = tc.get("function", {})
            tool_calls.append({
                "id": tc.get("id") or f"call_{i}",
                "name": fn.get("name"), "arguments": fn.get("arguments") or {},
            })
        # Ollama reports token counts as prompt_eval_count/eval_count, not an
        # OpenAI-style "usage" object -- normalize into the same fields.
        input_tokens = data.get("prompt_eval_count")
        output_tokens = data.get("eval_count")
        total_tokens = (input_tokens + output_tokens) if (input_tokens is not None and output_tokens is not None) else None
        return ProviderMessage(
            content=message.get("content"), tool_calls=tool_calls, raw=data,
            input_tokens=input_tokens, output_tokens=output_tokens, total_tokens=total_tokens,
        )


class OpenAICompatibleProvider(LLMProvider):
    """Shared implementation for every provider that speaks OpenAI's
    /chat/completions wire format: Groq, Gemini (via its OpenAI-compat
    endpoint), Cerebras, and Cloudflare Workers AI (via its OpenAI-compat
    endpoint). Subclasses only need to set base_url/api_key/model/env names
    in __init__ -- request building, 429 retry, tool-call parsing, and usage
    extraction are implemented once here.
    """

    ARGS_AS_JSON_STRING = True

    # Set by subclasses.
    base_url: str
    api_key: str
    model: str
    api_key_env_var: str = ""

    def __init__(self, timeout: float = 60.0):
        self.timeout = timeout

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}"}

    def _require_api_key(self) -> None:
        if not self.api_key:
            raise RuntimeError(
                f"{self.api_key_env_var} is not set; cannot use LLM_PROVIDER={self.name}."
            )

    def chat(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ProviderMessage:
        self._require_api_key()
        payload: dict[str, Any] = {
            "model": self.model, "messages": messages, "temperature": 0.2,
            "max_tokens": 400,  # keep completions short by default; this is an in-app assistant, not a chat product
        }
        if tools:
            payload["tools"] = tools

        try:
            resp = requests.post(f"{self.base_url}/chat/completions", json=payload, headers=self._headers(), timeout=self.timeout)
        except requests.exceptions.Timeout as exc:
            raise ProviderUnavailableError(f"{self.name} timed out after {self.timeout}s.") from exc
        except requests.exceptions.ConnectionError as exc:
            raise ProviderUnavailableError(f"Could not reach {self.name} at {self.base_url}.") from exc

        # Free-tier accounts commonly have a low requests/tokens-per-minute
        # limit that a tool-heavy system prompt can trip; most of these APIs
        # name the exact wait in the 429 body, so retry a couple of times
        # instead of failing the whole turn outright.
        for _ in range(3):
            if resp.status_code != 429:
                break
            wait_s = _parse_retry_after(resp) or 2.0
            time.sleep(min(wait_s, 10.0))
            try:
                resp = requests.post(f"{self.base_url}/chat/completions", json=payload, headers=self._headers(), timeout=self.timeout)
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as exc:
                raise ProviderUnavailableError(f"{self.name} became unreachable during 429 retry.") from exc

        if resp.status_code == 429:
            raise ProviderUnavailableError(f"{self.name} rate-limited (429) after retries: {resp.text[:500]}")
        if resp.status_code >= 500:
            raise ProviderUnavailableError(f"{self.name} server error {resp.status_code}: {resp.text[:500]}")
        if not resp.ok:
            raise RuntimeError(f"{self.name} API error {resp.status_code}: {resp.text[:1000]}")

        data = resp.json()
        message = data["choices"][0]["message"]
        tool_calls = []
        for i, tc in enumerate(message.get("tool_calls", []) or []):
            fn = tc.get("function", {})
            args = fn.get("arguments")
            if isinstance(args, str):
                try:
                    args = json.loads(args)
                except ValueError:
                    args = {}
            tool_calls.append({
                "id": tc.get("id") or f"call_{i}",
                "name": fn.get("name"), "arguments": args or {},
            })

        usage = data.get("usage") or {}
        return ProviderMessage(
            content=message.get("content"), tool_calls=tool_calls, raw=data,
            input_tokens=usage.get("prompt_tokens"),
            output_tokens=usage.get("completion_tokens"),
            total_tokens=usage.get("total_tokens"),
        )


class GroqProvider(OpenAICompatibleProvider):
    """Groq's OpenAI-compatible chat-completions API. Fast (~1-3s/turn) but
    the free tier's tokens-per-minute quota is tight for a tool-heavy system
    prompt -- kept as a fallback/comparison option, not the default."""

    name = "groq"
    api_key_env_var = "GROQ_API_KEY"

    def __init__(self, api_key: str | None = None, model: str | None = None, timeout: float = 60.0):
        super().__init__(timeout=timeout)
        self.api_key = api_key or os.environ.get("GROQ_API_KEY", "")
        self.model = model or os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.base_url = "https://api.groq.com/openai/v1"


class GeminiProvider(OpenAICompatibleProvider):
    """Google Gemini via its OpenAI-compatible endpoint
    (https://ai.google.dev/gemini-api/docs/openai) -- same request/response
    shape as Groq, just a different base_url/model. Free tier as of writing:
    gemini-2.5-flash (15 RPM / 1,500 RPD), gemini-2.5-flash-lite for a higher
    free RPD if 2.5-flash's request-per-minute limit is the bottleneck."""

    name = "gemini"
    api_key_env_var = "GEMINI_API_KEY"

    def __init__(self, api_key: str | None = None, model: str | None = None, timeout: float = 60.0):
        super().__init__(timeout=timeout)
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.model = model or os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/openai"


class CerebrasProvider(OpenAICompatibleProvider):
    """Cerebras Inference's OpenAI-compatible chat-completions API. Free
    tier as of writing: 1M tokens/day, 14,400 requests/day, 30 requests/min,
    an 8K context cap -- and very low latency (Cerebras' wafer-scale
    hardware), which matters more than raw model size for a tool-routing
    assistant."""

    name = "cerebras"
    api_key_env_var = "CEREBRAS_API_KEY"

    def __init__(self, api_key: str | None = None, model: str | None = None, timeout: float = 60.0):
        super().__init__(timeout=timeout)
        self.api_key = api_key or os.environ.get("CEREBRAS_API_KEY", "")
        self.model = model or os.environ.get("CEREBRAS_MODEL", "llama-3.3-70b")
        self.base_url = "https://api.cerebras.ai/v1"


class CloudflareProvider(OpenAICompatibleProvider):
    """Cloudflare Workers AI via its OpenAI-compatible endpoint
    (https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1).
    Free tier as of writing: 10,000 Neurons/day (a compute-time budget, not
    a token count -- practically small, so this is best used as a fallback
    rather than the sole production provider). Function-calling support is
    model-dependent; @cf/meta/llama-3.1-8b-instruct is a confirmed default."""

    name = "cloudflare"
    api_key_env_var = "CLOUDFLARE_API_TOKEN"

    def __init__(
        self, account_id: str | None = None, api_key: str | None = None,
        model: str | None = None, timeout: float = 60.0,
    ):
        super().__init__(timeout=timeout)
        self.account_id = account_id or os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
        self.api_key = api_key or os.environ.get("CLOUDFLARE_API_TOKEN", "")
        self.model = model or os.environ.get("CLOUDFLARE_MODEL", "@cf/meta/llama-3.1-8b-instruct")
        if not self.account_id:
            raise RuntimeError("CLOUDFLARE_ACCOUNT_ID is not set; cannot use LLM_PROVIDER=cloudflare.")
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/ai/v1"


class FallbackProvider(LLMProvider):
    """Wraps a primary provider with an ordered list of fallback providers.
    Tries the primary; on ProviderUnavailableError only (infra/quota/timeout
    failures -- never a hard bug like a bad request), tries the next
    provider in order. One provider serves each request normally; fallback
    only runs when the primary actually fails, never as a fan-out."""

    def __init__(self, primary: LLMProvider, fallbacks: list[LLMProvider]):
        self.primary = primary
        self.fallbacks = fallbacks
        self.name = primary.name  # telemetry defaults to the primary; chat() reports who actually answered

    @property
    def ARGS_AS_JSON_STRING(self) -> bool:  # depends on whichever provider actually answers
        return self._last_provider.ARGS_AS_JSON_STRING if hasattr(self, "_last_provider") else self.primary.ARGS_AS_JSON_STRING

    def chat(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ProviderMessage:
        chain = [self.primary, *self.fallbacks]
        last_exc: Exception | None = None
        for i, provider in enumerate(chain):
            try:
                result = provider.chat(messages, tools)
                self._last_provider = provider
                self.name = provider.name
                if i > 0:
                    logger.warning("assistant fallback: %s failed, %s handled the request", chain[0].name, provider.name)
                return result
            except ProviderUnavailableError as exc:
                last_exc = exc
                logger.warning("assistant provider %s unavailable (%s), trying next", provider.name, exc)
                continue
        assert last_exc is not None
        raise last_exc


_PROVIDER_CLASSES: dict[str, type[LLMProvider]] = {
    "ollama": OllamaProvider,
    "groq": GroqProvider,
    "gemini": GeminiProvider,
    "cerebras": CerebrasProvider,
    "cloudflare": CloudflareProvider,
}


def _build_provider(name: str) -> LLMProvider:
    cls = _PROVIDER_CLASSES.get(name)
    if cls is None:
        raise ValueError(f"Unknown LLM_PROVIDER: {name!r} (expected one of {sorted(_PROVIDER_CLASSES)})")
    return cls()


def get_provider(name: str | None = None) -> LLMProvider:
    name = (name or os.environ.get("LLM_PROVIDER", "ollama")).lower()
    primary = _build_provider(name)

    fallback_names = [n.strip().lower() for n in os.environ.get("LLM_FALLBACK_PROVIDERS", "").split(",") if n.strip()]
    if not fallback_names:
        return primary
    fallbacks = [_build_provider(n) for n in fallback_names if n != name]
    return FallbackProvider(primary, fallbacks)
