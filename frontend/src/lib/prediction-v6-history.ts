import type { CheeseCategory, ModelTask, PredictV6Result } from "@/lib/api";

/**
 * Local, per-browser history of V6 predictions for the Results page.
 * The V6 wizard (unlike the legacy /api/predict flow) never wrote into
 * PredictionStoreProvider, so /app/results always showed "No prediction
 * yet" even right after a successful prediction. This is a separate,
 * localStorage-backed list (not the in-memory legacy store) so the history
 * also survives a page refresh -- capped at the most recent MAX_ENTRIES.
 */
export interface PredictionHistoryEntry {
  id: string;
  timestamp: number;
  cheeseName: string;
  cheeseCategory: CheeseCategory;
  modelTask: ModelTask;
  physicalForm: string | null;
  treated: boolean;
  result: PredictV6Result;
}

const STORAGE_KEY = "shelf_life_v6_prediction_history";
const MAX_ENTRIES = 15;

export function getPredictionHistory(): PredictionHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addPredictionToHistory(entry: Omit<PredictionHistoryEntry, "id" | "timestamp">): void {
  try {
    const next: PredictionHistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };
    const updated = [next, ...getPredictionHistory()].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage unavailable (private browsing, disabled storage) -- the result
    // still renders for this session via the wizard's own state either way.
  }
}

export function clearPredictionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
