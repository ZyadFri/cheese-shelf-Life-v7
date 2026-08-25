#!/usr/bin/env python
"""
Tests for the assistant's deterministic pre-LLM routing (direct_answers.py),
tool-selection/result-shrinking helpers (tools.py), and backend/.env loading.
These are pure, provider-independent logic -- no LLM credentials required to
run this file.

Provider-level behavior (retry/fallback/tool-call parsing/usage extraction)
is covered separately in test_assistant_providers.py via mocked HTTP, and
live against real credentials by provider_benchmark.py.

Usage: python -m pytest test_assistant.py -v
"""
from __future__ import annotations

import os

import pytest

from backend.assistant.direct_answers import try_direct_answer
from backend.assistant.tools import FEATURE_GLOSSARY, TOOL_SPECS, _cap_counts, _round_floats, select_tools
from classification_service import ClassificationService
from ingredient_ranking_service import IngredientRankingService
from model_service import ModelService
from specialist_registry import SpecialistRegistry


@pytest.fixture(scope="module")
def services() -> dict:
    """Every service the assistant can query, exactly as backend/main.py
    wires them -- None for anything not built on this checkout, matching
    the app's own defensive-load pattern (never assume everything exists)."""
    model_service = ModelService()
    try:
        specialist_registry = SpecialistRegistry()
    except FileNotFoundError:
        specialist_registry = None
    try:
        classification_service = ClassificationService()
    except FileNotFoundError:
        classification_service = None
    try:
        ingredient_ranking_service = IngredientRankingService()
    except FileNotFoundError:
        ingredient_ranking_service = None
    return {
        "model_service": model_service,
        "specialist_registry": specialist_registry,
        "classification_service": classification_service,
        "ingredient_ranking_service": ingredient_ranking_service,
    }


# ── backend/.env loading ─────────────────────────────────────────────────────

def test_dotenv_loads_backend_env_file(tmp_path, monkeypatch) -> None:
    """Exercises the exact call backend/main.py makes at import time
    (load_dotenv(path, override=False)) against a throwaway .env file --
    doesn't touch the real backend/.env or process environment permanently."""
    from dotenv import load_dotenv

    env_file = tmp_path / ".env"
    env_file.write_text("ASSISTANT_TEST_DOTENV_VAR=hello_from_dotenv\n", encoding="utf-8")
    monkeypatch.delenv("ASSISTANT_TEST_DOTENV_VAR", raising=False)

    load_dotenv(env_file, override=False)
    assert os.environ.get("ASSISTANT_TEST_DOTENV_VAR") == "hello_from_dotenv"
    monkeypatch.delenv("ASSISTANT_TEST_DOTENV_VAR", raising=False)


def test_dotenv_never_overrides_real_process_env(tmp_path, monkeypatch) -> None:
    """override=False (as used in backend/main.py) means a real environment
    variable set outside .env always wins -- required for e.g. a deployment
    platform's own env-var configuration to take precedence over a
    committed-by-accident .env value."""
    from dotenv import load_dotenv

    monkeypatch.setenv("ASSISTANT_TEST_DOTENV_VAR", "real_process_value")
    env_file = tmp_path / ".env"
    env_file.write_text("ASSISTANT_TEST_DOTENV_VAR=dotenv_value\n", encoding="utf-8")

    load_dotenv(env_file, override=False)
    assert os.environ["ASSISTANT_TEST_DOTENV_VAR"] == "real_process_value"
    monkeypatch.delenv("ASSISTANT_TEST_DOTENV_VAR", raising=False)


def test_backend_env_is_gitignored() -> None:
    gitignore = open(".gitignore", encoding="utf-8").read()
    assert "backend/.env" in gitignore


# ── Deterministic routing must fire for the exact shapes the task specifies ──

@pytest.mark.parametrize("question,expected_feature", [
    ("What is matrix_water_activity?", "matrix_water_activity"),
    ("What does storage_temperature_c mean?", "storage_temperature_c"),
    ("what is water activity", "matrix_water_activity"),  # curated alias
    ("Define matrix_ph", "matrix_ph"),
])
def test_glossary_routing_hits_known_features(services: dict, question: str, expected_feature: str) -> None:
    result = try_direct_answer(question, services)
    assert result is not None, f"expected a direct routing hit for {question!r}"
    assert result["routed"] == "glossary"
    assert expected_feature in result["reply"]


def test_every_glossary_feature_is_reachable_by_its_own_name(services: dict) -> None:
    for feature in FEATURE_GLOSSARY:
        result = try_direct_answer(f"What is {feature}?", services)
        assert result is not None and result["routed"] == "glossary", f"{feature} not reachable by its own name"


@pytest.mark.parametrize("question", [
    "What is this project about?",
    "Tell me about Shelf-Life Studio",
])
def test_overview_routing_describes_current_architecture(services: dict, question: str) -> None:
    """The overview must describe the CURRENT app (specialist prediction /
    classification / ingredient ranking), not the retired single-workbook
    description -- this is the concrete regression test for task item #4."""
    result = try_direct_answer(question, services)
    assert result is not None
    assert result["routed"] == "overview"
    reply_lower = result["reply"].lower()
    assert "specialist" in reply_lower
    assert "classif" in reply_lower
    assert "ranking" in reply_lower
    # Must not claim the single legacy workbook is the whole project.
    assert "revised_ready_to_train" not in reply_lower


