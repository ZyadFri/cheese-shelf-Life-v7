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
      <p className="mt-3 text-[0.52rem] text-[#9a7180]">
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

function ErrorSparkline() {
  return (
    <svg aria-hidden viewBox="0 0 120 34" className="mt-2 h-8 w-full overflow-visible">
      <path
        d="M2 16 C13 27 22 8 34 17 S53 26 65 12 S84 25 95 15 S108 13 118 7"
        fill="none"
        stroke="#c63154"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {[2, 34, 65, 95, 118].map((x, i) => (
        <circle key={x} cx={x} cy={[16, 17, 12, 15, 7][i]} r="2.2" fill="#c63154" />
      ))}
    </svg>
  );
}

function PredictionBars() {
  const heights = [22, 39, 31, 56, 44, 67, 49, 82, 61, 94];
  return (
    <div aria-hidden className="mt-2 flex h-12 items-end gap-[4px]">
      {heights.map((height, i) => (
        <span
          key={`${height}-${i}`}
          className="w-[6px] rounded-t-[2px] bg-[linear-gradient(180deg,#d26480,#8f1735)]"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

const HERO_STATS = [
  { value: "34k", label: "Rows", tone: "burgundy" as const },
  { value: "8.5k", label: "Contexts", tone: "green" as const },
  { value: "6", label: "Specialists", note: "3 cheese classes × 2 tasks" },
];

function PreviewPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="group/photo relative min-h-[102px] overflow-hidden rounded-xl border border-[#eadde1] bg-[#f4ecee]">
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover/photo:scale-[1.045]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2c151c]/18 via-transparent to-white/5" />
    </div>
  );
}

export function HeroProductPreview() {
  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-y-12 -right-14 left-[31%] -z-10 overflow-hidden rounded-[46%_0_0_42%] opacity-85 shadow-[0_36px_78px_-46px_rgba(66,42,34,.48)]"
      >
        <img src="/marketing/cheese-aging.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,249,251,.83),rgba(255,249,251,.1)_48%,rgba(255,249,251,.08))]" />
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[#e5dade] bg-white/94 shadow-[0_30px_70px_-34px_rgba(35,23,28,.34)] backdrop-blur-sm">
        <div className="flex h-10 items-center justify-between border-b border-[#ece3e6] px-4">
          <span className="text-[0.69rem] font-semibold tracking-[-0.01em] text-foreground">
            Shelf-Life Studio
          </span>
          <span className="rounded-full bg-[#f7e8ed] px-2 py-1 text-[0.52rem] font-medium text-[#8a5c68]">
            Overview · V7
          </span>
        </div>

        <div className="flex">
          <div className="hidden w-[118px] shrink-0 border-r border-[#ece3e6] bg-[linear-gradient(180deg,#fff8fa,#fdfbfc)] p-2.5 sm:block">
            {["Overview", "Prediction", "Classification", "Ingredients", "Modeling"].map((item, i) => (
              <div
                key={item}
                className={cn(
                  "rounded-lg px-2 py-[6px] text-[0.58rem] transition-colors",
                  i === 0
                    ? "bg-[#f4e5ea] font-semibold text-primary"
                    : "text-[#74676d] hover:bg-white/75 hover:text-foreground",
                )}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="min-w-0 flex-1 p-3.5">
            <div className="grid grid-cols-3 gap-2.5">
              {HERO_STATS.map((s) => (
                <div
                  key={s.label}
                  className="min-h-[96px] rounded-xl border border-[#eadfe2] bg-[linear-gradient(145deg,#fff,#fff8fa)] p-3 shadow-[0_10px_24px_-24px_rgba(89,42,56,.28)]"
                >
                  <p className="text-[0.52rem] font-medium text-[#9a7480]">{s.label}</p>
                  <p className="numeral mt-1 text-[1.22rem] leading-none font-semibold tracking-[-0.035em] text-foreground">
                    {s.value}
                  </p>
                  {s.tone ? (
                    <Sparkline tone={s.tone} />
                  ) : (
                    <p className="mt-4 text-[0.48rem] leading-3.5 text-[#a17e88]">{s.note}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[1.1fr_1fr]">
              <div className="rounded-xl border border-[#eadfe2] bg-white/88">
                <LeaderboardPreview compact />
              </div>
              <div className="rounded-xl border border-[#eadfe2] bg-[linear-gradient(145deg,#fff,#fff9fb)]">
                <SpecialistPreview />
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2.5 lg:grid-cols-[.92fr_1.05fr_.92fr_1.05fr]">
              <div className="min-h-[102px] rounded-xl border border-[#eadfe2] bg-[linear-gradient(145deg,#fff,#fff7fa)] p-3">
                <p className="text-[0.49rem] font-medium text-[#9b7480]">Average prediction error</p>
                <p className="numeral mt-1 text-[1.08rem] font-semibold tracking-[-0.035em] text-foreground">
                  2.31 <span className="text-[0.46rem] font-medium text-[#9b7480]">days</span>
                </p>
                <p className="mt-0.5 text-[0.45rem] font-medium text-success">↓ 12% vs last week</p>
                <ErrorSparkline />
              </div>

              <PreviewPhoto src="/marketing/cheese-cave.jpg" alt="Cheese aging shelves" />

              <div className="min-h-[102px] rounded-xl border border-[#eadfe2] bg-[linear-gradient(145deg,#fff,#fff7fa)] p-3">
                <p className="text-[0.49rem] font-medium text-[#9b7480]">Predictions this month</p>
                <p className="numeral mt-1 text-[1.08rem] font-semibold tracking-[-0.035em] text-foreground">1,842</p>
                <p className="mt-0.5 text-[0.45rem] font-medium text-success">↑ 18% vs last month</p>
                <PredictionBars />
              </div>

              <PreviewPhoto src="/marketing/lab.jpg" alt="Food science laboratory work" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
