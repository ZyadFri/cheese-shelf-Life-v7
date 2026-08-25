"""
Deterministic pre-LLM routing for the assistant.

A narrow set of question shapes have a single, unambiguous, already-known
answer (a feature definition, the project overview, "which model is best")
-- routing these directly to FEATURE_GLOSSARY / PROJECT_OVERVIEW / ModelService
skips the LLM (and its tool-calling round trip) entirely: 0 API calls, 0
tokens, instant response, and by construction no chance of a hallucinated
number, since every value returned here is read straight from the same
sources the tools use.

This is intentionally NOT a general intent classifier. Every matcher below
only fires when the question shape AND the subject are both unambiguous; any
question that doesn't cleanly match falls through (returns None) to the
normal LLM + tool-calling path. When in doubt, don't route -- let the model
handle it with tools.
"""
from __future__ import annotations

import re
from typing import Any

from model_service import ModelService

from .tools import FEATURE_GLOSSARY, PROJECT_OVERVIEW

# Common natural-language phrasings for a handful of the most-asked features,
# mapped to their exact FEATURE_GLOSSARY key. Deliberately short and
# hand-curated (not auto-derived from column names) so every entry is a
# phrase a user would actually type and that unambiguously means one
# feature -- add more only when both of those hold.
_FEATURE_ALIASES: dict[str, str] = {
    "water activity": "matrix_water_activity",
    "aw": "matrix_water_activity",
    "ph": "matrix_ph",
    "moisture": "matrix_moisture_pct",
    "moisture content": "matrix_moisture_pct",
    "fat content": "matrix_fat_pct",
    "protein content": "matrix_protein_pct",
    "salt content": "matrix_salt_pct",
    "ripening days": "matrix_ripening_days",
    "ripening time": "matrix_ripening_days",
    "pasteurization": "pasteurization_applied",
    "storage temperature": "storage_temperature_c",
    "packaging type": "packaging_type",
    "headspace oxygen": "headspace_oxygen_pct",
    "headspace co2": "headspace_co2_pct",
    "headspace carbon dioxide": "headspace_co2_pct",
    "headspace nitrogen": "headspace_n2_pct",
    "shelf life": "shelf_life_days",
    "shelf life days": "shelf_life_days",
}

_GLOSSARY_QUESTION_PATTERNS = [
    re.compile(r"^what\s+(?:is|are)\s+(?:a\s+|an\s+|the\s+)?(.+?)\??$"),
    re.compile(r"^what\s+does\s+(.+?)\s+mean\??$"),
    re.compile(r"^define\s+(.+?)\??$"),
    re.compile(r"^explain\s+(?:what\s+)?(.+?)(?:\s+means?)?\??$"),
]

_OVERVIEW_PATTERNS = [
    re.compile(r"^what\s+is\s+this\s+(?:project|app|application|tool|platform)(?:\s+about)?\??$"),
    re.compile(r"^what\s+does\s+this\s+(?:project|app|application|tool|platform)\s+do\??$"),
    re.compile(r"^tell\s+me\s+about\s+(?:this\s+project|shelf.?life\s+studio)\??$"),
    re.compile(r"^what('?s|\s+is)\s+shelf.?life\s+studio\??$"),
]

_BEST_MODEL_PATTERNS = [
    re.compile(r"^which\s+model\s+(?:is\s+)?(?:currently\s+)?(?:the\s+)?best\??$"),
    re.compile(r"^which\s+model\s+performs\s+(?:the\s+)?best\??$"),
    re.compile(r"^what('?s|\s+is)\s+the\s+best\s+model\??$"),
    re.compile(r"^which\s+model\s+is\s+(?:currently\s+)?selected\??$"),
]


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower()).strip(" ?.!")


def match_feature_glossary(text: str) -> dict[str, Any] | None:
    """Returns {"feature": key, "reply": str} if `text` unambiguously asks
    for one known feature's definition, else None."""
    t = _normalize(text)
    for pattern in _GLOSSARY_QUESTION_PATTERNS:
        m = pattern.match(t)
        if not m:
            continue
        phrase = re.sub(r"\s+in\s+this\s+(?:project|dataset|app)$", "", m.group(1).strip())
        candidate_key = phrase.replace(" ", "_")
        key = candidate_key if candidate_key in FEATURE_GLOSSARY else _FEATURE_ALIASES.get(phrase)
        if key is None:
            return None  # matched a "define X" shape but X isn't a known feature -- let the LLM handle it
        return {"feature": key, "reply": f"**{key}**: {FEATURE_GLOSSARY[key]}"}
    return None


def match_project_overview(text: str, svc: ModelService) -> dict[str, Any] | None:
    t = _normalize(text)
    if not any(p.match(t) for p in _OVERVIEW_PATTERNS):
        return None
    lines = [PROJECT_OVERVIEW["purpose"], "", "Pipeline:"] + [f"- {step}" for step in PROJECT_OVERVIEW["pipeline"]]
    lines += ["", f"Current best model: {svc.model_label(svc.best_model)}."]
    return {"reply": "\n".join(lines)}


def match_best_model(text: str, svc: ModelService) -> dict[str, Any] | None:
    t = _normalize(text)
    if not any(p.match(t) for p in _BEST_MODEL_PATTERNS):
        return None
    metrics = svc.metrics[svc.best_model]
    reply = (
        f"**{svc.model_label(svc.best_model)}** is currently the best model, selected by lowest validation RMSE "
        f"(validation R²={metrics['validation_r2']:.3f}, RMSE={metrics['validation_rmse']:.2f} days)."
    )
    return {"reply": reply}


def try_direct_answer(text: str, svc: ModelService) -> dict[str, Any] | None:
    """Tries every narrow matcher in order; returns the first hit's
    {"reply": str, "routed": str} or None if nothing matched (caller should
    fall back to the normal LLM + tool loop)."""
    hit = match_feature_glossary(text)
    if hit:
        return {"reply": hit["reply"], "routed": "glossary"}
    hit = match_project_overview(text, svc)
    if hit:
        return {"reply": hit["reply"], "routed": "overview"}
    hit = match_best_model(text, svc)
    if hit:
        return {"reply": hit["reply"], "routed": "best_model"}
    return None
