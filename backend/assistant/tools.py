"""
Backend tools exposed to the LLM. Every tool is a thin wrapper around one of
this app's existing production services -- model_service.ModelService (the
original global regression models), specialist_registry.SpecialistRegistry
(one regression model per cheese category x prediction task),
classification_service.ClassificationService (the Low/Medium/High
formulation efficacy classifier), and ingredient_ranking_service.
IngredientRankingService (the precomputed per-ingredient ranking). No tool
re-implements modeling/statistics logic -- every tool calls the exact same
method backend/main.py's REST routes call, and no tool result is touched by
the LLM before being returned to the user as a "fact"; the LLM only narrates
numbers these functions actually computed.
"""
from __future__ import annotations

from typing import Any, Callable

from model_service import ModelService, build_candidate_row, build_candidate_row_v6
from specialist_registry import SpecialistRegistry, TASKS

PROJECT_OVERVIEW = {
    "name": "Shelf-Life Studio",
    "purpose": (
        "A McGill Food Science research platform with three independent modeling systems over "
        "cheese formulation, processing, packaging, and storage-condition data: (1) specialist "
        "shelf-life regression models that predict shelf_life_days, (2) a formulation efficacy "
        "classifier that predicts a Low/Medium/High shelf-life-improvement tier for a full "
        "treated formulation versus a matched control, and (3) an ingredient efficacy ranking "
        "that scores individual antimicrobial/antioxidant ingredients on their own "
        "context-adjusted effect. An in-app AI assistant can query all three."
    ),
    "systems": [
        "Specialist shelf-life prediction: one regression model per cheese category (soft, "
        "semi_hard, hard) and prediction task (general_shelf_life, safety_endpoint) -- up to six "
        "specialists, each trained and validated independently and routed automatically by the "
        "formulation's cheese category and the spoilage indicator being tracked.",
        "Formulation efficacy classification: predicts whether a full treated formulation "
        "(matrix + treatment + concentration + storage conditions) falls in the Low, Medium, or "
        "High tier of shelf-life improvement over a matched untreated control, with a real "
        "per-prediction SHAP explanation of which factors drove the result.",
        "Ingredient efficacy ranking: ranks individual ingredients by their own typical effect, "
        "adjusted for the conditions they were tested under (a fixed-effects ridge regression "
        "with the ingredient itself as a covariate) -- a separate, ingredient-level view "
        "distinct from the formulation-level classifier above.",
        "Explainability: local (per-prediction) and global feature-attribution views for the "
        "specialist regression models and the formulation classifier.",
        "AI assistant: this in-app chat -- it calls the exact same production services as the "
        "rest of the app and never invents a project-specific number.",
    ],
    "target_variable": "shelf_life_days (specialist regression) / a Low-Medium-High efficacy tier (formulation classifier) / a context-adjusted effect percentage (ingredient ranking)",
}

FEATURE_GLOSSARY: dict[str, str] = {
    "food_matrix": "The specific cheese product (e.g. 'gouda_cheese', 'brie_cheese') the row describes.",
    "cheese_category": "Broad texture category of the cheese: hard, semi_hard, or soft.",
    "matrix_ph": "pH of the cheese matrix; lower pH generally slows microbial spoilage.",
    "matrix_water_activity": "Water activity (aw), 0-1 scale; the fraction of water available for microbial growth. Lower aw extends shelf life.",
    "matrix_moisture_pct": "Moisture content of the cheese, percent by weight.",
    "matrix_fat_pct": "Fat content of the cheese, percent by weight.",
    "matrix_protein_pct": "Protein content of the cheese, percent by weight.",
    "matrix_salt_pct": "Salt (NaCl) content of the cheese, percent by weight; salt is itself a preservative.",
    "matrix_ripening_days": "Days the cheese was ripened/aged before the shelf-life clock in this row starts.",
    "pasteurization_applied": "1 if the milk was pasteurized before cheesemaking, else 0.",
    "storage_temperature_c": "Storage temperature in degrees Celsius during the shelf-life trial.",
    "packaging_type": "Packaging format used (e.g. vacuum, modified-atmosphere, wax-coated).",
    "headspace_oxygen_pct": "Oxygen percent in the package headspace gas mix.",
    "headspace_co2_pct": "CO2 percent in the package headspace gas mix.",
    "headspace_n2_pct": "Nitrogen percent in the package headspace gas mix.",
    "indicator_group": "Broad category of the spoilage indicator being monitored (e.g. microbial, chemical, sensory).",
    "indicator_type": "Specific spoilage indicator tracked to define end-of-shelf-life (e.g. a mold count, a TVB-N threshold).",
    "indicator_threshold": "The indicator value at which the product is considered spoiled/end-of-shelf-life.",
    "indicator_unit": "Unit of the indicator_threshold value.",
    "initial_indicator_value": "The indicator's value at time zero (start of storage).",
    "is_control": "1 if this row is the untreated control for its context_id, 0 if it is a treatment.",
    "treatment_type": "Category of intervention applied (e.g. antimicrobial, antioxidant, none for controls).",
    "application_method": "How the treatment was applied (e.g. direct addition, coating, packaging-incorporated).",
    "ingredient_count": "Number of active ingredients in the treatment (0 for controls/no treatment).",
    "primary_ingredient_name": "Name of the main active ingredient used in the treatment ('none' for controls).",
    "primary_ingredient_family": "Chemical/functional family of the primary ingredient (e.g. essential oil, organic acid).",
    "primary_concentration": "Dose of the primary ingredient applied.",
    "primary_concentration_unit": "Unit of primary_concentration (e.g. %, ppm, mg/kg).",
    "shelf_life_days": "TARGET. Predicted/observed days until the product reaches its spoilage indicator threshold.",
}


