"use client";

import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BarHChart } from "@/components/charts/bar-h-chart";
import { cn } from "@/lib/utils";

const LEADERBOARD = [
  { model: "LightGBM", r2: "0.972", rmse: "4.49", best: true },
  { model: "XGBoost", r2: "0.969", rmse: "4.65", best: false },
  { model: "Random Forest", r2: "0.955", rmse: "5.67", best: false },
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
            <th className="type-caption pb-1.5 text-left font-medium tracking-[0.04em] text-subtle-foreground uppercase">Model</th>
            <th className="type-caption w-[58px] pb-1.5 text-right font-medium tracking-[0.04em] text-subtle-foreground uppercase">R²</th>
            <th className="type-caption w-[58px] pb-1.5 text-right font-medium tracking-[0.04em] text-subtle-foreground uppercase">RMSE</th>
          </tr>
        </thead>
        <tbody>
          {LEADERBOARD.map((row) => (
            <tr key={row.model} className="group/row border-b border-border transition-colors duration-150 hover:bg-primary/[0.035] last:border-0">
              <td className="py-[7px] text-[0.8125rem] text-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="truncate transition-transform duration-200 group-hover/row:translate-x-0.5">{row.model}</span>
                  {row.best && <Badge variant="accent">Best</Badge>}
                </span>
              </td>
              <td className="numeral py-[7px] text-right text-[0.8125rem] text-foreground">{row.r2}</td>
              <td className="numeral py-[7px] text-right text-[0.8125rem] text-muted-foreground">{row.rmse}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
        {SPECIALISTS.map((s) => {
          const pct = Math.max(0, Math.min(100, s.r2 * 100));
          return (
            <div key={`${s.category}-${s.task}`} className="group/spec border-b border-border py-[7px] transition-colors hover:bg-primary/[0.03] last:border-0">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-foreground">{s.category}</span>
                <span className="type-caption w-[52px] shrink-0 text-muted-foreground">{s.task}</span>
                <span className={cn("numeral w-[42px] shrink-0 text-right text-[0.8125rem]", s.r2 >= 0.9 ? "text-foreground" : "text-muted-foreground")}>{s.r2.toFixed(3)}</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn(
                    "block h-full origin-left rounded-full transition-transform duration-500 group-hover/spec:scale-x-[1.02]",
                    s.task === "Shelf life" ? "bg-primary" : "bg-foreground/25",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
      <p className="type-caption mt-2 border-t border-border pt-2 text-subtle-foreground">Mean increase in validation error when a feature is shuffled.</p>
    </div>
  );
}

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
  const data = CATEGORY_ERROR.map((row) => ({ label: `${row.category} (n=${row.n})`, value: row.mae, tone: row.tone }));
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

const DATASET_STATS = [
  { value: "34,000", label: "Rows" },
  { value: "8,500", label: "Contexts" },
  { value: "36", label: "Cheeses" },
  { value: "18", label: "Ingredients" },
];

export function HeroProductPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-[0_28px_80px_-34px_rgba(13,14,16,0.45)]">
      <div aria-hidden className="absolute inset-x-0 top-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="flex">
        <div className="hidden w-[136px] shrink-0 border-r border-border bg-[#fafafb] p-2.5 sm:block">
          <div className="flex items-center gap-1.5 px-1.5 pb-3">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_0_3px_rgba(122,27,46,0.10)]" />
            <span className="type-caption font-semibold text-foreground">Shelf-Life Studio</span>
          </div>
          {["Overview", "Prediction", "Classification", "Ingredients", "Modeling"].map((item, i) => (
            <div key={item} className={cn("type-caption group/nav rounded-md px-1.5 py-[5px] transition-[background-color,color,transform] duration-150 hover:translate-x-0.5", i === 0 ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>{item}</div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex h-10 items-center justify-between border-b border-border px-3.5">
            <span className="type-label font-semibold text-foreground">Overview</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.045] px-2 py-1 text-[0.625rem] font-semibold tracking-[0.04em] text-primary uppercase">
              <span className="size-1 rounded-full bg-primary" />V7 · 6 specialists
            </span>
          </div>

          <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
            {DATASET_STATS.map((s) => (
              <div key={s.label} className="group/stat px-3 py-2.5 transition-colors duration-200 hover:bg-primary/[0.035]">
                <p className="numeral text-[0.9375rem] leading-none font-semibold text-foreground transition-transform duration-200 group-hover/stat:-translate-y-0.5">{s.value}</p>
                <p className="type-caption mt-1 text-subtle-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid divide-y divide-border xl:grid-cols-2 xl:divide-x xl:divide-y-0">
            <LeaderboardPreview compact />
            <SpecialistPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
