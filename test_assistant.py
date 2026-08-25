#!/usr/bin/env python
"""
Tests for the assistant's deterministic pre-LLM routing (direct_answers.py)
and tool-selection/result-shrinking helpers (tools.py). These are pure,
provider-independent logic -- no LLM credentials required to run this file.

The provider abstraction itself (retry/fallback/tool-call parsing) is
exercised live by provider_benchmark.py against whichever providers have
credentials configured; that isn't repeated here since it needs real network
calls, not a fast unit-test loop.

Usage: python -m pytest test_assistant.py -v
"""
from __future__ import annotations

import pytest

from backend.assistant.direct_answers import try_direct_answer
from backend.assistant.tools import FEATURE_GLOSSARY, TOOL_SPECS, _cap_counts, _round_floats, select_tools
from model_service import ModelService


@pytest.fixture(scope="module")
def svc() -> ModelService:
    return ModelService()


# ── Deterministic routing must fire for the exact shapes the task specifies ──

@pytest.mark.parametrize("question,expected_feature", [
    ("What is matrix_water_activity?", "matrix_water_activity"),
    ("What does storage_temperature_c mean?", "storage_temperature_c"),
    ("what is water activity", "matrix_water_activity"),  # curated alias
    ("Define matrix_ph", "matrix_ph"),
])
def test_glossary_routing_hits_known_features(svc: ModelService, question: str, expected_feature: str) -> None:
    result = try_direct_answer(question, svc)
    assert result is not None, f"expected a direct routing hit for {question!r}"
    assert result["routed"] == "glossary"
    assert expected_feature in result["reply"]


@pytest.mark.parametrize("question", [
    "What is this project about?",
    "Tell me about Shelf-Life Studio",
])
def test_overview_routing(svc: ModelService, question: str) -> None:
    result = try_direct_answer(question, svc)
    assert result is not None
    assert result["routed"] == "overview"


@pytest.mark.parametrize("question", [
    "Which model performs best?",
    "Which model is currently selected?",
])
def test_best_model_routing(svc: ModelService, question: str) -> None:
    result = try_direct_answer(question, svc)
    assert result is not None
    assert result["routed"] == "best_model"
    assert svc.best_model in result["reply"].lower().replace(" ", "_") or svc.model_label(svc.best_model) in result["reply"]


# ── The routing must NOT fire on ambiguous/complex questions (safety) ───────

@pytest.mark.parametrize("question", [
    "How does salt content affect shelf life?",  # a "why" question, not a definition
    "Compare potassium sorbate vs rosemary extract",  # needs compare_treatments tool
    "Predict shelf life for a soft cheese at 4C",  # needs predict_shelf_life tool
    "What is the meaning of life?",  # not a project feature
    "Why did this prediction come out at 48 days?",
])
def test_routing_does_not_fire_on_ambiguous_questions(svc: ModelService, question: str) -> None:
    assert try_direct_answer(question, svc) is None


def test_every_glossary_feature_is_reachable_by_its_own_name(svc: ModelService) -> None:
    """Every FEATURE_GLOSSARY key must be answerable via its literal name --
    this is the core "what is <literal_column_name>" guarantee the task
    calls out explicitly (CASE 1)."""
    for feature in FEATURE_GLOSSARY:
        result = try_direct_answer(f"What is {feature}?", svc)
        assert result is not None and result["routed"] == "glossary", f"{feature} not reachable by its own name"


# ── Tool selection must narrow for clear intents, and never under-serve ─────

def test_select_tools_narrows_for_clear_intent() -> None:
    names = {s["function"]["name"] for s in select_tools("Which model performs best?", None)}
    assert names == {"get_model_metrics"}


def test_select_tools_falls_back_to_full_set_when_uncertain() -> None:
    result = select_tools("asdkj random gibberish query with no keywords", None)
    assert result == TOOL_SPECS


def test_select_tools_merges_multiple_matched_categories() -> None:
    names = {s["function"]["name"] for s in select_tools("Compare potassium sorbate vs rosemary extract", None)}
    assert "compare_treatments" in names


def test_select_tools_biases_by_page_context() -> None:
    names = {s["function"]["name"] for s in select_tools("what should I do", {"current_page": "/app/prediction"})}
    assert "predict_shelf_life" in names


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