def _get_service(services: dict[str, Any]) -> ModelService:
    return services["model_service"]


def _get_specialist_registry(services: dict[str, Any]) -> SpecialistRegistry | None:
    return services.get("specialist_registry")


def _get_classification_service(services: dict[str, Any]):
    return services.get("classification_service")


def _get_ingredient_service(services: dict[str, Any]):
    return services.get("ingredient_ranking_service")


def _cap_counts(counts: dict[str, int], n: int = 10) -> dict[str, int | str]:
    """Trims a value_counts()-style dict to its top-n entries so a
    dataset-statistics tool result doesn't spend hundreds of tokens on a
    long tail the question never asked about. Adds a summary key instead of
    silently dropping the rest."""
    if len(counts) <= n:
        return counts
    items = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
    trimmed = dict(items[:n])
    remaining = len(items) - n
    trimmed[f"...and {remaining} more"] = sum(v for _, v in items[n:])
    return trimmed


def _round_floats(obj: Any, ndigits: int = 3) -> Any:
    """Recursively rounds floats in a tool result so the LLM sees
    '0.183' instead of '0.18294572639...' -- same information, far fewer
    tokens, and no precision the UI would ever show anyway."""
    if isinstance(obj, float):
        return round(obj, ndigits)
    if isinstance(obj, dict):
        return {k: _round_floats(v, ndigits) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_round_floats(v, ndigits) for v in obj]
    return obj


def tool_get_project_overview(services: dict[str, Any], **_: Any) -> dict[str, Any]:
    svc = _get_service(services)
    overview: dict[str, Any] = {
        **PROJECT_OVERVIEW,
        # Explicitly labeled "legacy" so the model never mistakes this one
        # global regression model set for the whole application -- the
        # specialist/classification/ingredient sections below are the
        # current systems for shelf-life/efficacy questions.
        "legacy_global_regression_model": {
            "best_model": svc.model_label(svc.best_model),
            "available_models": svc.available_models,
            "n_training_rows": len(svc.full_df),
            "n_contexts": int(svc.full_df["context_id"].nunique()),
        },
    }
    reg = _get_specialist_registry(services)
    if reg is not None:
        overview["specialist_shelf_life_system"] = {
            "categories": list(reg.services.keys()),
            "tasks": TASKS,
            "loaded_specialists": {
                f"{cat}/{task}": svc2 is not None
                for cat, tasks in reg.services.items() for task, svc2 in tasks.items()
            },
        }
    clf = _get_classification_service(services)
    if clf is not None:
        overview["formulation_classification_system"] = {
            "best_model": clf.model_label(clf.best_model),
            "class_definitions": clf.class_definitions,
        }
    ing = _get_ingredient_service(services)
    if ing is not None:
        overview["ingredient_ranking_system"] = {
            "n_ingredients_ranked": len(ing.rankings),
            "class_definitions": ing.class_definitions,
        }
    return _round_floats(overview)


def tool_get_dataset_statistics(services: dict[str, Any], cheese_category: str | None = None, **_: Any) -> dict[str, Any]:
    # dataset_statistics() itself is shared with the REST /api endpoints and
    # stays full-detail; only this assistant-facing copy is trimmed, since a
    # 70-ingredient value_counts breakdown costs real tokens on questions
    # that just want "how many rows."
    stats = dict(_get_service(services).dataset_statistics(cheese_category=cheese_category))
    for key in ("food_matrices", "packaging_types", "indicator_types", "ingredient_families", "ingredients", "application_methods"):
        if key in stats:
            stats[key] = _cap_counts(stats[key])
    return _round_floats(stats)


