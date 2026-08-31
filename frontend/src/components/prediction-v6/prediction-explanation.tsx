"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, FlaskConical, Route, Sparkles, TrendingUp } from "lucide-react";

import type { ExplainDetailedResponse, InputRangeInfo, SensitivityCurve, WaterfallStep } from "@/lib/api";
import { WaterfallChart, type WaterfallBar } from "@/components/charts/waterfall-chart";
import { SensitivityChart } from "@/components/charts/sensitivity-chart";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Contributions this small are visual noise, not signal -- filtered again
 * here as a last line of defense even though the backend already folds
 * them into the residual bucket before they'd reach this component. */
const NOISE_FLOOR_DAYS = 0.05;

const METHOD_LABEL: Record<ExplainDetailedResponse["waterfall"]["method"], string> = {
  shap_tree: "Exact SHAP decomposition",
  ebm_additive: "Exact additive decomposition",
};

export function PredictionExplanationSection({
  data,
  categoryLabel,
  taskLabel,
}: {
  data: ExplainDetailedResponse;
  categoryLabel: string;
  taskLabel: string;
}) {
  const { waterfall, input_ranges, sensitivity } = data;
  const visibleSteps = waterfall.steps.filter((s) => Math.abs(s.contribution) >= NOISE_FLOOR_DAYS);
  const visibleResidual = waterfall.residual && Math.abs(waterfall.residual.contribution) >= NOISE_FLOOR_DAYS ? waterfall.residual : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.22 }}
      className="mt-6 space-y-3"
    >
      <RoutingHeader data={data} categoryLabel={categoryLabel} taskLabel={taskLabel} />

      <div className="rounded-[20px] border border-[#e8dce0] bg-[linear-gradient(145deg,#fff,#fffafb)] p-5 shadow-[0_20px_48px_-40px_rgba(80,27,43,.45)]">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#f7e6eb] text-[#9e2446]"><Sparkles className="size-3.5" /></span>
          <div>
            <h2 className="text-[0.88rem] font-semibold tracking-[-0.02em] text-[#382a30]">What influenced this prediction?</h2>
            <p className="mt-0.5 text-[0.5rem] text-[#9a858d]">
              {waterfall.reconciles ? METHOD_LABEL[waterfall.method] : "Non-additive ranking"} from {data.model_label}, the exact algorithm that produced this prediction.
            </p>
          </div>
        </div>

        {waterfall.reconciles ? (
          <WaterfallView baseline={waterfall.baseline} steps={visibleSteps} residual={visibleResidual} prediction={waterfall.prediction} />
        ) : (
          <RankingFallback steps={visibleSteps} />
        )}
      </div>

      {(visibleSteps.length > 0 || input_ranges.length > 0) && (
        <div className="grid gap-3 lg:grid-cols-2">
          <FactorsWithValues steps={visibleSteps} />
          <TrainingSpaceCard ranges={input_ranges} />
        </div>
      )}

      {sensitivity.length > 0 && <SensitivitySection curves={sensitivity} />}
    </motion.section>
  );
}

function RoutingHeader({
  data,
  categoryLabel,
  taskLabel,
}: {
  data: ExplainDetailedResponse;
  categoryLabel: string;
  taskLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#e8dce0] bg-white/92 shadow-[0_16px_40px_-38px_rgba(80,27,43,.4)]">
      <div className="grid divide-y divide-[#efe5e8] sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        <HeaderField icon={<Route className="size-3.5" />} label="Cheese category" value={categoryLabel} />
        <HeaderField icon={<FlaskConical className="size-3.5" />} label="Model task" value={taskLabel} />
        <HeaderField icon={<Sparkles className="size-3.5" />} label="Routed specialist" value={`${categoryLabel} specialist`} />
        <HeaderField icon={<TrendingUp className="size-3.5" />} label="Algorithm used" value={data.model_label} />
        <div className="px-4 py-3 text-left">
          <p className="text-[0.48rem] text-[#9c8990]">Final prediction</p>
          <p className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-[#7f1735]">{data.waterfall.prediction.toFixed(1)} <span className="text-[0.6rem] font-normal text-[#9c8990]">days</span></p>
        </div>
      </div>
    </div>
  );
}

function HeaderField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-4 py-3 text-left">
      <div className="flex items-center gap-1.5 text-[#9c8990]">
        {icon}
        <p className="text-[0.48rem] uppercase tracking-[0.05em]">{label}</p>
      </div>
      <p className="mt-1 text-[0.58rem] font-semibold leading-4 text-[#43343a]">{value}</p>
    </div>
  );
}