def test_classification_overview_routing(services: dict) -> None:
    for q in ["What is formulation classification?", "What does classification mean?", "Explain formulation efficacy classification"]:
        result = try_direct_answer(q, services)
        assert result is not None, f"expected a hit for {q!r}"
        assert result["routed"] == "classification_overview"
        assert "low" in result["reply"].lower() and "high" in result["reply"].lower()


def test_ingredient_ranking_overview_routing(services: dict) -> None:
    for q in ["What is ingredient ranking?", "What does ingredient ranking mean?", "Explain ingredient ranking"]:
        result = try_direct_answer(q, services)
        assert result is not None, f"expected a hit for {q!r}"
        assert result["routed"] == "ingredient_ranking_overview"


@pytest.mark.parametrize("question", [
    "Which model performs best?",
    "Which model is currently selected?",
    "What is the best model?",
])
def test_best_model_is_disambiguated_not_answered_with_one_legacy_model(services: dict, question: str) -> None:
    """Task item #9's explicit requirement: a bare 'which model is best'
    must not be answered as though the legacy global model represents the
    whole app -- it must acknowledge multiple systems."""
    result = try_direct_answer(question, services)
    assert result is not None
    assert result["routed"] == "best_model"
    reply_lower = result["reply"].lower()
    assert "no single" in reply_lower or "depends" in reply_lower
    # Must mention at least the specialist system and the classifier by name,
    # not just silently hand back the legacy model's name as THE answer.
    assert "specialist" in reply_lower
    assert "classif" in reply_lower


# ── The routing must NOT fire on ambiguous/complex questions (safety) ───────

@pytest.mark.parametrize("question", [
    "How does salt content affect shelf life?",  # a "why" question, not a definition
    "Compare potassium sorbate vs rosemary extract",  # needs a comparison tool
    "Predict shelf life for a soft cheese at 4C",  # needs a prediction tool
    "What is the meaning of life?",  # not a project feature
    "Why did this prediction come out at 48 days?",
    "Classify this formulation for me",  # needs actual formulation details via a tool
])
def test_routing_does_not_fire_on_ambiguous_questions(services: dict, question: str) -> None:
    assert try_direct_answer(question, services) is None


# ── Tool selection must narrow for clear intents, and never under-serve ─────

def test_select_tools_narrows_for_legacy_model_intent() -> None:
    names = {s["function"]["name"] for s in select_tools("What is the legacy global model's RMSE?", None)}
    assert names == {"get_model_metrics"}


def test_select_tools_falls_back_to_full_set_when_uncertain() -> None:
    result = select_tools("asdkj random gibberish query with no keywords", None)
    assert result == TOOL_SPECS


def test_select_tools_routes_specialist_v7_intent() -> None:
    names = {s["function"]["name"] for s in select_tools("Predict the shelf life for a soft cheese specialist model", None)}
    assert "predict_specialist_shelf_life" in names
    assert "get_specialist_info" in names


def test_select_tools_routes_classification_intent() -> None:
    names = {s["function"]["name"] for s in select_tools("Classify this formulation's efficacy tier", None)}
    assert "classify_formulation" in names
    assert "get_classification_info" in names


def test_select_tools_routes_ingredient_ranking_intent() -> None:
    names = {s["function"]["name"] for s in select_tools("What is the ingredient ranking for potassium sorbate?", None)}
    assert "get_ingredient_ranking" in names


def test_select_tools_biases_by_page_context_prediction() -> None:
    """/app/prediction is the CURRENT specialist-backed guided flow -- must
    bias toward the specialist tools, not the legacy ones."""
    names = {s["function"]["name"] for s in select_tools("what should I do", {"current_page": "/app/prediction"})}
    assert "predict_specialist_shelf_life" in names


def test_select_tools_biases_by_page_context_classification() -> None:
    names = {s["function"]["name"] for s in select_tools("what should I do", {"current_page": "/app/classification/run"})}
    assert "classify_formulation" in names


def test_select_tools_biases_by_page_context_ingredients() -> None:
    names = {s["function"]["name"] for s in select_tools("what should I do", {"current_page": "/app/ingredients"})}
    assert "get_ingredient_ranking" in names


# ── Result-shrinking helpers ─────────────────────────────────────────────────

def test_cap_counts_trims_long_tail() -> None:
    counts = {f"item_{i}": i for i in range(20)}
    capped = _cap_counts(counts, n=5)
    assert len(capped) == 6  # top 5 + one summary key
    assert any(k.startswith("...and") for k in capped)


def test_cap_counts_leaves_short_dicts_untouched() -> None:
    counts = {"a": 1, "b": 2}
    assert _cap_counts(counts, n=10) == counts


def test_round_floats_recurses_through_nested_structures() -> None:
    data = {"a": 0.123456789, "b": [0.1111111, {"c": 0.999999}]}
    rounded = _round_floats(data, ndigits=2)
    assert rounded == {"a": 0.12, "b": [0.11, {"c": 1.0}]}