def tool_get_feature_information(services: dict[str, Any], feature_name: str | None = None, **_: Any) -> dict[str, Any]:
    svc = _get_service(services)
    if feature_name:
        if feature_name not in FEATURE_GLOSSARY:
            return {"error": f"Unknown feature: {feature_name!r}", "known_features": sorted(FEATURE_GLOSSARY)}
        info: dict[str, Any] = {"feature": feature_name, "description": FEATURE_GLOSSARY[feature_name]}
        if feature_name in svc.numeric_and_binary:
            info["type"] = "numeric"
            info["range"] = svc.schema["numeric_ranges"].get(feature_name)
        elif feature_name in svc.categorical_cols:
            info["type"] = "categorical"
            info["options"] = svc.schema["categorical_options"].get(feature_name, [])
        return info
    return {"features": [{"feature": k, "description": v} for k, v in FEATURE_GLOSSARY.items()]}


def tool_get_model_metrics(services: dict[str, Any], model: str | None = None, **_: Any) -> dict[str, Any]:
    svc = _get_service(services)
    if model:
        resolved = svc.resolve_model_name(model)
        if resolved not in svc.metrics:
            return {"error": f"Unknown model: {model!r}", "available_models": svc.available_models}
        return _round_floats({"model": resolved, "label": svc.model_label(resolved), "is_best": resolved == svc.best_model,
                "metrics": svc.metrics[resolved]})
    ranked = sorted(svc.available_models, key=lambda m: svc.metrics[m]["validation_rmse"])
    return _round_floats({
        "best_model": svc.best_model,
        "leaderboard": [
            {"model": m, "label": svc.model_label(m), "is_best": m == svc.best_model,
             "validation_r2": svc.metrics[m]["validation_r2"], "validation_rmse": svc.metrics[m]["validation_rmse"],
             "test_r2": svc.metrics[m]["test_r2"], "test_rmse": svc.metrics[m]["test_rmse"]}
            for m in ranked
        ],
    })


def tool_predict_shelf_life(services: dict[str, Any], features: dict[str, Any] | None = None, model: str | None = None, **_: Any) -> dict[str, Any]:
    svc = _get_service(services)
    row = svc.default_row()
    row.update(features or {})
    try:
        return _round_floats(svc.predict_one(model or svc.best_model, row))
    except Exception as exc:  # noqa: BLE001 -- surfaced to the LLM as a tool error, not raised
        return {"error": str(exc)}


def tool_compare_treatments(
    services: dict[str, Any], shared: dict[str, Any] | None = None,
    candidates: list[dict[str, Any]] | None = None, model: str | None = None, **_: Any,
) -> dict[str, Any]:
    svc = _get_service(services)
    if not candidates:
        return {"error": "At least one candidate treatment is required (name, treatment_type, application_method, primary_ingredient_name, primary_concentration, primary_concentration_unit)."}
    try:
        built = [build_candidate_row(c) for c in candidates]
        return _round_floats(svc.compare_control_vs_candidates(model or svc.best_model, shared or {}, built))
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)}


def tool_explain_prediction(services: dict[str, Any], features: dict[str, Any] | None = None, model: str | None = None, top_k: int = 8, **_: Any) -> dict[str, Any]:
    svc = _get_service(services)
    row = svc.default_row()
    row.update(features or {})
    try:
        factors = svc.local_explanation(model or svc.best_model, row, top_k=top_k)
        return _round_floats({"model": svc.resolve_model_name(model or svc.best_model), "factors": factors})
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)}


def tool_get_references(services: dict[str, Any], **_: Any) -> dict[str, Any]:
    return _get_service(services).dataset_references()


# ── Specialist shelf-life system (SpecialistRegistry) ───────────────────────
#
# The current per-category production prediction path -- calls the exact
# same SpecialistRegistry/ModelService methods backend/main.py's
# /api/v6/predict and /api/v6/explain/local routes call, including the same
# hard-fail-on-missing-physical_form and support-assessment rules (never
# silently defaults a physical form or serves a prediction the production
# API itself would reject).

def tool_get_specialist_info(
    services: dict[str, Any], cheese_category: str | None = None,
    model_task: str | None = None, indicator_type: str | None = None, **_: Any,
) -> dict[str, Any]:
    reg = _get_specialist_registry(services)
    if reg is None:
        return {"error": "The specialist shelf-life system is not available (artifacts_v6/ not found)."}

    if cheese_category is None:
        return {
            "categories": list(reg.services.keys()), "tasks": TASKS,
            "loaded_specialists": {
                f"{cat}/{task}": {
                    "available": svc is not None,
                    "best_model": svc.model_label(svc.best_model) if svc else None,
                    "n_train": svc.manifest.get("n_train") if svc else None,
                }
                for cat, tasks in reg.services.items() for task, svc in tasks.items()
            },
        }

    if model_task is None and indicator_type:
        model_task = reg.indicator_task_map(cheese_category).get(indicator_type)
        if model_task is None:
            return {"error": f"Unknown indicator_type {indicator_type!r} for cheese_category {cheese_category!r}."}
    if model_task is None:
        return {
            "cheese_category": cheese_category,
            "indicator_task_map": reg.indicator_task_map(cheese_category),
            "note": "Pass model_task (or an indicator_type to resolve it) for that specialist's metrics.",
        }

    svc, routing_meta = reg.resolve(cheese_category, model_task)
    if svc is None:
        return {"error": routing_meta["reason"], "routing": routing_meta}
    return _round_floats({
        "cheese_category": cheese_category, "model_task": model_task,
        "best_model": svc.model_label(svc.best_model),
        "metrics": svc.metrics[svc.best_model],
        "n_train": svc.manifest.get("n_train"), "n_validation": svc.manifest.get("n_validation"),
        "n_test": svc.manifest.get("n_test"), "routing": routing_meta,
    })


