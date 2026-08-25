"""
classification_service.py -- loads artifacts_classification/ (produced by
train_classifier.py) and serves efficacy-class predictions. Mirrors the
read-only-from-saved-artifacts pattern of model_service.py: loads once at
startup, NEVER retrains, NEVER touches train_classifier.py or the
regression pipeline's artifacts/.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import shap

from feature_naming import (
    BINARY_VALUE_LABELS,
    DYNAMIC_UNIT_SOURCE,
    FEATURE_LABELS,
    FEATURE_UNITS,
    aggregate_contributions_to_source,
    humanize_value,
)

ROOT = Path(__file__).resolve().parent
ARTIFACTS_DIR = ROOT / "artifacts_classification"
MODELS_DIR = ARTIFACTS_DIR / "models"

CLF_MODEL_LABELS = {
    "random_forest": "Random Forest Classifier",
    "xgboost": "XGBoost Classifier",
}


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


class ClassificationService:
    """Loads every classification artifact once and serves predictions from memory."""

    def __init__(self) -> None:
        self.schema = _read_json(ARTIFACTS_DIR / "schema.json")
        self.metrics = _read_json(ARTIFACTS_DIR / "metrics.json")
        self.confusion = _read_json(ARTIFACTS_DIR / "confusion_matrix.json")
        self.feature_importance = _read_json(ARTIFACTS_DIR / "feature_importance.json")
        self.class_distribution = _read_json(ARTIFACTS_DIR / "class_distribution.json")
        self.class_definitions = _read_json(ARTIFACTS_DIR / "class_definitions.json")
        self.manifest = _read_json(ARTIFACTS_DIR / "training_manifest.json")

        self.numeric_cols: list[str] = self.schema["numeric_columns"]
        self.categorical_cols: list[str] = self.schema["categorical_columns"]
        self.binary_cols: list[str] = self.schema["binary_columns"]
        self.numeric_and_binary: list[str] = self.numeric_cols + self.binary_cols
        self.feature_cols: list[str] = self.schema["all_feature_columns"]
        self.class_names: list[str] = self.class_definitions["class_names"]
        self.best_model: str = self.manifest["best_model_by_test_macro_f1"]

        self.tree_pre = joblib.load(MODELS_DIR / "preprocessor_tree.joblib")
        self.models: dict[str, Any] = {
            "random_forest": joblib.load(MODELS_DIR / "random_forest_classifier.joblib"),
            "xgboost": joblib.load(MODELS_DIR / "xgboost_classifier.joblib"),
        }
        self.expanded_feature_names: list[str] = list(self.tree_pre.get_feature_names_out())

        # Built once here (wraps the already-fit models -- not training) so a
        # live /explain request never pays SHAP's setup cost per call.
        self.explainers: dict[str, Any] = {
            name: shap.TreeExplainer(model) for name, model in self.models.items()
        }

    @property
    def available_models(self) -> list[str]:
        return list(self.models.keys())

    def resolve_model_name(self, name: str) -> str:
        return self.best_model if name in ("best_model", "best") else name

    def model_label(self, name: str) -> str:
        resolved = self.resolve_model_name(name)
        return CLF_MODEL_LABELS.get(resolved, resolved)

    # ── Warnings / support assessment ───────────────────────────────────────
    #
    # Structured equivalent of model_service.py's ModelService.assess_support
    # (not imported from there -- that module powers the separate V7
    # regression system, kept untouched by this feature). Same missing-value
    # semantics: a value arrives as None from a live JSON request but as NaN
    # when a row is built from a DataFrame/CSV -- both mean "not provided"
    # and must never be reported as an unseen category or an out-of-range
    # number.

    def _is_missing(self, v: Any) -> bool:
        return v is None or (isinstance(v, float) and np.isnan(v))

    def assess_support(self, row: dict[str, Any]) -> dict[str, Any]:
        unseen_categoricals: list[dict[str, str]] = []
        for c in self.categorical_cols:
            v = row.get(c)
            if self._is_missing(v):
                continue
            options = self.schema["categorical_options"].get(c, [])
            if str(v) not in options:
                unseen_categoricals.append({"feature": c, "value": str(v)})

        extrapolations: list[dict[str, Any]] = []
        for c in self.numeric_and_binary:
            v = row.get(c)
            if self._is_missing(v):
                continue
            try:
                v = float(v)
            except (TypeError, ValueError):
                continue
            rng = self.schema["numeric_ranges"].get(c)
            if rng and not (rng["min"] <= v <= rng["max"]):
                if rng["min"] == rng["max"]:
                    detail = f"'{c}' = {v} differs from the single value ({rng['min']:.3g}) seen in training"
                else:
                    detail = f"'{c}' = {v} is outside the training range [{rng['min']:.3g}, {rng['max']:.3g}]"
                extrapolations.append({
                    "feature": c, "value": v,
                    "range": {"min": rng["min"], "max": rng["max"]}, "detail": detail,
                })

        if unseen_categoricals:
            level = "unsupported_categorical"
        elif extrapolations:
            level = "extrapolation"
        else:
            level = "supported"

        warnings = [f"'{u['feature']}' = {u['value']!r} was never seen in training (unseen category)" for u in unseen_categoricals]
        warnings += [e["detail"] for e in extrapolations]

        return {
            "level": level,
            "unseen_categoricals": unseen_categoricals,
            "extrapolations": extrapolations,
            "warnings": warnings,
        }

    def check_input_warnings(self, row: dict[str, Any]) -> list[str]:
        """Thin backward-compatible wrapper -- prefer assess_support() for
        any new caller that can act on the structured level, not just text."""
        return self.assess_support(row)["warnings"]

    def _row_to_frame(self, row: dict[str, Any]) -> pd.DataFrame:
        full = {c: row.get(c) for c in self.feature_cols}
        return pd.DataFrame([full])

    # ── Prediction ───────────────────────────────────────────────────────────

    def _resolve_class_order(self, resolved: str, model: Any, raw_pred: Any) -> tuple[str, list[str]]:
        """Single source of truth for the RF-vs-XGBoost classes_ ordering
        reconciliation, shared by predict_one and explain_local so they can
        never disagree on which Low/Medium/High index a given model's raw
        output/SHAP array position corresponds to."""
        if resolved == "xgboost":
            # XGBClassifier was trained on integer class indices (0/1/2).
            predicted_class = self.class_names[int(raw_pred)]
            class_order = self.class_names
        else:
            # RandomForestClassifier's classes_ is alphabetically sorted
            # ("High"/"Low"/"Medium"), not Low/Medium/High -- map explicitly
            # so probabilities/SHAP arrays line up with self.class_names in
            # order. Verified empirically that SHAP's TreeExplainer output
            # axis follows this exact model.classes_ order for RF.
            predicted_class = str(raw_pred)
            class_order = [str(c) for c in model.classes_]
        return predicted_class, class_order

    def predict_one(self, model_name: str, row: dict[str, Any]) -> dict[str, Any]:
        resolved = self.resolve_model_name(model_name)
        if resolved not in self.models:
            raise ValueError(f"Unknown or unavailable classifier: {resolved}")
        model = self.models[resolved]
        df = self._row_to_frame(row)
        X = self.tree_pre.transform(df[self.numeric_and_binary + self.categorical_cols])

        raw_pred = model.predict(X)[0]
        proba_raw = model.predict_proba(X)[0]
        predicted_class, class_order = self._resolve_class_order(resolved, model, raw_pred)

        probabilities = {
            cls: float(proba_raw[class_order.index(cls)]) if cls in class_order else 0.0
            for cls in self.class_names
        }

        support = self.assess_support(row)
        return {
            "model": resolved, "model_label": self.model_label(resolved),
            "predicted_class": predicted_class,
            "probabilities": probabilities,
            "warnings": support["warnings"],
            "support": support,
        }

    def predict_many(self, model_name: str, candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
        results = []
        for i, cand in enumerate(candidates):
            row = {k: v for k, v in cand.items() if k != "name"}
            res = self.predict_one(model_name, row)
            res["candidate_name"] = cand.get("name") or f"Candidate {i + 1}"
            res["row"] = row
            results.append(res)
        # Rank High -> Medium -> Low, using prediction confidence as a tiebreaker within a class.
        order = {cls: i for i, cls in enumerate(self.class_names)}
        results.sort(key=lambda r: (-order[r["predicted_class"]], -r["probabilities"][r["predicted_class"]]))
        return results

    # ── Local explanation (SHAP TreeExplainer) ──────────────────────────────
    #
    # Real per-prediction attribution, not a restatement of the static
    # training-time global feature_importance.json. Uses the exact same
    # preprocessor + model + class-order resolution as predict_one -- never a
    # separate reimplementation. Reuses the identical transformed row
    # predict_one would score; nothing here can disagree with what the model
    # actually predicted for this input.
    #
    # Verified empirically against these saved models (shap==0.52.0):
    # shap_values has shape (1, n_expanded_features, n_classes), and its class
    # axis follows model.classes_ order for BOTH model families -- i.e. the
    # exact same class_order _resolve_class_order already computes. For
    # RandomForest, summed SHAP contributions + expected_value reconstruct
    # predict_proba directly (probability units). For XGBoost, the same sum
    # only reconstructs predict_proba after a softmax (SHAP values are in
    # margin/log-odds units for this model family). Because the two models'
    # raw contribution magnitudes are therefore NOT on a comparable scale,
    # this method never returns a raw contribution number for display --
    # only a rank-based strength bucket (strong/moderate/slight) computed
    # from each factor's position among the OTHER shown factors for that
    # class and direction.

    def _format_value(self, source: str, row: dict[str, Any]) -> Any:
        v = row.get(source)
        if v is None:
            return None
        if source in BINARY_VALUE_LABELS:
            try:
                return BINARY_VALUE_LABELS[source].get(int(float(v)), v)
            except (TypeError, ValueError):
                return v
        if source in self.categorical_cols:
            return humanize_value(v)
        try:
            v = float(v)
        except (TypeError, ValueError):
            return v
        num_str = str(int(v)) if v == int(v) else f"{v:.3g}"
        unit = row.get(DYNAMIC_UNIT_SOURCE[source]) if source in DYNAMIC_UNIT_SOURCE else FEATURE_UNITS.get(source)
        return f"{num_str} {unit}".strip() if unit else num_str

    @staticmethod
    def _strength(rank: int, total: int) -> str:
        if total <= 1:
            return "strong"
        frac = rank / (total - 1)
        if frac < 1 / 3:
            return "strong"
        if frac < 2 / 3:
            return "moderate"
        return "slight"

    def explain_local(self, model_name: str, row: dict[str, Any], top_k: int = 5) -> dict[str, Any]:
        resolved = self.resolve_model_name(model_name)
        if resolved not in self.models:
            raise ValueError(f"Unknown or unavailable classifier: {resolved}")
        model = self.models[resolved]
        explainer = self.explainers[resolved]

        df = self._row_to_frame(row)
        X = self.tree_pre.transform(df[self.numeric_and_binary + self.categorical_cols])
        raw_pred = model.predict(X)[0]
        predicted_class, class_order = self._resolve_class_order(resolved, model, raw_pred)

        shap_values = explainer.shap_values(X)  # shape: (1, n_expanded_features, n_classes)

        classes_out: dict[str, Any] = {}
        for cls in self.class_names:
            class_idx = class_order.index(cls)
            per_expanded = {
                name: float(shap_values[0, j, class_idx])
                for j, name in enumerate(self.expanded_feature_names)
            }
            aggregated = aggregate_contributions_to_source(per_expanded, self.categorical_cols)
            nonzero = [(src, val) for src, val in aggregated.items() if abs(val) > 1e-9]
            nonzero.sort(key=lambda kv: abs(kv[1]), reverse=True)

            supporting_top = [item for item in nonzero if item[1] > 0][:top_k]
            opposing_top = [item for item in nonzero if item[1] < 0][:top_k]

            def _factor(item: tuple[str, float], rank: int, total: int) -> dict[str, Any]:
                source, contribution = item
                return {
                    "feature": source,
                    "label": FEATURE_LABELS.get(source, source),
                    "value": self._format_value(source, row),
                    "direction": "supports" if contribution > 0 else "opposes",
                    "strength": self._strength(rank, total),
                }

            classes_out[cls] = {
                "supporting": [_factor(item, i, len(supporting_top)) for i, item in enumerate(supporting_top)],
                "opposing": [_factor(item, i, len(opposing_top)) for i, item in enumerate(opposing_top)],
            }

        return {
            "predicted_class": predicted_class,
            "class_order": self.class_names,
            "classes": classes_out,
        }