function WaterfallView({
  baseline,
  steps,
  residual,
  prediction,
}: {
  baseline: number;
  steps: WaterfallStep[];
  residual: WaterfallStep | null;
  prediction: number;
}) {
  const bars: WaterfallBar[] = [{ name: "Baseline", base: 0, size: baseline, kind: "total" }];
  let running = baseline;
  for (const step of steps) {
    const start = running;
    running += step.contribution;
    bars.push({
      name: step.label,
      base: Math.min(start, running),
      size: Math.abs(step.contribution),
      kind: step.contribution >= 0 ? "positive" : "negative",
      contribution: step.contribution,
      displayValue: step.value,
    });
  }
  if (residual) {
    const start = running;
    running += residual.contribution;
    bars.push({
      name: residual.label,
      base: Math.min(start, running),
      size: Math.abs(residual.contribution),
      kind: residual.contribution >= 0 ? "positive" : "negative",
      contribution: residual.contribution,
      displayValue: null,
    });
  }
  bars.push({ name: "Final prediction", base: 0, size: prediction, kind: "total" });

  return (
    <div className="mt-4">
      <WaterfallChart bars={bars} height={300} />
      <div className="mt-2 flex justify-center gap-4 text-[0.48rem] text-[#8e7a82]">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#7a1b2e]" />Baseline / final</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#1f8a5a]" />Extends shelf life</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#c73b3b]" />Shortens shelf life</span>
      </div>
    </div>
  );
}