def tool_predict_specialist_shelf_life(
    services: dict[str, Any], cheese_category: str | None = None, model_task: str | None = None,
    shared: dict[str, Any] | None = None, candidates: list[dict[str, Any]] | None = None, **_: Any,
) -> dict[str, Any]:
    reg = _get_specialist_registry(services)
    if reg is None:
        return {"error": "The specialist shelf-life system is not available (artifacts_v6/ not found)."}
    if not cheese_category or not model_task:
        return {"error": "cheese_category and model_task are both required -- call get_specialist_info first if unsure which applies."}
    if not candidates:
        return {"error": "At least one candidate treatment is required (name, treatment_type, application_method, primary_ingredient_name, primary_concentration, primary_concentration_unit); shared must include physical_form."}
    shared = shared or {}

    # Same hard-fail rules /api/v6/predict enforces: a genuinely unavailable
    # specialist, or a missing physical_form (never silently defaulted).
    support = reg.assess_prediction_support(cheese_category, model_task, shared)
    if not support["can_predict"]:
        return {"error": support["reason"], "support": support}

    svc, routing_meta = reg.resolve(cheese_category, model_task)
    try:
        built = [build_candidate_row_v6(c) for c in candidates]
        result = svc.compare_control_vs_candidates(svc.best_model, shared, built)
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)}
    result["routing"] = routing_meta
    result["support"] = support
    result["model_label"] = svc.model_label(svc.best_model)
    return _round_floats(result)


def tool_explain_specialist_prediction(
    services: dict[str, Any], cheese_category: str | None = None, model_task: str | None = None,
    row: dict[str, Any] | None = None, top_k: int = 8, **_: Any,
) -> dict[str, Any]:
    reg = _get_specialist_registry(services)
    if reg is None:
        return {"error": "The specialist shelf-life system is not available (artifacts_v6/ not found)."}
    if not cheese_category or not model_task:
        return {"error": "cheese_category and model_task are both required."}
    svc, routing_meta = reg.resolve(cheese_category, model_task)
    if svc is None:
        return {"error": routing_meta["reason"], "routing": routing_meta}
    full_row = svc.default_row()
    full_row.update(row or {})
    try:
        factors = svc.local_explanation(svc.best_model, full_row, top_k=top_k)
        return _round_floats({"factors": factors, "routing": routing_meta, "model_label": svc.model_label(svc.best_model)})
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)}


# ── Formulation efficacy classification (ClassificationService) ────────────
#
# Reuses ClassificationService exactly as backend/main.py's
# /api/classification/predict and /api/classification/explain routes do,
# including the same concentration-unit conversion (build_candidate_row_v6)
# and SHAP-based local explanation -- no separate classifier logic here.

def _classification_default_row(clf: Any) -> dict[str, Any]:
    row = {c: clf.schema["numeric_ranges"][c]["median"] for c in clf.numeric_and_binary}
    row.update({c: clf.schema["categorical_modes"].get(c, "missing") for c in clf.categorical_cols})
    return row


def tool_get_classification_info(services: dict[str, Any], model: str | None = None, **_: Any) -> dict[str, Any]:
    clf = _get_classification_service(services)
    if clf is None:
        return {"error": "The formulation classification system is not available (artifacts_classification/ not found)."}
    if model:
        resolved = clf.resolve_model_name(model)
        if resolved not in clf.metrics:
            return {"error": f"Unknown classifier: {model!r}", "available_models": clf.available_models}
        return _round_floats({
            "model": resolved, "label": clf.model_label(resolved), "is_best": resolved == clf.best_model,
            "metrics": clf.metrics[resolved], "class_definitions": clf.class_definitions,
        })
    ranked = sorted(clf.available_models, key=lambda m: clf.metrics[m]["validation"]["macro_f1"], reverse=True)
    return _round_floats({
        "best_model": clf.model_label(clf.best_model),
        "class_definitions": clf.class_definitions,
        "leaderboard": [
            {"model": m, "label": clf.model_label(m), "is_best": m == clf.best_model,
             "validation_macro_f1": clf.metrics[m]["validation"]["macro_f1"],
             "test_macro_f1": clf.metrics[m]["test"]["macro_f1"]}
            for m in ranked
        ],
    })


