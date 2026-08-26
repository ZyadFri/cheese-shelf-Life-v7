"use client";

import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BarHChart } from "@/components/charts/bar-h-chart";
import { cn } from "@/lib/utils";

/**
 * Static reconstructions of real screens, used only inside the landing page.
 *
 * EVERY number below is a real figure from the current V7 artifacts, read
 * directly out of the repository at design time:
 *   - leaderboard  -> artifacts_v7/soft/general_shelf_life/metrics.json
 *   - attribution  -> artifacts_v7/soft/general_shelf_life/feature_importance.json
 *                     (lightgbm permutation importance)
 *   - category MAE -> v7_external_test_predictions.csv (21 literature cases)
 * They are intentionally hardcoded rather than fetched: the landing page is
 * public and must render without an API session. If the models are retrained,
 * these need to be refreshed from those same files -- never edited by hand to
 * look better.
 */

/* Real: soft / general_shelf_life validation metrics, ranked by RMSE.
   LightGBM is the selected model per training_manifest.json's
   best_model_by_validation_rmse. */
const LEADERBOARD = [
  { model: "LightGBM", r2: "0.972", rmse: "4.49", best: true },
  { model: "XGBoost", r2: "0.969", rmse: "4.65", best: false },
  { model: "Random Forest", r2: "0.955", rmse: "5.67", best: false },
  // Abbreviated for the preview's column width; "Explainable Boosting
  // Machine" is written out in full everywhere it has room.
  { model: "EBM", r2: "0.944", rmse: "6.32", best: false },
];

