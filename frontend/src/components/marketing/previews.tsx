"use client";

import { ArrowUpRight, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BarHChart } from "@/components/charts/bar-h-chart";

/**
 * Static reconstructions of real screens, used only inside the landing page.
 *
 * The numbers below are the actual figures from the current training run
 * (artifacts/metrics.json) so the marketing page never shows invented results.
 * They are intentionally hardcoded rather than fetched: the landing page is
 * public and must render without an API session.
 */

const LEADERBOARD = [
  { model: "XGBoost", r2: "0.953", rmse: "17.61", best: true },
  { model: "LightGBM", r2: "0.953", rmse: "17.64", best: false },
  { model: "Random Forest", r2: "0.939", rmse: "20.12", best: false },
  { model: "Explainable Boosting Machine", r2: "0.937", rmse: "20.32", best: false },
];

export function LeaderboardPreview() {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="type-title text-foreground">Model leaderboard</p>
        <p className="type-caption text-subtle-foreground">Ranked by validation RMSE</p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-1.5 text-left type-caption font-medium tracking-[0.04em] text-subtle-foreground uppercase">
              Model
            </th>
            <th className="pb-1.5 text-right type-caption font-medium tracking-[0.04em] text-subtle-foreground uppercase">
              Val R²
            </th>
            <th className="pb-1.5 text-right type-caption font-medium tracking-[0.04em] text-subtle-foreground uppercase">
              RMSE
            </th>
          </tr>
        </thead>
        <tbody>
          {LEADERBOARD.map((row) => (
            <tr key={row.model} className="border-b border-border last:border-0">
              <td className="py-2 text-[0.8125rem] text-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="truncate">{row.model}</span>
                  {row.best && <Badge variant="accent">Best</Badge>}
                </span>
              </td>
              <td className="py-2 text-right text-[0.8125rem] numeral text-foreground">{row.r2}</td>
              <td className="py-2 text-right text-[0.8125rem] numeral text-muted-foreground">
                {row.rmse} d
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CANDIDATES = [
  { name: "Nisin coating", days: 34.2, delta: 11.8, pct: 52.7, rank: 1 },
  { name: "Oregano essential oil", days: 29.6, delta: 7.2, pct: 32.1, rank: 2 },
  { name: "Natamycin dip", days: 26.1, delta: 3.7, pct: 16.5, rank: 3 },
];

export function ComparisonPreview() {
  const data = [
    { label: "Control", value: 22.4 },
    ...CANDIDATES.map((c) => ({ label: c.name, value: c.days })),
  ];
  return (
    <div className="p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="type-title text-foreground">Treatment vs. control</p>
        <p className="type-caption text-subtle-foreground">Predicted shelf life, days</p>
      </div>
      <BarHChart data={data} height={168} />
      <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2.5">
        <Check className="size-3 text-success" />
        <span className="type-caption text-muted-foreground">
          90% conformal interval reported per prediction
        </span>
      </div>
    </div>
  );
}

const FACTORS = [
  { feature: "food_matrix", value: -23.9 },
  { feature: "storage_temperature_c", value: 1.14 },
  { feature: "indicator_type", value: 0.97 },
  { feature: "indicator_group", value: 0.7 },
  { feature: "primary_ingredient_family", value: 0.48 },
];

export function ExplainPreview() {
  const data = FACTORS.map((f) => ({ label: f.feature, value: f.value }));
  return (
    <div className="p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="type-title text-foreground">Prediction factors</p>
        <p className="type-caption text-subtle-foreground">Local attribution, days</p>
      </div>
      <BarHChart data={data} height={172} colorOf={(v) => (v < 0 ? "var(--destructive)" : "var(--success)")} />
    </div>
  );
}

const CATEGORY_ERROR = [
  { category: "soft", mae: 5.0, n: 77, tone: "success" as const },
  { category: "semi_hard", mae: 78.3, n: 21, tone: "warning" as const },
  { category: "hard", mae: 207.1, n: 2, tone: "destructive" as const },
];

const CATEGORY_ERROR_TONE_COLOR: Record<string, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
};

export function CategoryErrorPreview() {
  const data = CATEGORY_ERROR.map((row) => ({ label: `${row.category} (n=${row.n})`, value: row.mae, tone: row.tone }));
  return (
    <div className="p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="type-title text-foreground">Error by cheese category</p>
        <p className="type-caption text-subtle-foreground">MAE, days · external literature set</p>
      </div>
      <BarHChart
        data={data}
        height={130}
        colorOf={(_, i) => CATEGORY_ERROR_TONE_COLOR[data[i].tone]}
      />
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {CATEGORY_ERROR.map((row) => (
          <Badge key={row.category} variant={row.tone} className="text-[0.6875rem]">
            {row.category}: {row.mae.toFixed(1)} d
          </Badge>
        ))}
      </div>
      <p className="type-caption mt-3 flex items-start gap-1.5 border-t border-border pt-2.5 text-muted-foreground">
        <ArrowUpRight className="mt-px size-3 shrink-0" />
        Per-category breakdowns surface where a model should not be trusted.
      </p>
    </div>
  );
}