def tool_classify_formulation(
    services: dict[str, Any], shared: dict[str, Any] | None = None,
    candidates: list[dict[str, Any]] | None = None, model: str | None = None, **_: Any,
) -> dict[str, Any]:
    clf = _get_classification_service(services)
    if clf is None:
        return {"error": "The formulation classification system is not available (artifacts_classification/ not found)."}
    if not candidates:
        return {"error": "At least one candidate formulation is required (name, treatment_type, application_method, primary_ingredient_name, primary_concentration, primary_concentration_unit)."}
    try:
        base = _classification_default_row(clf)
        base.update(shared or {})
        rows = [{**base, **build_candidate_row_v6(c)} for c in candidates]
        results = clf.predict_many(model or clf.best_model, rows)
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)}
    return _round_floats({"results": results, "class_definitions": clf.class_definitions})


def tool_explain_classification(
    services: dict[str, Any], row: dict[str, Any] | None = None,
    model: str | None = None, top_k: int = 5, **_: Any,
) -> dict[str, Any]:
    clf = _get_classification_service(services)
    if clf is None:
        return {"error": "The formulation classification system is not available (artifacts_classification/ not found)."}
    full_row = _classification_default_row(clf)
    full_row.update(row or {})
    try:
        explanation = clf.explain_local(model or clf.best_model, full_row, top_k=top_k)
        return _round_floats(explanation)
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)}


# ── Ingredient efficacy ranking (IngredientRankingService) ─────────────────
#
# A precomputed, read-only table (see ingredient_ranking_service.py) --
# there is nothing to "predict" here, so this is a lookup/filter over the
# exact same artifacts_ingredient_ranking/ data backend/main.py's
# /api/ingredients/* routes serve. The LLM must use this instead of
# estimating an ingredient's efficacy from general knowledge whenever the
# ingredient is present in the ranking.

def tool_get_ingredient_ranking(
    services: dict[str, Any], ingredient_name: str | None = None, efficacy_class: str | None = None,
    top_n: int | None = None, **_: Any,
) -> dict[str, Any]:
    ing = _get_ingredient_service(services)
    if ing is None:
        return {"error": "The ingredient ranking system is not available (artifacts_ingredient_ranking/ not found)."}

    if ingredient_name:
        row = ing.get(ingredient_name)
        if row is None:
            return {"error": f"Unknown ingredient: {ingredient_name!r}", "known_ingredients": [r["ingredient_name"] for r in ing.rankings]}
        return _round_floats(row)

    rankings = ing.rankings
    if efficacy_class:
        rankings = [r for r in rankings if r["efficacy_class"] == efficacy_class]
    rankings = sorted(rankings, key=lambda r: r["rank"])
    if top_n:
        rankings = rankings[:top_n]
    compact = [
        {"rank": r["rank"], "ingredient_name": r["ingredient_name"], "ingredient_family": r["ingredient_family"],
         "efficacy_class": r["efficacy_class"], "adjusted_effect_pct": r["adjusted_effect_pct"], "low_confidence": r["low_confidence"]}
        for r in rankings
    ]
    return _round_floats({"rankings": compact, "class_definitions": ing.class_definitions, "total_ingredients": len(ing.rankings)})


TOOL_IMPLS: dict[str, Callable[..., dict[str, Any]]] = {
    "get_project_overview": tool_get_project_overview,
    "get_dataset_statistics": tool_get_dataset_statistics,
    "get_feature_information": tool_get_feature_information,
    "get_model_metrics": tool_get_model_metrics,
    "predict_shelf_life": tool_predict_shelf_life,
    "compare_treatments": tool_compare_treatments,
    "explain_prediction": tool_explain_prediction,
    "get_references": tool_get_references,
    "get_specialist_info": tool_get_specialist_info,
    "predict_specialist_shelf_life": tool_predict_specialist_shelf_life,
    "explain_specialist_prediction": tool_explain_specialist_prediction,
    "get_classification_info": tool_get_classification_info,
    "classify_formulation": tool_classify_formulation,
    "explain_classification": tool_explain_classification,
    "get_ingredient_ranking": tool_get_ingredient_ranking,
}

