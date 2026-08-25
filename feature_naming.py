"""
Shared, dependency-free helpers for turning the classifier's raw/encoded
feature space back into something a non-ML user can read. Used by
classification_service.py's live local-explanation path (explain_local).

map_feature_to_source/_aggregate_to_source mirror the training-time helpers
already duplicated in train_classifier.py / train_models.py / train_specialists.py
(kept here as a fresh copy rather than importing from any of those three --
they're training scripts, not serving modules, and this module needs to be
importable at request time with zero training-time side effects).
"""
from __future__ import annotations

from typing import Any

# raw source column -> human-readable label, covering every one of the
# classifier's 27 trained features (artifacts_classification/schema.json).
FEATURE_LABELS: dict[str, str] = {
    "food_matrix": "Cheese type",
    "cheese_category": "Cheese category",
    "matrix_ph": "pH",
    "matrix_water_activity": "Water activity",
    "matrix_moisture_pct": "Moisture",
    "matrix_fat_pct": "Fat content",
    "matrix_protein_pct": "Protein content",
    "matrix_salt_pct": "Salt content",
    "matrix_ripening_days": "Ripening time",
    "pasteurization_applied": "Pasteurization",
    "storage_temperature_c": "Storage temperature",
    "packaging_type": "Packaging",
    "headspace_oxygen_pct": "Headspace oxygen",
    "headspace_co2_pct": "Headspace CO2",
    "headspace_n2_pct": "Headspace nitrogen",
    "indicator_group": "Quality indicator category",
    "indicator_type": "Quality indicator",
    "indicator_threshold": "Indicator threshold",
    "indicator_unit": "Indicator unit",
    "initial_indicator_value": "Initial indicator value",
    "treatment_type": "Treatment type",
    "application_method": "Application method",
    "ingredient_count": "Number of ingredients",
    "primary_ingredient_name": "Ingredient",
    "primary_ingredient_family": "Ingredient family",
    "primary_concentration": "Ingredient concentration",
    "primary_concentration_unit": "Concentration unit",
}

# Static-unit numeric features (unitless features -- pH, water activity --
# are simply absent from this dict).
FEATURE_UNITS: dict[str, str] = {
    "matrix_moisture_pct": "%",
    "matrix_fat_pct": "%",
    "matrix_protein_pct": "%",
    "matrix_salt_pct": "%",
    "matrix_ripening_days": "days",
    "storage_temperature_c": "°C",
    "headspace_oxygen_pct": "%",
    "headspace_co2_pct": "%",
    "headspace_n2_pct": "%",
}

# Numeric features whose unit is itself another column on the same row,
# rather than a fixed unit (e.g. a concentration reported in "ppm" for one
# row and "% w/v" for another).
DYNAMIC_UNIT_SOURCE: dict[str, str] = {
    "primary_concentration": "primary_concentration_unit",
    "indicator_threshold": "indicator_unit",
    "initial_indicator_value": "indicator_unit",
}

# Binary (0/1) features displayed as words, not digits.
BINARY_VALUE_LABELS: dict[str, dict[int, str]] = {
    "pasteurization_applied": {0: "Not pasteurized", 1: "Pasteurized"},
}

# Known values whose default underscore-to-space humanization reads oddly.
_VALUE_OVERRIDES: dict[str, str] = {
    "semi_hard": "Semi-hard",
}


def humanize_value(value: Any) -> str:
    """Cosmetic formatting for a categorical value: known overrides first,
    then underscore-to-space + capitalize-first-letter. Never fabricates or
    reinterprets the value -- purely a display transform."""
    s = str(value)
    if s in _VALUE_OVERRIDES:
        return _VALUE_OVERRIDES[s]
    s = s.replace("_", " ")
    return (s[:1].upper() + s[1:]) if s else s


def map_feature_to_source(name: str, categorical_cols: list[str]) -> str:
    """Collapse a preprocessor-expanded feature name (e.g. 'cat__cheese_category_soft'
    or 'num__matrix_ph') back to its original source column name."""
    for prefix in ("num__", "cat__"):
        if name.startswith(prefix):
            name = name[len(prefix):]
    candidates = [c for c in categorical_cols if name == c or name.startswith(c + "_")]
    return max(candidates, key=len) if candidates else name


def aggregate_contributions_to_source(
    values: dict[str, float], categorical_cols: list[str],
) -> dict[str, float]:
    """Sums (not averages) per-expanded-feature SIGNED contributions (e.g.
    SHAP values) back to their source column. Summing is the correct
    aggregation here -- SHAP values are additive, so summing a one-hot
    group's contributions preserves the guarantee that they sum to the
    model's class-score output; averaging (appropriate for the
    training-time variance/gain-style importance stats in train_classifier.py)
    would break that property."""
    agg: dict[str, float] = {}
    for name, v in values.items():
        source = map_feature_to_source(name, categorical_cols)
        agg[source] = agg.get(source, 0.0) + v
    return agg
