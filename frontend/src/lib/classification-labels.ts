// Human-readable labels for the classifier's raw feature/category names --
// mirrors feature_naming.py's FEATURE_LABELS (backend, used for per-prediction
// explanation factors) so the overview page's descriptive charts use the same
// wording as the "why this result" explanation, not a second inconsistent
// vocabulary. This file is display-only (no business logic), safe to keep as
// a separate frontend copy of a backend dict, same pattern as this codebase's
// existing per-component `prettify()` helpers.

export const FEATURE_LABELS: Record<string, string> = {
  food_matrix: "Cheese type",
  cheese_category: "Cheese category",
  matrix_ph: "pH",
  matrix_water_activity: "Water activity",
  matrix_moisture_pct: "Moisture",
  matrix_fat_pct: "Fat content",
  matrix_protein_pct: "Protein content",
  matrix_salt_pct: "Salt content",
  matrix_ripening_days: "Ripening time",
  pasteurization_applied: "Pasteurization",
  storage_temperature_c: "Storage temperature",
  packaging_type: "Packaging",
  headspace_oxygen_pct: "Headspace oxygen",
  headspace_co2_pct: "Headspace CO2",
  headspace_n2_pct: "Headspace nitrogen",
  indicator_group: "Quality indicator category",
  indicator_type: "Quality indicator",
  indicator_threshold: "Indicator threshold",
  indicator_unit: "Indicator unit",
  initial_indicator_value: "Initial indicator value",
  treatment_type: "Treatment type",
  application_method: "Application method",
  ingredient_count: "Number of ingredients",
  primary_ingredient_name: "Ingredient",
  primary_ingredient_family: "Ingredient family",
  primary_concentration: "Ingredient concentration",
  primary_concentration_unit: "Concentration unit",
};

const VALUE_OVERRIDES: Record<string, string> = {
  semi_hard: "Semi-hard",
};

/** Cosmetic formatting for a raw categorical value -- known overrides first,
 * then underscore-to-space + capitalize. Never reinterprets the value. */
export function humanizeValue(value: string): string {
  if (VALUE_OVERRIDES[value]) return VALUE_OVERRIDES[value];
  const s = value.replace(/_/g, " ");
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export function humanizeFeature(raw: string): string {
  return FEATURE_LABELS[raw] ?? humanizeValue(raw);
}