TOOL_SPECS: list[dict[str, Any]] = [
    {"type": "function", "function": {
        "name": "get_project_overview",
        "description": "Explains what Shelf-Life Studio is: its three current systems (specialist shelf-life prediction, formulation efficacy classification, ingredient efficacy ranking) plus the legacy global regression model. Call this for any question about the project's purpose or architecture.",
        "parameters": {"type": "object", "properties": {}},
    }},
    {"type": "function", "function": {
        "name": "get_dataset_statistics",
        "description": "Returns real dataset statistics (legacy global regression dataset only -- for a specific specialist's training size use get_specialist_info): row/context counts, distributions of cheese categories, food matrices, packaging types, indicators, ingredients, and shelf-life-days summary stats. Optionally filter to one cheese_category.",
        "parameters": {"type": "object", "properties": {
            "cheese_category": {"type": "string", "enum": ["hard", "semi_hard", "soft"], "description": "Optional filter."},
        }},
    }},
    {"type": "function", "function": {
        "name": "get_feature_information",
        "description": "Explains what a dataset feature/column means, and (if applicable) its valid range or categorical options. Omit feature_name to list every feature.",
        "parameters": {"type": "object", "properties": {
            "feature_name": {"type": "string", "description": "Exact column name, e.g. 'matrix_water_activity'."},
        }},
    }},
    {"type": "function", "function": {
        "name": "get_model_metrics",
        "description": "Returns validation/test metrics (R2, RMSE, MAE) for the LEGACY global regression models only (used on the Modeling/Results/Explainability pages) -- for the current specialist shelf-life system use get_specialist_info, for the formulation classifier use get_classification_info. Do not present this as 'the' best model for the whole app; it is one of several model families.",
        "parameters": {"type": "object", "properties": {
            "model": {"type": "string", "description": "One of random_forest, lightgbm, xgboost, ebm, lstm. Omit for the full leaderboard."},
        }},
    }},
    {"type": "function", "function": {
        "name": "predict_shelf_life",
        "description": "Predicts shelf_life_days using the LEGACY global regression model (not the current per-category specialist system -- use predict_specialist_shelf_life for that). Any feature not given defaults to a typical (median/mode) training value.",
        "parameters": {"type": "object", "properties": {
            "features": {"type": "object", "description": "Partial map of feature_name -> value, e.g. {\"cheese_category\": \"soft\", \"storage_temperature_c\": 4}."},
            "model": {"type": "string", "description": "Model to use; defaults to the best model."},
        }},
    }},
    {"type": "function", "function": {
        "name": "compare_treatments",
        "description": "Compares one or more candidate treatments against an untreated control using the LEGACY global regression model (use predict_specialist_shelf_life for the current per-category specialist system). Returns predicted shelf life and % improvement for each.",
        "parameters": {"type": "object", "properties": {
            "shared": {"type": "object", "description": "Shared formulation/storage conditions applied to both control and candidates (e.g. cheese_category, food_matrix, storage_temperature_c)."},
            "candidates": {"type": "array", "items": {"type": "object", "properties": {
                "name": {"type": "string"}, "treatment_type": {"type": "string"},
                "application_method": {"type": "string"}, "primary_ingredient_name": {"type": "string"},
                "primary_concentration": {"type": "number"}, "primary_concentration_unit": {"type": "string"},
                "primary_ingredient_family": {"type": "string"},
            }, "required": ["name", "treatment_type", "application_method", "primary_ingredient_name", "primary_concentration", "primary_concentration_unit"]}},
            "model": {"type": "string", "description": "Model to use; defaults to the best model."},
        }, "required": ["candidates"]},
    }},
    {"type": "function", "function": {
        "name": "explain_prediction",
        "description": "Explains a LEGACY global-model prediction (local feature attribution) -- use explain_specialist_prediction for the current per-category specialist system.",
        "parameters": {"type": "object", "properties": {
            "features": {"type": "object", "description": "Partial map of feature_name -> value describing the formulation to explain."},
            "model": {"type": "string", "description": "Model to use; defaults to the best model."},
            "top_k": {"type": "integer", "description": "How many top factors to return (default 8)."},
        }},
    }},
    {"type": "function", "function": {
        "name": "get_references",
        "description": "Returns dataset provenance: how many rows are real vs synthetic, and the synthetic generation method/rules used. Use this for 'where does this data come from' questions.",
        "parameters": {"type": "object", "properties": {}},
    }},
    {"type": "function", "function": {
        "name": "get_specialist_info",
        "description": "The CURRENT shelf-life prediction system: one specialist regression model per cheese_category (soft/semi_hard/hard) x model_task (general_shelf_life/safety_endpoint). Omit all arguments to list every specialist and whether it's loaded. Pass cheese_category (+ model_task, or an indicator_type to resolve which task applies) for that specialist's best model and metrics. Use this before predict_specialist_shelf_life if you don't already know which specialist applies.",
        "parameters": {"type": "object", "properties": {
            "cheese_category": {"type": "string", "enum": ["soft", "semi_hard", "hard"]},
            "model_task": {"type": "string", "enum": ["general_shelf_life", "safety_endpoint"]},
            "indicator_type": {"type": "string", "description": "A quality-indicator name (e.g. 'listeria_monocytogenes') -- resolves model_task if you don't already know it."},
        }},
    }},
    {"type": "function", "function": {
        "name": "predict_specialist_shelf_life",
        "description": "Runs a shelf-life prediction/comparison through the CURRENT per-category specialist system -- the same production path as the app's own Prediction page. Requires cheese_category and model_task (call get_specialist_info first if unsure which applies). shared MUST include physical_form (never defaulted -- ask the user if not given) plus any other known matrix/storage conditions; unspecified conditions fall back to that specialist's own training defaults.",
        "parameters": {"type": "object", "properties": {
            "cheese_category": {"type": "string", "enum": ["soft", "semi_hard", "hard"]},
            "model_task": {"type": "string", "enum": ["general_shelf_life", "safety_endpoint"]},
            "shared": {"type": "object", "description": "Shared conditions for both control and candidates -- MUST include physical_form; may include food_matrix, storage_temperature_c, packaging_type, etc."},
            "candidates": {"type": "array", "items": {"type": "object", "properties": {
                "name": {"type": "string"}, "treatment_type": {"type": "string"},
                "application_method": {"type": "string"}, "primary_ingredient_name": {"type": "string"},
                "primary_concentration": {"type": "number"}, "primary_concentration_unit": {"type": "string"},
                "primary_ingredient_family": {"type": "string"},
            }, "required": ["name", "treatment_type", "application_method", "primary_ingredient_name", "primary_concentration", "primary_concentration_unit"]}},
        }, "required": ["cheese_category", "model_task", "candidates"]},
    }},
    {"type": "function", "function": {
        "name": "explain_specialist_prediction",
        "description": "Explains which factors drove a CURRENT specialist prediction (local feature attribution), for a given cheese_category/model_task. Reuse the 'row' field from a predict_specialist_shelf_life candidate result if you just called that, for a consistent explanation.",
        "parameters": {"type": "object", "properties": {
            "cheese_category": {"type": "string", "enum": ["soft", "semi_hard", "hard"]},
            "model_task": {"type": "string", "enum": ["general_shelf_life", "safety_endpoint"]},
            "row": {"type": "object", "description": "Full or partial feature map describing the formulation to explain; missing values fall back to training medians/modes."},
            "top_k": {"type": "integer", "description": "How many top factors to return (default 8)."},
        }, "required": ["cheese_category", "model_task"]},
    }},
    {"type": "function", "function": {
        "name": "get_classification_info",
        "description": "The CURRENT formulation efficacy classifier: returns the Low/Medium/High tier definitions and either the full model leaderboard (omit model) or one model's metrics (pass model). Use this for 'what does classification mean' or 'which classifier is best' questions.",
        "parameters": {"type": "object", "properties": {
            "model": {"type": "string", "description": "'random_forest' or 'xgboost'. Omit for the full leaderboard."},
        }},
    }},
    {"type": "function", "function": {
        "name": "classify_formulation",
        "description": "Classifies one or more full treated formulations into a Low/Medium/High shelf-life-improvement tier using the CURRENT production classifier -- the same path as the app's Classification page. Any condition not given defaults to a typical training value (unlike predict_specialist_shelf_life, physical_form is not required here).",
        "parameters": {"type": "object", "properties": {
            "shared": {"type": "object", "description": "Shared formulation/storage conditions (e.g. cheese_category, food_matrix, storage_temperature_c)."},
            "candidates": {"type": "array", "items": {"type": "object", "properties": {
                "name": {"type": "string"}, "treatment_type": {"type": "string"},
                "application_method": {"type": "string"}, "primary_ingredient_name": {"type": "string"},
                "primary_concentration": {"type": "number"}, "primary_concentration_unit": {"type": "string"},
                "primary_ingredient_family": {"type": "string"},
            }, "required": ["name", "treatment_type", "application_method", "primary_ingredient_name", "primary_concentration", "primary_concentration_unit"]}},
            "model": {"type": "string", "description": "Classifier to use; defaults to the best model."},
        }, "required": ["candidates"]},
    }},
    {"type": "function", "function": {
        "name": "explain_classification",
        "description": "Explains which factors support/oppose each class (Low/Medium/High) for a given formulation, via the classifier's real per-prediction SHAP attribution. Use this for 'why was this formulation classified as X' questions.",
        "parameters": {"type": "object", "properties": {
            "row": {"type": "object", "description": "Full or partial feature map describing the formulation; missing values fall back to training medians/modes."},
            "model": {"type": "string", "description": "Classifier to use; defaults to the best model."},
            "top_k": {"type": "integer", "description": "How many top factors per class to return (default 5)."},
        }},
    }},
    {"type": "function", "function": {
        "name": "get_ingredient_ranking",
        "description": "The CURRENT ingredient efficacy ranking -- an ingredient's own context-adjusted effect, independent of any specific formulation. Pass ingredient_name for one ingredient's full detail (rank, tier, adjusted effect, data-support/confidence). Omit it to list the ranking (optionally filtered by efficacy_class, or limited to top_n). Always use this instead of estimating an ingredient's efficacy from general knowledge when it appears in the ranking.",
        "parameters": {"type": "object", "properties": {
            "ingredient_name": {"type": "string", "description": "Exact ingredient name, e.g. 'potassium sorbate'."},
            "efficacy_class": {"type": "string", "enum": ["Low", "Medium", "High"]},
            "top_n": {"type": "integer", "description": "Limit the list to the top N by rank."},
        }},
    }},
]

