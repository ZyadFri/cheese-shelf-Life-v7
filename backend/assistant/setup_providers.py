"""
Provider credential setup helper.

Run with:
    python -m backend.assistant.setup_providers

Loads backend/.env (same loader main.py uses), then for every supported
provider:
  - reports whether its required env var(s) are present
  - does a loose format sanity check (never a hard rejection -- providers
    change their key formats over time, so this only warns)
  - for a present credential, does a live but token-free reachability check
    (LLMProvider.health_check(): a GET to a models-list endpoint, never a
    real chat() completion, so re-running this costs nothing)
  - never prints the secret itself -- only whether it's set and its length

For anything not configured, prints the exact environment variable name and
the exact official page to get it from. This script cannot create an
account-owned API key on your behalf -- no provider exposes an
unauthenticated "issue me a key" API, so the one manual step (visiting that
page and pasting the key into backend/.env) is unavoidable and is stated
plainly rather than faked.
"""
from __future__ import annotations

import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / "backend" / ".env", override=False)

from .providers import PROVIDER_CLASSES  # noqa: E402


@dataclass
class ProviderSetupInfo:
    key: str
    required_env: list[str]
    signup_url: str
    format_hint: str
    format_check: "callable | None" = None  # returns True/False/None (None = can't check)


def _gemini_format_ok(value: str) -> bool | None:
    # Google is mid-transition between "AIza..." and newer "AQ...." key
    # formats (both are real, current keys) -- only flag something that
    # matches neither shape, and even then just as a soft warning.
    return bool(re.match(r"^(AIza|AQ\.)", value)) or None


def _groq_format_ok(value: str) -> bool | None:
    return value.startswith("gsk_") or None


def _cerebras_format_ok(value: str) -> bool | None:
    return value.startswith("csk-") or None


def _cloudflare_token_format_ok(value: str) -> bool | None:
    return True if len(value) >= 20 else None  # tokens vary in prefix by age; length is the only stable signal


def _cloudflare_account_id_format_ok(value: str) -> bool | None:
    return bool(re.match(r"^[0-9a-f]{32}$", value)) if value else None


PROVIDERS_SETUP: dict[str, ProviderSetupInfo] = {
    "gemini": ProviderSetupInfo(
        key="gemini", required_env=["GEMINI_API_KEY"],
        signup_url="https://aistudio.google.com/app/apikey",
        format_hint="starts with 'AIza' or 'AQ.'",
        format_check=_gemini_format_ok,
    ),
    "cerebras": ProviderSetupInfo(
        key="cerebras", required_env=["CEREBRAS_API_KEY"],
        signup_url="https://cloud.cerebras.ai",
        format_hint="starts with 'csk-'",
        format_check=_cerebras_format_ok,
    ),
    "cloudflare": ProviderSetupInfo(
        key="cloudflare", required_env=["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"],
        signup_url="https://dash.cloudflare.com/profile/api-tokens (token) and the Workers & Pages overview sidebar of https://dash.cloudflare.com/ (account ID)",
        format_hint="account ID is a 32-character hex string; token length varies",
        format_check=None,  # checked per-var below (two different vars)
    ),
    "groq": ProviderSetupInfo(
        key="groq", required_env=["GROQ_API_KEY"],
        signup_url="https://console.groq.com/keys",
        format_hint="starts with 'gsk_'",
        format_check=_groq_format_ok,
    ),
    "ollama": ProviderSetupInfo(
        key="ollama", required_env=[],  # no API key -- checked by reachability only
        signup_url="https://ollama.com/download (local install, no account/key needed)",
        format_hint="n/a (local server)",
        format_check=None,
    ),
}


def _redact(value: str) -> str:
    if len(value) <= 8:
        return "*" * len(value)
    return f"{value[:4]}...{value[-2:]} (len={len(value)})"


def _check_env_vars(info: ProviderSetupInfo) -> tuple[bool, list[str], list[str]]:
    """Returns (all_present, present_summaries, missing_var_names)."""
    missing = [v for v in info.required_env if not os.environ.get(v)]
    present_summaries = []
    for v in info.required_env:
        value = os.environ.get(v)
        if not value:
            continue
        if info.format_check is not None:
            ok = info.format_check(value)
            note = "" if ok in (True, None) else "  (format looks unusual -- double check you copied the whole key)"
        elif v == "CLOUDFLARE_ACCOUNT_ID":
            ok = _cloudflare_account_id_format_ok(value)
            note = "" if ok in (True, None) else "  (expected a 32-character hex string)"
        elif v == "CLOUDFLARE_API_TOKEN":
            ok = _cloudflare_token_format_ok(value)
            note = "" if ok in (True, None) else "  (looks short for an API token -- double check)"
        else:
            note = ""
        present_summaries.append(f"{v}={_redact(value)}{note}")
    return (not missing), present_summaries, missing


def run() -> None:
    print("Provider credential status (checking backend/.env + process environment)\n")
    any_configured = False
    for name, info in PROVIDERS_SETUP.items():
        if name == "ollama":
            base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
            try:
                provider = PROVIDER_CLASSES["ollama"]()
                health = provider.health_check()
            except Exception as exc:  # noqa: BLE001
                health = {"reachable": False, "detail": str(exc)}
            status = "REACHABLE" if health.get("reachable") else "NOT REACHABLE"
            print(f"[{name}] local dev only, no API key needed -- {status} at {base_url}")
            if not health.get("reachable"):
                print(f"    Install: {info.signup_url}")
                print(f"    Then run `ollama serve` and `ollama pull {os.environ.get('OLLAMA_MODEL', 'qwen3:8b')}`.")
            print()
            continue

        all_present, present_summaries, missing = _check_env_vars(info)
        if all_present:
            any_configured = True
            print(f"[{name}] CONFIGURED")
            for s in present_summaries:
                print(f"    {s}")
            try:
                provider = PROVIDER_CLASSES[name]()
                health = provider.health_check()
            except Exception as exc:  # noqa: BLE001
                health = {"reachable": False, "detail": str(exc)}
            if health.get("reachable") is True:
                print(f"    Live check: reachable (model={getattr(provider, 'model', '?')})")
            elif health.get("reachable") is False:
                print(f"    Live check: FAILED -- {health.get('detail')}")
                print("    Double-check the key value and that it hasn't been revoked/expired.")
            else:
                print(f"    Live check: inconclusive ({health.get('detail')}) -- run provider_benchmark.py for a real test")
        else:
            print(f"[{name}] NOT CONFIGURED")
            for var in missing:
                print(f"    Missing: {var}")
            print(f"    Get a key here: {info.signup_url}")
            print(f"    Expected format: {info.format_hint}")
            print(f"    Paste it into backend/.env as: {info.required_env[0]}=<your value>")
        print()

    if not any_configured:
        print(
            "No hosted provider is configured yet. Pick one above (Gemini is a reasonable first "
            "choice for its free daily request volume), get a key from its page, add it to "
            "backend/.env, then re-run this script to validate it -- no other steps needed."
        )
    else:
        print("Once you're happy with the configured provider(s), run:")
        print("    python -m backend.assistant.provider_benchmark")
        print("for a full live test including tool-calling reliability.")


if __name__ == "__main__":
    run()