function RankingFallback({ steps }: { steps: WaterfallStep[] }) {
  const maxAbs = Math.max(1e-9, ...steps.map((s) => Math.abs(s.contribution)));
  return (
    <div className="mt-4">
      <div className="mb-3 flex items-start gap-2 rounded-[12px] border border-[#eddcb8] bg-[#fffaf0] px-3.5 py-2.5">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-[#9c6a15]" />
        <p className="text-[0.5rem] leading-4 text-[#77561e]">
          This algorithm doesn&apos;t support an exact additive decomposition for this row, so factors are shown ranked by influence only -- they are not guaranteed to sum to the final prediction.
        </p>
      </div>
      <div className="space-y-2">
        {steps.map((step) => {
          const positive = step.contribution >= 0;
          const width = Math.max(4, (Math.abs(step.contribution) / maxAbs) * 100);
          return (
            <div key={step.feature} className="grid grid-cols-[140px_1fr_56px] items-center gap-3">
              <span className="truncate text-[0.55rem] text-[#6f5e65]" title={step.label}>{step.label}{step.value ? ` · ${step.value}` : ""}</span>
              <div className="h-2 overflow-hidden rounded-full bg-[#f0ecee]">
                <div className={`h-full rounded-full ${positive ? "bg-[#1f8a5a]" : "bg-[#c73b3b]"}`} style={{ width: `${width}%` }} />
              </div>
              <span className={`text-right text-[0.5rem] font-semibold tabular-nums ${positive ? "text-[#17845a]" : "text-[#c73b3b]"}`}>{positive ? "+" : ""}{step.contribution.toFixed(1)}d</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FactorsWithValues({ steps }: { steps: WaterfallStep[] }) {
  return (
    <div className="rounded-[18px] border border-[#e8dce0] bg-white/92 p-4 shadow-[0_16px_40px_-38px_rgba(80,27,43,.4)]">
      <h3 className="text-[0.68rem] font-semibold text-[#2a2024]">Top factors, with your inputs</h3>
      <p className="mt-0.5 text-[0.48rem] text-[#8f7c84]">The exact formulation value behind each factor above.</p>
      <div className="mt-3 space-y-2.5">
        {steps.map((step) => (
          <div key={step.feature} className="flex items-center justify-between gap-3 border-b border-[#f2ebed] pb-2 last:border-0 last:pb-0">
            <div className="min-w-0">
              <p className="truncate text-[0.55rem] font-medium text-[#3f3338]">{step.label}</p>
              {step.value && <p className="truncate text-[0.48rem] text-[#8f7c84]">{step.value}</p>}
            </div>
            <span className={`shrink-0 font-mono text-[0.52rem] font-semibold ${step.contribution >= 0 ? "text-[#17845a]" : "text-[#c73b3b]"}`}>
              {step.contribution >= 0 ? "+" : ""}{step.contribution.toFixed(1)}d
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainingSpaceCard({ ranges }: { ranges: InputRangeInfo[] }) {
  if (ranges.length === 0) return null;
  return (
    <div className="rounded-[18px] border border-[#e8dce0] bg-white/92 p-4 shadow-[0_16px_40px_-38px_rgba(80,27,43,.4)]">
      <h3 className="text-[0.68rem] font-semibold text-[#2a2024]">Input within training space</h3>
      <p className="mt-0.5 text-[0.48rem] text-[#8f7c84]">Where your value sits between this specialist&apos;s training minimum and maximum.</p>
      <div className="mt-3.5 space-y-4">
        {ranges.map((range) => (
          <RangeRow key={range.feature} range={range} />
        ))}
      </div>
    </div>
  );
}

function RangeRow({ range }: { range: InputRangeInfo }) {
  const medianPct = range.max > range.min ? ((range.median - range.min) / (range.max - range.min)) * 100 : 50;
  const clampedPct = Math.max(0, Math.min(100, range.position_pct));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[0.53rem] font-medium text-[#3f3338]">{range.label}</span>
        <span className="shrink-0 text-[0.5rem] font-semibold text-[#7f1735]">{range.value_display ?? range.value}</span>
      </div>
      <div className="relative mt-2 h-1.5 rounded-full bg-[#f0ecee]">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[#e7d3d9]" style={{ width: `${medianPct}%` }} />
        <div className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 bg-[#b39aa2]" style={{ left: `${medianPct}%` }} title="Median" />
        <div
          className={`absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.08)] ${range.out_of_range ? "bg-[#c73b3b]" : "bg-[#7a1b2e]"}`}
          style={{ left: `${clampedPct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[0.42rem] text-[#a18e95]">
        <span>{formatRangeNumber(range.min)}</span>
        <span>{formatRangeNumber(range.max)}</span>
      </div>
      {range.out_of_range && <p className="mt-1 text-[0.44rem] text-[#c73b3b]">Outside this specialist&apos;s training range.</p>}
    </div>
  );
}

function SensitivitySection({ curves }: { curves: SensitivityCurve[] }) {
  return (
    <div className="rounded-[18px] border border-[#e8dce0] bg-white/92 p-4 shadow-[0_16px_40px_-38px_rgba(80,27,43,.4)]">
      <h3 className="text-[0.68rem] font-semibold text-[#2a2024]">What if this input changed?</h3>
      <p className="mt-0.5 text-[0.48rem] text-[#8f7c84]">
        Each curve holds every other input fixed and recomputes a real prediction from {curves.length > 0 ? "the same specialist" : "this specialist"} across its own training range. The dot marks your current formulation.
      </p>
      <div className={`mt-3 grid gap-3 ${curves.length >= 3 ? "lg:grid-cols-3" : curves.length === 2 ? "sm:grid-cols-2" : ""}`}>
        {curves.map((curve) => (
          <div key={curve.feature} className="rounded-[14px] border border-[#eee3e6] bg-[linear-gradient(145deg,#fff,#fffaf4)] p-3">
            <p className="text-[0.55rem] font-semibold text-[#3f3338]">{curve.label}</p>
            <SensitivityChart points={curve.points} actualX={curve.actual_x} actualY={curve.actual_y} unit={curve.unit} height={190} />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRangeNumber(value: number): string {
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);
}