_TOOL_SPECS_BY_NAME: dict[str, dict[str, Any]] = {spec["function"]["name"]: spec for spec in TOOL_SPECS}

# Keyword -> tool names. A request only needs to match one keyword from a
# category to pull in that category's tools; multiple categories can match
# and their tools are merged (deduplicated), so a compound question still
# gets everything it plausibly needs. get_feature_information is cheap and
# broadly useful, so it rides along with every non-empty match.
_TOOL_CATEGORIES: dict[str, tuple[tuple[str, ...], tuple[str, ...]]] = {
    "specialist_prediction": (
        ("predict", "shelf life", "shelf-life", "how long", "how many days", "would it last", "would last",
         "specialist", "cheese category", "safety endpoint", "general shelf life", "which specialist"),
        ("predict_specialist_shelf_life", "get_specialist_info", "explain_specialist_prediction", "get_feature_information"),
    ),
    "specialist_explanation": (
        ("why", "factor", "drove", "driving"),
        ("explain_specialist_prediction", "predict_specialist_shelf_life", "get_feature_information"),
    ),
    "classification": (
        ("classify", "classification", "efficacy tier", "efficacy class", "low medium high", "formulation efficacy"),
        ("classify_formulation", "get_classification_info", "explain_classification", "get_feature_information"),
    ),
    "ingredient_ranking": (
        ("ingredient ranking", "ingredient rank", "rank ingredient", "ingredient efficacy", "which ingredient",
         "context-adjusted", "context adjusted"),
        ("get_ingredient_ranking", "get_feature_information"),
    ),
    "comparison": (
        ("compare", "versus", " vs ", "better than", "improve", "improvement", "treatment", "ingredient"),
        ("compare_treatments", "get_feature_information"),
    ),
    "legacy_model": (
        ("legacy", "global model", "accuracy", "metric", "rmse", "r2", "r-squared", "performs"),
        ("get_model_metrics",),
    ),
    "dataset": (
        ("how many", "row", "dataset", "statistic", "distribution", "count", "category", "categories"),
        ("get_dataset_statistics",),
    ),
    "project": (
        ("project", "pipeline", "methodology", "how does this work", "about this app", "about shelf-life studio", "architecture"),
        ("get_project_overview",),
    ),
    "references": (
        ("reference", "source", "citation", "provenance", "where does this data come from", "real data", "synthetic"),
        ("get_references",),
    ),
    "feature": (
        ("mean", "definition", "define", "feature", "column"),
        ("get_feature_information",),
    ),
}

