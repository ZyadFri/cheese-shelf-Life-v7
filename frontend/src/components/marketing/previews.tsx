"use client";

import { ArrowUpRight } from "lucide-react";

import { BarHChart } from "@/components/charts/bar-h-chart";
import { cn } from "@/lib/utils";

const LEADERBOARD = [
  { model: "LightGBM", r2: "0.972", rmse: "4.49" },
  { model: "XGBoost", r2: "0.969", rmse: "4.65" },
  { model: "Random Forest", r2: "0.955", rmse: "5.67" },
  { model: "EBM", r2: "0.944", rmse: "6.32" },
];

export function LeaderboardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "p-3.5" : "p-4"}>
      <p className="mb-2 text-[0.69rem] font-semibold tracking-[-0.01em] text-foreground">
        Model leaderboard
      </p>
      <div>
        {LEADERBOARD.map((row) => (
          <div
            key={row.model}
            className="grid grid-cols-[1fr_46px_42px] items-center border-b border-border/70 py-[5px] text-[0.61rem] last:border-0"
          >
            <span className="truncate text-foreground">{row.model}</span>
            <span className="numeral text-right font-medium text-foreground">{row.r2}</span>
            <span className="numeral text-right text-muted-foreground">{row.rmse}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SPECIALISTS = [
  { category: "Soft", task: "Shelf life", model: "LightGBM", r2: 0.972 },
  { category: "Semi-hard", task: "Shelf life", model: "LightGBM", r2: 0.931 },
  { category: "Hard", task: "Shelf life", model: "LightGBM", r2: 0.916 },
];

export function SpecialistPreview() {
  return (
    <div className="p-3.5">
      <p className="mb-2 text-[0.69rem] font-semibold tracking-[-0.01em] text-foreground">
        Specialist routing
      </p>
      <div className="space-y-[7px]">
        {SPECIALISTS.map((s) => (
          <div key={s.category} className="grid grid-cols-[54px_1fr] items-center gap-2">
            <span className="text-[0.59rem] text-foreground">{s.category}</span>
            <div className="h-[7px] overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${Math.round(s.r2 * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.52rem] text-subtle-foreground">
        Validation R² · shelf-life specialists
      </p>
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
        <p className="type-label font-medium text-foreground">Feature importance · LightGBM</p>
      </div>
      <BarHChart data={data} height={height} labelWidth={186} />
      <p className="type-caption mt-2 border-t border-border pt-2 text-subtle-foreground">
        Values are normalized. Importances reflect average impact across validation folds.
      </p>
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
  const data = CATEGORY_ERROR.map((row) => ({
    label: `${row.category} (n=${row.n})`,
    value: row.mae,
    tone: row.tone,
  }));
  return (
    <div className="p-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <p className="type-label font-medium text-foreground">Error by cheese category</p>
        <p className="type-caption text-subtle-foreground">MAE · days</p>
      </div>
      <BarHChart
        data={data}
        height={height}
        colorOf={(_, i) => CATEGORY_ERROR_TONE_COLOR[data[i].tone]}
      />
      <p className="type-caption mt-2 flex items-start gap-1.5 border-t border-border pt-2 text-muted-foreground">
        <ArrowUpRight className="mt-px size-3 shrink-0" />
        Failures are surfaced rather than smoothed over.
      </p>
    </div>
  );
}

function Sparkline({ tone = "burgundy" }: { tone?: "burgundy" | "green" }) {
  const stroke = tone === "green" ? "var(--success)" : "var(--primary)";
  return (
    <svg aria-hidden viewBox="0 0 120 32" className="mt-2 h-7 w-full overflow-visible">
      <path
        d="M3 24 C18 22, 24 11, 38 12 S57 22, 69 13 S86 8, 117 12"
        fill="none"
        stroke={stroke}
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const HERO_STATS = [
  { value: "34k", label: "Rows", tone: "burgundy" as const },
  { value: "8.5k", label: "Contexts", tone: "green" as const },
  { value: "6", label: "Specialists", note: "3 cheese classes × 2 tasks" },
];

export function HeroProductPreview() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-background shadow-[0_26px_60px_-28px_rgba(13,14,16,0.28)]">
      <div className="flex h-10 items-center justify-between border-b border-border px-4">
        <span className="text-[0.69rem] font-semibold tracking-[-0.01em] text-foreground">
          Shelf-Life Studio
        </span>
        <span className="text-[0.55rem] text-subtle-foreground">Overview · V7</span>
      </div>

      <div className="flex">
        <div className="hidden w-[118px] shrink-0 border-r border-border bg-[#fbfbfc] p-2.5 sm:block">
          {["Overview", "Prediction", "Classification", "Ingredients", "Modeling"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "rounded-md px-2 py-[6px] text-[0.58rem]",
                i === 0 ? "bg-primary/[0.075] font-semibold text-primary" : "text-muted-foreground",
              )}
            >
              {item}
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1 p-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="min-h-[96px] rounded-xl border border-border p-3">
                <p className="text-[0.52rem] text-subtle-foreground">{s.label}</p>
                <p className="numeral mt-1 text-[1.22rem] leading-none font-semibold tracking-[-0.035em] text-foreground">
                  {s.value}
                </p>
                {s.tone ? (
                  <Sparkline tone={s.tone} />
                ) : (
                  <p className="mt-4 text-[0.48rem] leading-3.5 text-subtle-foreground">{s.note}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-xl border border-border">
              <LeaderboardPreview compact />
            </div>
            <div className="rounded-xl border border-border">
              <SpecialistPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
