"use client";

import * as React from "react";
import type {
  CheeseCatalogEntry, CheeseCategory, ModelTask, PhysicalFormOption,
  PredictV6Result, ResolvedSupport, SchemaV6Data,
} from "@/lib/api";

export type FlowStep = "cheese" | "form" | "profile" | "conditions" | "results";

export interface TreatmentState {
  ingredientName: string;
  ingredientFamily: string | null;
  concentration: number | null;
  concentrationUnit: string;
  applicationMethod: string;
  treatmentType: string;
}

export const NO_TREATMENT: TreatmentState = {
  ingredientName: "none",
  ingredientFamily: "none",
  concentration: 0,
  concentrationUnit: "none",
  applicationMethod: "none",
  treatmentType: "none",
};

export interface PredictionV6State {
  step: FlowStep;
  baseCheeseName: string | null;
  entry: CheeseCatalogEntry | null;
  cheeseCategory: CheeseCategory | null;
  foodMatrix: string | null;
  physicalForm: string | null;
  physicalFormOption: PhysicalFormOption | null;
  supportLevel: ResolvedSupport | null;
  generalSchema: SchemaV6Data | null;
  safetySchema: SchemaV6Data | null;
  modelTask: ModelTask;
  storageTemperatureC: number | null;
  matrixValues: Record<string, unknown>;
  packagingType: string | null;
  headspaceOxygenPct: number | null;
  headspaceCo2Pct: number | null;
  headspaceN2Pct: number | null;
  pasteurizationApplied: boolean | null;
  indicatorGroup: string | null;
  indicatorType: string | null;
  indicatorUnit: string | null;
  indicatorThreshold: number | null;
  initialIndicatorValue: number | null;
  treatment: TreatmentState;
  result: PredictV6Result | null;
}

const initialState: PredictionV6State = {
  step: "cheese",
  baseCheeseName: null,
  entry: null,
  cheeseCategory: null,
  foodMatrix: null,
  physicalForm: null,
  physicalFormOption: null,
  supportLevel: null,
  generalSchema: null,
  safetySchema: null,
  modelTask: "general_shelf_life",
  storageTemperatureC: null,
  matrixValues: {},
  packagingType: null,
  headspaceOxygenPct: null,
  headspaceCo2Pct: null,
  headspaceN2Pct: null,
  pasteurizationApplied: null,
  indicatorGroup: null,
  indicatorType: null,
  indicatorUnit: null,
  indicatorThreshold: null,
  initialIndicatorValue: null,
  treatment: { ...NO_TREATMENT },
  result: null,
};

type Action =
  | { type: "goto"; step: FlowStep }
  | { type: "selectCheese"; baseCheeseName: string; entry: CheeseCatalogEntry }
  | { type: "selectPhysicalForm"; option: PhysicalFormOption }
  | { type: "setSchemas"; general: SchemaV6Data; safety: SchemaV6Data | null }
  | { type: "setCondition"; patch: Partial<PredictionV6State> }
  | { type: "setTreatment"; patch: Partial<TreatmentState> }
  | { type: "selectEndpoint"; group: string; indicatorType: string; unit: string; task: ModelTask }
  | { type: "setResult"; result: PredictV6Result }
  | { type: "changeCheese" }
  | { type: "changePresentation" }
  | { type: "reset" };

function parseBackendBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

function reducer(state: PredictionV6State, action: Action): PredictionV6State {
  switch (action.type) {
    case "goto":
      return { ...state, step: action.step };
    case "selectCheese":
      return {
        ...initialState,
        step: "form",
        baseCheeseName: action.baseCheeseName,
        entry: action.entry,
        cheeseCategory: action.entry.cheeseCategory,
      };
    case "selectPhysicalForm":
      return {
        ...state,
        step: "profile",
        physicalForm: action.option.physicalForm,
        foodMatrix: action.option.foodMatrix,
        physicalFormOption: action.option,
        supportLevel: action.option.support,
      };
    case "setSchemas": {
      const schema = action.general;
      const matrixColumns = [
        "matrix_ph",
        "matrix_water_activity",
        "matrix_moisture_pct",
        "matrix_fat_pct",
        "matrix_protein_pct",
        "matrix_salt_pct",
        "matrix_ripening_days",
      ];
      const backendMatrixMedians = Object.fromEntries(
        matrixColumns.flatMap((column) => {
          const median = schema.numeric_ranges[column]?.median;
          return median === undefined || median === null ? [] : [[column, median]];
        }),
      );

      return {
        ...state,
        generalSchema: schema,
        safetySchema: action.safety,
        storageTemperatureC: state.storageTemperatureC ?? schema.numeric_ranges.storage_temperature_c?.median ?? null,
        packagingType: state.packagingType ?? schema.categorical_modes.packaging_type ?? schema.categorical_options.packaging_type?.[0] ?? null,
        headspaceOxygenPct: state.headspaceOxygenPct ?? schema.numeric_ranges.headspace_oxygen_pct?.median ?? null,
        headspaceCo2Pct: state.headspaceCo2Pct ?? schema.numeric_ranges.headspace_co2_pct?.median ?? null,
        headspaceN2Pct: state.headspaceN2Pct ?? schema.numeric_ranges.headspace_n2_pct?.median ?? null,
        pasteurizationApplied: state.pasteurizationApplied ?? parseBackendBoolean(schema.control_template.pasteurization_applied),
        indicatorGroup: state.indicatorGroup ?? schema.categorical_modes.indicator_group ?? schema.categorical_options.indicator_group?.[0] ?? null,
        indicatorType: state.indicatorType ?? schema.categorical_modes.indicator_type ?? schema.categorical_options.indicator_type?.[0] ?? null,
        indicatorUnit: state.indicatorUnit ?? schema.categorical_modes.indicator_unit ?? schema.categorical_options.indicator_unit?.[0] ?? null,
        indicatorThreshold: state.indicatorThreshold ?? schema.numeric_ranges.indicator_threshold?.median ?? null,
        initialIndicatorValue: state.initialIndicatorValue ?? schema.numeric_ranges.initial_indicator_value?.median ?? null,
        matrixValues: Object.keys(state.matrixValues).length > 0 ? state.matrixValues : backendMatrixMedians,
      };
    }
    case "setCondition":
      return { ...state, ...action.patch };
    case "setTreatment":
      return { ...state, treatment: { ...state.treatment, ...action.patch } };
    case "selectEndpoint":
      return {
        ...state,
        indicatorGroup: action.group,
        indicatorType: action.indicatorType,
        indicatorUnit: action.unit,
        modelTask: action.task,
      };
    case "setResult":
      return { ...state, step: "results", result: action.result };
    case "changeCheese":
      return { ...initialState, step: "cheese" };
    case "changePresentation":
      return { ...state, step: "form", physicalForm: null, physicalFormOption: null, supportLevel: null };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

interface PredictionV6ContextValue {
  state: PredictionV6State;
  dispatch: React.Dispatch<Action>;
}

const PredictionV6Context = React.createContext<PredictionV6ContextValue | null>(null);

export function PredictionV6StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const value = React.useMemo(() => ({ state, dispatch }), [state]);
  return <PredictionV6Context.Provider value={value}>{children}</PredictionV6Context.Provider>;
}

export function usePredictionV6() {
  const context = React.useContext(PredictionV6Context);
  if (!context) throw new Error("usePredictionV6 must be used within PredictionV6StoreProvider");
  return context;
}
