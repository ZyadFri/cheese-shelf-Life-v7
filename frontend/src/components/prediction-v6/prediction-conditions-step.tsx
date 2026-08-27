"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  FlaskConical,
  Loader2,
  PackageOpen,
  ShieldAlert,
  TestTube2,
  Thermometer,
} from "lucide-react";
import { toast } from "sonner";

import { usePredictionV6, NO_TREATMENT } from "@/components/prediction-v6-store";
import { titleCase } from "@/components/prediction-v6/cheese-search-step";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type SchemaV6Data, type ModelTask } from "@/lib/api";

const EASE = [0.16, 1, 0.3, 1] as const;

function prettify(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).replace(/_/g, " ");
}

function PrettyValue({ map }: { map?: Record<string, string> }) {
  return <SelectValue>{(value: unknown) => (map && typeof value === "string" && map[value]) || prettify(value)}</SelectValue>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[0.5rem] font-semibold uppercase tracking-[0.075em] text-[#89777e]">
        {label}{required && <span className="ml-1 text-[#b32b4c]">*</span>}
      </Label>
      {children}
    </div>
  );
}

function nullableNumber(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

export function PredictionConditionsStep() {
  const { state, dispatch } = usePredictionV6();
  const [submitting, setSubmitting] = React.useState(false);
  const { generalSchema, safetySchema, entry, physicalForm, baseCheeseName } = state;

  if (!generalSchema || !entry || !physicalForm || !baseCheeseName) return null;

  const activeSchema: SchemaV6Data = state.modelTask === "safety_endpoint" && safetySchema ? safetySchema : generalSchema;
  const isSafety = state.modelTask === "safety_endpoint";

  const [indicatorTaskMap, setIndicatorTaskMap] = React.useState<Record<string, ModelTask> | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    api.routingV6(entry.cheeseCategory).then((response) => {
      if (!cancelled) setIndicatorTaskMap(response.indicator_task_map);
    });
    return () => { cancelled = true; };
  }, [entry.cheeseCategory]);

  function onIndicatorTypeChange(indicatorType: string) {
    const task = indicatorTaskMap?.[indicatorType];
    if (!task) return;
    const schemaForTask = task === "safety_endpoint" ? safetySchema : generalSchema;
    if (!schemaForTask) return;

    const group = schemaForTask.categorical_modes.indicator_group ?? schemaForTask.categorical_options.indicator_group?.[0] ?? "";
    const unit = schemaForTask.categorical_modes.indicator_unit ?? schemaForTask.categorical_options.indicator_unit?.[0] ?? "";
    dispatch({ type: "selectEndpoint", group, indicatorType, unit, task });
  }

  function onIngredientChange(name: string) {
    if (name === "none") {
      dispatch({ type: "setTreatment", patch: { ...NO_TREATMENT } });
      return;
    }

    const treatmentType = activeSchema.categorical_options.treatment_type.find((value) => value !== "none") ?? activeSchema.categorical_modes.treatment_type ?? "";
    const applicationMethod = activeSchema.categorical_options.application_method.find((value) => value !== "none") ?? activeSchema.categorical_modes.application_method ?? "";
    const concentration = activeSchema.numeric_ranges.canonical_concentration_value?.median ?? null;
    const concentrationUnit =
      activeSchema.categorical_modes.canonical_concentration_unit ??
      activeSchema.categorical_modes.primary_concentration_unit ??
      activeSchema.categorical_options.canonical_concentration_unit?.find((value) => value !== "none") ??
      activeSchema.categorical_options.primary_concentration_unit?.find((value) => value !== "none") ??
      "";

    dispatch({
      type: "setTreatment",
      patch: {
        ingredientName: name,
        ingredientFamily: null,
        treatmentType,
        applicationMethod,
        concentration,
        concentrationUnit,
      },
    });
  }

  const treatmentMissing =
    state.treatment.ingredientName !== "none" &&
    (!state.treatment.treatmentType || !state.treatment.applicationMethod || state.treatment.concentration === null || !state.treatment.concentrationUnit);

  const requiredMissing =
    !indicatorTaskMap || state.storageTemperatureC === null || !state.packagingType || state.pasteurizationApplied === null ||
    !state.indicatorGroup || !state.indicatorType || !state.indicatorUnit || state.indicatorThreshold === null || state.initialIndicatorValue === null || treatmentMissing;

  async function handleSubmit() {
    if (requiredMissing || submitting || !entry) return;
    const primaryConcentration = state.treatment.ingredientName === "none" ? 0 : state.treatment.concentration;
    const pasteurizationApplied = state.pasteurizationApplied;
    if (primaryConcentration === null || pasteurizationApplied === null) return;

    setSubmitting(true);
    try {
      const shared = {
        food_matrix: state.foodMatrix,
        physical_form: physicalForm,
        storage_temperature_c: state.storageTemperatureC,
        packaging_type: state.packagingType,
        indicator_group: state.indicatorGroup,
        indicator_type: state.indicatorType,
        indicator_unit: state.indicatorUnit,
        indicator_threshold: state.indicatorThreshold,
        initial_indicator_value: state.initialIndicatorValue,
        pasteurization_applied: pasteurizationApplied ? 1 : 0,
        headspace_oxygen_pct: state.headspaceOxygenPct,
        headspace_co2_pct: state.headspaceCo2Pct,
        headspace_n2_pct: state.headspaceN2Pct,
        ...state.matrixValues,
      };

      const result = await api.predictV6({
        cheese_category: entry.cheeseCategory,
        model_task: state.modelTask,
        shared,
        candidates: [{
          name: state.treatment.ingredientName === "none" ? "Untreated" : "Treatment",
          treatment_type: state.treatment.treatmentType,
          application_method: state.treatment.applicationMethod,
          primary_ingredient_name: state.treatment.ingredientName,
          primary_concentration: primaryConcentration,
          primary_concentration_unit: state.treatment.concentrationUnit,
          primary_ingredient_family: state.treatment.ingredientFamily,
        }],
      });

      dispatch({ type: "setResult", result });
      toast.success("Prediction complete");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Prediction failed");
    } finally {
      setSubmitting(false);
    }
  }

  const controlClass = "h-10 rounded-[10px] border-[#e3d9dd] bg-white text-[0.7rem] shadow-none focus-visible:ring-[#a63b5a]/20";

  return (
    <div className="mx-auto grid max-w-[1060px] gap-5 pb-24 pt-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <button
          type="button"
          onClick={() => dispatch({ type: "goto", step: "profile" })}
          className="inline-flex items-center gap-1.5 text-[0.56rem] font-medium text-[#987e87] transition-colors hover:text-[#7d1b3a]"
        >
          <ArrowLeft className="size-3.5" /> Edit profile
        </button>

        <FormSection number={1} icon={<Thermometer className="size-4" />} title="Cheese composition" description="Auto-filled from backend category medians — adjust only when you know the product-specific value.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["matrix_ph", "matrix_water_activity", "matrix_moisture_pct", "matrix_fat_pct", "matrix_protein_pct", "matrix_salt_pct", "matrix_ripening_days"].map((column) => {
              const currentValue = state.matrixValues[column];
              return (
                <Field key={column} label={column.replace("matrix_", "").replace(/_/g, " ")}>
                  <Input
                    type="number"
                    className={controlClass}
                    value={currentValue === null || currentValue === undefined ? "" : Number(currentValue)}
                    onChange={(event) => dispatch({ type: "setCondition", patch: { matrixValues: { ...state.matrixValues, [column]: nullableNumber(event.target.value) } } })}
                  />
                </Field>
              );
            })}
            <Field label="Pasteurization applied" required>
              <Select value={state.pasteurizationApplied === null ? "" : state.pasteurizationApplied ? "1" : "0"} onValueChange={(value) => dispatch({ type: "setCondition", patch: { pasteurizationApplied: value === "1" } })}>
                <SelectTrigger className={`w-full ${controlClass}`}><PrettyValue map={{ "1": "Yes", "0": "No" }} /></SelectTrigger>
                <SelectContent><SelectItem value="1">Yes</SelectItem><SelectItem value="0">No</SelectItem></SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection number={2} icon={<PackageOpen className="size-4" />} title="Storage & packaging" description="Define the environmental and package conditions used for the prediction.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Storage temperature (°C)" required>
              <Input type="number" className={controlClass} value={state.storageTemperatureC ?? ""} onChange={(event) => dispatch({ type: "setCondition", patch: { storageTemperatureC: nullableNumber(event.target.value) } })} />
            </Field>
            <Field label="Packaging type" required>
              <Select value={state.packagingType ?? ""} onValueChange={(value) => value && dispatch({ type: "setCondition", patch: { packagingType: value } })}>
                <SelectTrigger className={`w-full ${controlClass}`}><PrettyValue /></SelectTrigger>
                <SelectContent>{activeSchema.categorical_options.packaging_type.map((option) => <SelectItem key={option} value={option}>{prettify(option)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Headspace O₂ (%)">
              <Input type="number" className={controlClass} value={state.headspaceOxygenPct ?? ""} onChange={(event) => dispatch({ type: "setCondition", patch: { headspaceOxygenPct: nullableNumber(event.target.value) } })} />
            </Field>
            <Field label="Headspace CO₂ (%)">
              <Input type="number" className={controlClass} value={state.headspaceCo2Pct ?? ""} onChange={(event) => dispatch({ type: "setCondition", patch: { headspaceCo2Pct: nullableNumber(event.target.value) } })} />
            </Field>
            <Field label="Headspace N₂ (%)">
              <Input type="number" className={controlClass} value={state.headspaceN2Pct ?? ""} onChange={(event) => dispatch({ type: "setCondition", patch: { headspaceN2Pct: nullableNumber(event.target.value) } })} />
            </Field>
          </div>
        </FormSection>

        <FormSection number={3} icon={<Activity className="size-4" />} title="Prediction endpoint" description="Indicator routing is read from the backend specialist registry; safety indicators automatically switch to the safety-focused path.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Indicator" required>
              <Select disabled={!indicatorTaskMap} value={state.indicatorType ?? ""} onValueChange={(value) => value && onIndicatorTypeChange(value)}>
                <SelectTrigger className={`w-full ${controlClass}`}><PrettyValue /></SelectTrigger>
                <SelectContent>
                  {generalSchema.categorical_options.indicator_type.map((option) => <SelectItem key={option} value={option}>{prettify(option)}</SelectItem>)}
                  {safetySchema && safetySchema.categorical_options.indicator_type.map((option) => (
                    <SelectItem key={`safety-${option}`} value={option}>{prettify(option)} (safety)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Indicator group" required>
              <Select value={state.indicatorGroup ?? ""} onValueChange={(value) => value && dispatch({ type: "setCondition", patch: { indicatorGroup: value } })}>
                <SelectTrigger className={`w-full ${controlClass}`}><PrettyValue /></SelectTrigger>
                <SelectContent>{activeSchema.categorical_options.indicator_group.map((option) => <SelectItem key={option} value={option}>{prettify(option)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Indicator unit" required>
              <Select value={state.indicatorUnit ?? ""} onValueChange={(value) => value && dispatch({ type: "setCondition", patch: { indicatorUnit: value } })}>
                <SelectTrigger className={`w-full ${controlClass}`}><PrettyValue /></SelectTrigger>
                <SelectContent>{activeSchema.categorical_options.indicator_unit.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={`Threshold (${state.indicatorUnit ?? ""})`} required>
              <Input type="number" className={controlClass} value={state.indicatorThreshold ?? ""} onChange={(event) => dispatch({ type: "setCondition", patch: { indicatorThreshold: nullableNumber(event.target.value) } })} />
            </Field>
            <Field label={`Initial value (${state.indicatorUnit ?? ""})`} required>
              <Input type="number" className={controlClass} value={state.initialIndicatorValue ?? ""} onChange={(event) => dispatch({ type: "setCondition", patch: { initialIndicatorValue: nullableNumber(event.target.value) } })} />
            </Field>
          </div>

          <AnimatePresence>
            {isSafety && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-4 flex items-start gap-2.5 rounded-[13px] border border-[#ead7b7] bg-[#fffaf0] px-4 py-3">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[#a36d12]" />
                  <div>
                    <p className="text-[0.58rem] font-semibold text-[#71521e]">Safety-focused prediction, not a challenge-growth model</p>
                    <p className="mt-1 text-[0.52rem] leading-4 text-[#907850]">This route estimates shelf life to a safety-related indicator threshold using the available training context. It does not simulate pathogen challenge-growth curves.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </FormSection>

        <FormSection number={4} icon={<TestTube2 className="size-4" />} title="Preservation treatment" description="Optional — leave as None to predict the untreated baseline only.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Ingredient">
              <Select value={state.treatment.ingredientName} onValueChange={(value) => value && onIngredientChange(value)}>
                <SelectTrigger className={`w-full ${controlClass}`}><PrettyValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {activeSchema.categorical_options.primary_ingredient_name.filter((option) => option !== "none").map((option) => <SelectItem key={option} value={option}>{prettify(option)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <AnimatePresence>
              {state.treatment.ingredientName !== "none" && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Field label="Application method" required>
                      <Select value={state.treatment.applicationMethod} onValueChange={(value) => value && dispatch({ type: "setTreatment", patch: { applicationMethod: value } })}>
                        <SelectTrigger className={`w-full ${controlClass}`}><PrettyValue /></SelectTrigger>
                        <SelectContent>{activeSchema.categorical_options.application_method.filter((option) => option !== "none").map((option) => <SelectItem key={option} value={option}>{prettify(option)}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Field label="Concentration" required>
                      <div className="flex gap-2">
                        <Input type="number" className={controlClass} value={state.treatment.concentration ?? ""} onChange={(event) => dispatch({ type: "setTreatment", patch: { concentration: nullableNumber(event.target.value) } })} />
                        <Input className={`w-24 ${controlClass}`} value={state.treatment.concentrationUnit} onChange={(event) => dispatch({ type: "setTreatment", patch: { concentrationUnit: event.target.value } })} placeholder="unit" />
                      </div>
                    </Field>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </FormSection>
      </div>

      <aside className="lg:sticky lg:top-[86px] lg:self-start">
        <div className="overflow-hidden rounded-[24px] border border-[#e7d9de] bg-[linear-gradient(145deg,#fff,#fff9fa)] shadow-[0_26px_60px_-42px_rgba(83,26,45,.5)]">
          <div className="border-b border-[#eee3e7] px-5 py-4">
            <p className="text-[1rem] font-medium tracking-[-0.025em] text-[#3c1724]" style={{ fontFamily: "var(--font-display)" }}>Prediction context</p>
            <p className="mt-1 text-[0.54rem] leading-4 text-[#97838b]">Live summary of the values currently configured.</p>
          </div>

          <div className="px-5 py-2">
            <SummaryRow label="Cheese" value={titleCase(baseCheeseName)} sub={`${entry.cheeseCategory.replace("_", "-")} · ${prettify(physicalForm)}`} />
            <SummaryRow label="Storage" value={state.storageTemperatureC === null ? "—" : `${state.storageTemperatureC} °C`} />
            <SummaryRow label="Packaging" value={prettify(state.packagingType)} />
            <SummaryRow label="Endpoint" value={prettify(state.indicatorType)} />
            <SummaryRow label="Treatment" value={state.treatment.ingredientName === "none" ? "None (baseline)" : `${prettify(state.treatment.ingredientName)} · ${state.treatment.concentration ?? "—"}${state.treatment.concentrationUnit ? ` ${state.treatment.concentrationUnit}` : ""}`} />
          </div>

          {isSafety && <div className="mx-5 mb-2"><Badge variant="warning" size="sm">Safety-focused route</Badge></div>}

          <div className="border-t border-[#eee3e7] p-4">
            <Button
              size="lg"
              className="w-full rounded-[11px] bg-[linear-gradient(135deg,#9c1f42,#7d1534)] text-white shadow-[0_16px_35px_-20px_rgba(116,16,49,.72)] hover:bg-[#78132f]"
              disabled={requiredMissing || submitting}
              onClick={handleSubmit}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
              {submitting ? "Predicting…" : "Generate prediction"}
            </Button>
            {requiredMissing && <p className="mt-2 text-center text-[0.48rem] text-[#b04763]">Waiting for backend routing and all required fields.</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}

function FormSection({
  number,
  icon,
  title,
  description,
  children,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#e8dce0] bg-white/90 shadow-[0_20px_48px_-42px_rgba(80,27,43,.44)] backdrop-blur-xl">
      <div className="flex items-start gap-3 border-b border-[#f0e7ea] px-5 py-4 sm:px-6">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f6e4e9] text-[0.74rem] font-semibold text-[#8f1b3b]">{number}</span>
        <span className="mt-1 flex size-6 shrink-0 items-center justify-center text-[#a02a4b]">{icon}</span>
        <div>
          <h2 className="text-[0.9rem] font-semibold tracking-[-0.02em] text-[#33262b]">{title}</h2>
          <p className="mt-0.5 max-w-[70ch] text-[0.55rem] leading-4 text-[#95828a]">{description}</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f0e7ea] py-3 last:border-0">
      <span className="shrink-0 text-[0.54rem] text-[#99858d]">{label}</span>
      <span className="text-right">
        <strong className="block max-w-[165px] text-[0.58rem] font-semibold leading-4 text-[#403238]">{value}</strong>
        {sub && <span className="mt-0.5 block text-[0.47rem] text-[#aa969d]">{sub}</span>}
      </span>
    </div>
  );
}
