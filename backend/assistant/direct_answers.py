"""
Deterministic pre-LLM routing for the assistant.

A narrow set of question shapes have a single, unambiguous, already-known
answer (a feature definition, the project overview, "what is classification",
"what is ingredient ranking") -- routing these directly to
FEATURE_GLOSSARY / PROJECT_OVERVIEW / the relevant service's own data skips
the LLM (and its tool-calling round trip) entirely: 0 API calls, 0 tokens,
instant response, and by construction no chance of a hallucinated number,
since every value returned here is read straight from the same sources the
tools use.

This is intentionally NOT a general intent classifier. Every matcher below
only fires when the question shape AND the subject are both unambiguous; any
question that doesn't cleanly match falls through (returns None) to the
normal LLM + tool-calling path. When in doubt, don't route -- let the model
handle it with tools.
"""
from __future__ import annotations

import re
from typing import Any

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

# "What is formulation classification" / "what does classification mean" --
# deliberately requires the word "classification" itself (not just "class"
# or "tier") so this never fires on an unrelated "what is X" question.
_CLASSIFICATION_OVERVIEW_PATTERNS = [
    re.compile(r"^what\s+is\s+(?:the\s+)?(?:formulation\s+)?(?:efficacy\s+)?classification(?:\s+feature)?\??$"),
    re.compile(r"^what\s+does\s+(?:formulation\s+)?classification\s+mean\??$"),
    re.compile(r"^explain\s+(?:formulation\s+)?(?:efficacy\s+)?classification\??$"),
    re.compile(r"^how\s+does\s+(?:the\s+)?classification\s+work\??$"),
]

_INGREDIENT_RANKING_OVERVIEW_PATTERNS = [
    re.compile(r"^what\s+is\s+(?:the\s+)?ingredient\s+(?:efficacy\s+)?ranking\??$"),
    re.compile(r"^what\s+does\s+ingredient\s+ranking\s+mean\??$"),
    re.compile(r"^explain\s+ingredient\s+ranking\??$"),
    re.compile(r"^how\s+does\s+(?:the\s+)?ingredient\s+ranking\s+work\??$"),
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


def match_project_overview(text: str, services: dict[str, Any]) -> dict[str, Any] | None:
    t = _normalize(text)
    if not any(p.match(t) for p in _OVERVIEW_PATTERNS):
        return None
    lines = [PROJECT_OVERVIEW["purpose"], "", "Current systems:"] + [f"- {step}" for step in PROJECT_OVERVIEW["systems"]]
    svc = services.get("model_service")
    if svc is not None:
        lines += ["", f"Legacy global regression model (Modeling/Results pages): {svc.model_label(svc.best_model)}."]
    return {"reply": "\n".join(lines)}


def match_classification_overview(text: str, services: dict[str, Any]) -> dict[str, Any] | None:
    t = _normalize(text)
    if not any(p.match(t) for p in _CLASSIFICATION_OVERVIEW_PATTERNS):
        return None
    clf = services.get("classification_service")
    if clf is None:
        return {"reply": "Formulation efficacy classification predicts whether a treated formulation falls in a Low, Medium, or High shelf-life-improvement tier versus a matched control. (The classifier's artifacts aren't loaded on this instance, so live tier thresholds aren't available right now.)"}
    cd = clf.class_definitions
    return {"reply": f"{cd['description']} Currently served by {clf.model_label(clf.best_model)}."}


def match_ingredient_ranking_overview(text: str, services: dict[str, Any]) -> dict[str, Any] | None:
    t = _normalize(text)
    if not any(p.match(t) for p in _INGREDIENT_RANKING_OVERVIEW_PATTERNS):
        return None
    ing = services.get("ingredient_ranking_service")
    if ing is None:
        return {"reply": "Ingredient efficacy ranking scores individual ingredients by their own context-adjusted effect on shelf life, separate from any one formulation. (The ranking artifacts aren't loaded on this instance right now.)"}
    cd = ing.class_definitions
    return {"reply": f"{cd['description']} Currently ranks {len(ing.rankings)} ingredients."}


def match_best_model(text: str, services: dict[str, Any]) -> dict[str, Any] | None:
    """Deliberately does NOT answer with the legacy global model alone --
    this app has four separate model families (specialist shelf-life,
    formulation classifier, ingredient ranking's fixed regression, and the
    legacy global model), each with its own notion of "best." A bare,
    unqualified "which model is best" is genuinely ambiguous; this routes
    to a short disambiguating summary built from whichever services are
    actually loaded, rather than picking one and presenting it as the
    app's single answer."""
    t = _normalize(text)
    if not any(p.match(t) for p in _BEST_MODEL_PATTERNS):
        return None

    lines = ["Shelf-Life Studio has no single \"best model\" -- it depends which system you mean:"]
    reg = services.get("specialist_registry")
    if reg is not None:
        n_loaded = sum(1 for tasks in reg.services.values() for svc in tasks.values() if svc is not None)
        lines.append(f"- Specialist shelf-life prediction: {n_loaded} specialists loaded (one per cheese category x task), each independently best-fit -- ask about a specific category/task for its model.")
    clf = services.get("classification_service")
    if clf is not None:
        lines.append(f"- Formulation efficacy classification: {clf.model_label(clf.best_model)} (selected by validation macro F1).")
    ing = services.get("ingredient_ranking_service")
    if ing is not None:
        lines.append("- Ingredient efficacy ranking: a single fixed-effects ridge regression, not a competitive model selection.")
    svc = services.get("model_service")
    if svc is not None:
        lines.append(f"- Legacy global regression model (Modeling/Results pages): {svc.model_label(svc.best_model)} (selected by validation RMSE).")
    return {"reply": "\n".join(lines)}


def try_direct_answer(text: str, services: dict[str, Any]) -> dict[str, Any] | None:
    """Tries every narrow matcher in order; returns the first hit's
    {"reply": str, "routed": str} or None if nothing matched (caller should
    fall back to the normal LLM + tool loop)."""
    hit = match_feature_glossary(text)
    if hit:
        return {"reply": hit["reply"], "routed": "glossary"}
    hit = match_project_overview(text, services)
    if hit:
        return {"reply": hit["reply"], "routed": "overview"}
    hit = match_classification_overview(text, services)
    if hit:
        return {"reply": hit["reply"], "routed": "classification_overview"}
    hit = match_ingredient_ranking_overview(text, services)
    if hit:
        return {"reply": hit["reply"], "routed": "ingredient_ranking_overview"}
    hit = match_best_model(text, services)
    if hit:
        return {"reply": hit["reply"], "routed": "best_model"}
    return None