# page_context.current_page substring -> tools to bias toward for an
# otherwise-ambiguous message on that page. Checked in order; a page match
# adds to (never replaces) whatever the keyword categories above already
# matched.
_PAGE_TOOL_HINTS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("/prediction", ("predict_specialist_shelf_life", "explain_specialist_prediction", "get_specialist_info", "get_feature_information")),
    ("/classification", ("classify_formulation", "explain_classification", "get_classification_info", "get_feature_information")),
    ("/ingredients", ("get_ingredient_ranking", "get_feature_information")),
    ("/results", ("get_model_metrics", "explain_prediction")),
    ("/modeling", ("get_model_metrics",)),
    ("/explainability", ("explain_prediction", "explain_specialist_prediction", "explain_classification")),
)


def select_tools(text: str, page_context: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    """Returns the subset of TOOL_SPECS relevant to `text`, so a provider
    request doesn't have to carry all 8 tool schemas (and their token cost)
    when only 1-3 are plausibly needed. Falls back to the full TOOL_SPECS
    whenever nothing matches -- an uncertain/compound question should never
    be under-served just to save tokens."""
    t = (text or "").lower()
    matched: list[str] = []
    for keywords, tool_names in _TOOL_CATEGORIES.values():
        if any(kw in t for kw in keywords):
            for name in tool_names:
                if name not in matched:
                    matched.append(name)

    if page_context:
        current_page = str(page_context.get("current_page") or "")
        for prefix, tool_names in _PAGE_TOOL_HINTS:
            if prefix in current_page:
                for name in tool_names:
                    if name not in matched:
                        matched.append(name)

    if not matched:
        return TOOL_SPECS
    return [_TOOL_SPECS_BY_NAME[name] for name in matched if name in _TOOL_SPECS_BY_NAME]