export function LeaderboardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "p-3.5" : "p-4"}>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <p className="type-label font-medium text-foreground">Model leaderboard</p>
        <p className="type-caption text-subtle-foreground">Soft · validation</p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="type-caption pb-1.5 text-left font-medium tracking-[0.04em] text-subtle-foreground uppercase">
              Model
            </th>
            <th className="type-caption w-[58px] pb-1.5 text-right font-medium tracking-[0.04em] text-subtle-foreground uppercase">
              R²
            </th>
            <th className="type-caption w-[58px] pb-1.5 text-right font-medium tracking-[0.04em] text-subtle-foreground uppercase">
              RMSE
            </th>
          </tr>
        </thead>
        <tbody>
          {LEADERBOARD.map((row) => (
            <tr key={row.model} className="border-b border-border last:border-0">
              <td className="py-[7px] text-[0.8125rem] text-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="truncate">{row.model}</span>
                  {row.best && <Badge variant="accent">Best</Badge>}
                </span>
              </td>
              <td className="numeral py-[7px] text-right text-[0.8125rem] text-foreground">{row.r2}</td>
              <td className="numeral py-[7px] text-right text-[0.8125rem] text-muted-foreground">
                {row.rmse}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Real: the six trained specialists and each one's selected model +
   validation R², from artifacts_v7/{category}/{task}/. Reported honestly --
   the safety-endpoint specialists genuinely score far lower than the
   general-shelf-life ones, and that is not smoothed over here. */
const SPECIALISTS = [
  { category: "Soft", task: "Shelf life", model: "LightGBM", r2: 0.972 },
  { category: "Semi-hard", task: "Shelf life", model: "LightGBM", r2: 0.931 },
  { category: "Hard", task: "Shelf life", model: "LightGBM", r2: 0.916 },
  { category: "Soft", task: "Safety", model: "XGBoost", r2: 0.592 },
  { category: "Semi-hard", task: "Safety", model: "XGBoost", r2: 0.115 },
  { category: "Hard", task: "Safety", model: "XGBoost", r2: 0.008 },
];

export function SpecialistPreview() {
  return (
    <div className="p-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <p className="type-label font-medium text-foreground">Specialist routing</p>
        <p className="type-caption text-subtle-foreground">Validation R²</p>
      </div>
      <div className="flex flex-col">
        {SPECIALISTS.map((s) => (
          <div
            key={`${s.category}-${s.task}`}
            className="flex items-center gap-2 border-b border-border py-[7px] last:border-0"
          >
            <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-foreground">
              {s.category}
            </span>
            <span className="type-caption w-[52px] shrink-0 text-muted-foreground">{s.task}</span>
            <span
              className={cn(
                "numeral w-[42px] shrink-0 text-right text-[0.8125rem]",
                s.r2 >= 0.9 ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.r2.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Real: lightgbm permutation importance, soft/general_shelf_life. These are
   global importances (mean increase in error when a feature is shuffled), not
   signed per-prediction contributions -- labelled as such below. */
// Labelled with the same human-readable names the app itself uses for these
// columns (see feature_naming.py / classification-labels.ts) rather than raw
// identifiers, so nothing has to be truncated mid-word.
const FACTORS = [
  { feature: "Salt content", value: 0.492 },
  { feature: "Storage temperature", value: 0.136 },
  { feature: "Ripening time", value: 0.1 },
  { feature: "Fat content", value: 0.029 },
  { feature: "Water activity", value: 0.012 },
  { feature: "Ingredient concentration", value: 0.01 },
];

export function ExplainPreview({ height = 210 }: { height?: number }) {
  const data = FACTORS.map((f) => ({ label: f.feature, value: f.value }));
  return (
    <div className="p-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <p className="type-label font-medium text-foreground">Feature importance</p>
        <p className="type-caption text-subtle-foreground">Permutation · LightGBM</p>
      </div>
      <BarHChart data={data} height={height} labelWidth={186} />
      <p className="type-caption mt-2 border-t border-border pt-2 text-subtle-foreground">
        Mean increase in validation error when a feature is shuffled.
      </p>
    </div>
  );
}

/* Real: mean absolute error against the 21 external literature cases in
   v7_external_test_predictions.csv, grouped by cheese category. The hard-cheese
   error is genuinely large -- that is the point of the section this appears in. */
const CATEGORY_ERROR = [
  { category: "Soft", mae: 12.4, n: 9, tone: "success" as const },
  { category: "Semi-hard", mae: 22.3, n: 7, tone: "warning" as const },
  { category: "Hard", mae: 111.9, n: 5, tone: "destructive" as const },
];

const CATEGORY_ERROR_TONE_COLOR: Record<string, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--primary)",
};

export function CategoryErrorPreview({ height = 150 }: { height?: number }) {
  const data = CATEGORY_ERROR.map((row) => ({
    label: `${row.category} (n=${row.n})`,
    value: row.mae,
    tone: row.tone,
  }));
  return (
    <div className="p-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <p className="type-label font-medium text-foreground">Error by cheese category</p>
        <p className="type-caption text-subtle-foreground">MAE, days</p>
      </div>
      <BarHChart data={data} height={height} colorOf={(_, i) => CATEGORY_ERROR_TONE_COLOR[data[i].tone]} />
      <p className="type-caption mt-2 flex items-start gap-1.5 border-t border-border pt-2 text-muted-foreground">
        <ArrowUpRight className="mt-px size-3 shrink-0" />
        21 published cases. Hard cheeses fail badly — reported, not smoothed over.
      </p>
    </div>
  );
}

/* Real dataset shape, counted directly from the three V7 specialist CSVs. */
const DATASET_STATS = [
  { value: "34,000", label: "Rows" },
  { value: "8,500", label: "Contexts" },
  { value: "36", label: "Cheeses" },
  { value: "18", label: "Ingredients" },
];

/**
 * The hero's product preview — an application window rather than a browser
 * mock (no fake URL bar / traffic lights): a compact rail, a header, and two
 * real panels of current model output.
 */
export function HeroProductPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-[0_24px_60px_-24px_rgba(13,14,16,0.22)]">
      <div className="flex">
        {/* Rail — mirrors the real workspace nav, non-interactive here. */}
        <div className="hidden w-[132px] shrink-0 border-r border-border bg-muted/40 p-2.5 sm:block">
          <div className="flex items-center gap-1.5 px-1.5 pb-2.5">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="type-caption font-medium text-foreground">Shelf-Life Studio</span>
          </div>
          {["Overview", "Prediction", "Classification", "Ingredients", "Modeling"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "type-caption rounded-md px-1.5 py-[5px]",
                i === 0 ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground",
              )}
            >
              {item}
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex h-9 items-center justify-between border-b border-border px-3.5">
            <span className="type-label font-medium text-foreground">Overview</span>
            <span className="type-caption text-subtle-foreground">V7 specialists</span>
          </div>

          <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
            {DATASET_STATS.map((s) => (
              <div key={s.label} className="px-3 py-2.5">
                <p className="numeral text-[0.9375rem] leading-none font-medium text-foreground">
                  {s.value}
                </p>
                <p className="type-caption mt-1 text-subtle-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Two panels side by side only where there is genuinely room --
              below xl they stack, otherwise the numeric columns collide. */}
          <div className="grid divide-y divide-border xl:grid-cols-2 xl:divide-x xl:divide-y-0">
            <LeaderboardPreview compact />
            <SpecialistPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
