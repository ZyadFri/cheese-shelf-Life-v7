#!/usr/bin/env python
"""
Tests for the redesigned Formulation Efficacy Classification backend
(classification_service.py's assess_support + explain_local additions).
Imports the exact same ClassificationService the backend uses -- no
separate reimplementation of routing, preprocessing, or class-order logic.

Usage: python -m pytest test_classification.py -v
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))  # scripts/tests/ -> repo root
from classification_service import ClassificationService

ALGOS = ["random_forest", "xgboost"]


@pytest.fixture(scope="module")
def svc() -> ClassificationService:
    return ClassificationService()


@pytest.fixture()
def base_row(svc: ClassificationService) -> dict:
    row = {c: svc.schema["numeric_ranges"][c]["median"] for c in svc.numeric_and_binary}
    for c in svc.categorical_cols:
        row[c] = svc.schema["categorical_modes"][c]
    return row


# ── 1. Predicted-class stability (argmax of probabilities == predicted_class) ─

@pytest.mark.parametrize("model", ALGOS)
def test_predicted_class_matches_argmax(svc: ClassificationService, base_row: dict, model: str) -> None:
    res = svc.predict_one(model, base_row)
    best = max(res["probabilities"], key=res["probabilities"].get)
    assert res["predicted_class"] == best
    assert abs(sum(res["probabilities"].values()) - 1.0) < 1e-6


# ── 2/3. Low/Medium/High probability mapping correct for RF and XGBoost ─────
# Cross-checked against a from-scratch reimplementation of the class-order
# logic, not just trusting the service's own internals.

def test_rf_probability_mapping_correct(svc: ClassificationService, base_row: dict) -> None:
    model = svc.models["random_forest"]
    df = svc._row_to_frame(base_row)
    X = svc.tree_pre.transform(df[svc.numeric_and_binary + svc.categorical_cols])
    proba_raw = model.predict_proba(X)[0]
    # RF classes_ is alphabetically sorted -- reimplemented independently here.
    expected = {str(c): float(p) for c, p in zip(model.classes_, proba_raw)}

    res = svc.predict_one("random_forest", base_row)
    for cls in svc.class_names:
        assert abs(res["probabilities"][cls] - expected[cls]) < 1e-9


def test_xgboost_probability_mapping_correct(svc: ClassificationService, base_row: dict) -> None:
    model = svc.models["xgboost"]
    df = svc._row_to_frame(base_row)
    X = svc.tree_pre.transform(df[svc.numeric_and_binary + svc.categorical_cols])
    proba_raw = model.predict_proba(X)[0]
    # XGBoost was trained on integer indices assigned in CLASS_NAMES order.
    expected = {svc.class_names[i]: float(p) for i, p in enumerate(proba_raw)}

    res = svc.predict_one("xgboost", base_row)
    for cls in svc.class_names:
        assert abs(res["probabilities"][cls] - expected[cls]) < 1e-9


# ── 4. Local explanations use the same transformed row as prediction ────────
# (SHAP additivity: summed per-class contributions + expected_value must
# reconstruct that class's model output for the SAME row predict_one scored.)

@pytest.mark.parametrize("model", ALGOS)
def test_explanation_additivity_matches_prediction(svc: ClassificationService, base_row: dict, model: str) -> None:
    pred = svc.predict_one(model, base_row)
    explainer = svc.explainers[model]
    df = svc._row_to_frame(base_row)
    X = svc.tree_pre.transform(df[svc.numeric_and_binary + svc.categorical_cols])
    shap_values = explainer.shap_values(X)[0]  # (n_features, n_classes)

    _, class_order = svc._resolve_class_order(model, svc.models[model], svc.models[model].predict(X)[0])
    expected_values = np.atleast_1d(explainer.expected_value)

    for cls in svc.class_names:
        idx = class_order.index(cls)
        reconstructed = float(shap_values[:, idx].sum() + expected_values[idx])
        if model == "random_forest":
            # RF's SHAP values are natively in probability units.
            assert abs(reconstructed - pred["probabilities"][cls]) < 1e-4
        else:
            # XGBoost's SHAP values are in margin/log-odds units -- softmax
            # across the reconstructed margins for all 3 classes recovers
            # the probability.
            pass  # margin-space check done once below (needs all 3 classes together)

    if model == "xgboost":
        margins = []
        for cls in svc.class_names:
            idx = class_order.index(cls)
            margins.append(float(shap_values[:, idx].sum() + expected_values[idx]))
        margins = np.array(margins)
        softmax = np.exp(margins) / np.exp(margins).sum()
        for i, cls in enumerate(svc.class_names):
            assert abs(softmax[i] - pred["probabilities"][cls]) < 1e-3


# ── 5. Explanation class ordering is correct ─────────────────────────────────

@pytest.mark.parametrize("model", ALGOS)
def test_explanation_class_ordering(svc: ClassificationService, base_row: dict, model: str) -> None:
    pred = svc.predict_one(model, base_row)
    exp = svc.explain_local(model, base_row, top_k=3)
    assert exp["predicted_class"] == pred["predicted_class"]
    assert exp["class_order"] == svc.class_names
    assert set(exp["classes"].keys()) == set(svc.class_names)


# ── 6. Contributions are mapped back to human-readable source features ──────

@pytest.mark.parametrize("model", ALGOS)
def test_explanation_has_no_leaked_internal_names(svc: ClassificationService, base_row: dict, model: str) -> None:
    exp = svc.explain_local(model, base_row, top_k=5)
    for cls_block in exp["classes"].values():
        for factor in cls_block["supporting"] + cls_block["opposing"]:
            assert not factor["feature"].startswith("cat__")
            assert not factor["feature"].startswith("num__")
            assert factor["feature"] in svc.feature_cols
            assert factor["label"], f"missing human label for {factor['feature']!r}"
            assert factor["strength"] in ("strong", "moderate", "slight")
            assert factor["direction"] in ("supports", "opposes")


def test_known_features_get_human_labels(svc: ClassificationService, base_row: dict) -> None:
    exp = svc.explain_local("xgboost", base_row, top_k=27)  # ask for everything
    all_features = {
        f["feature"]
        for cls_block in exp["classes"].values()
        for f in cls_block["supporting"] + cls_block["opposing"]
    }
    from feature_naming import FEATURE_LABELS
    for feature in all_features:
        assert feature in FEATURE_LABELS, f"{feature} has no human-readable label"


# ── 7. Unseen categorical warnings still work ────────────────────────────────

def test_unseen_categorical_warning(svc: ClassificationService, base_row: dict) -> None:
    row = {**base_row, "primary_ingredient_name": "a_totally_novel_ingredient_xyz"}
    support = svc.assess_support(row)
    assert support["level"] == "unsupported_categorical"
    assert any(u["feature"] == "primary_ingredient_name" for u in support["unseen_categoricals"])


# ── 8. Out-of-range numeric warnings still work (+ NaN non-regression) ──────

def test_out_of_range_numeric_warning(svc: ClassificationService, base_row: dict) -> None:
    row = {**base_row, "storage_temperature_c": 999.0}
    support = svc.assess_support(row)
    assert support["level"] == "extrapolation"
    assert any(e["feature"] == "storage_temperature_c" for e in support["extrapolations"])


def test_missing_value_as_nan_is_not_a_false_positive(svc: ClassificationService, base_row: dict) -> None:
    row = {**base_row, "matrix_ph": float("nan"), "packaging_type": float("nan")}
    support = svc.assess_support(row)
    assert support["level"] == "supported"
    assert support["extrapolations"] == []
    assert support["unseen_categoricals"] == []


def test_clean_row_is_supported(svc: ClassificationService, base_row: dict) -> None:
    support = svc.assess_support(base_row)
    assert support["level"] == "supported"


# ── 9. Missing classification artifacts degrade gracefully ──────────────────

def test_missing_artifacts_raise_file_not_found(tmp_path, monkeypatch) -> None:
    import classification_service as cs_module
    monkeypatch.setattr(cs_module, "ARTIFACTS_DIR", tmp_path / "does_not_exist")
    monkeypatch.setattr(cs_module, "MODELS_DIR", tmp_path / "does_not_exist" / "models")
    with pytest.raises(FileNotFoundError):
        cs_module.ClassificationService()


if __name__ == "__main__":
    import sys
    sys.exit(pytest.main([__file__, "-v"]))
