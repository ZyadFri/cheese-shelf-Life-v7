"use client";

import * as React from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { RotateCcw, ShieldAlert, Sparkles } from "lucide-react";

import { usePredictionV6 } from "@/components/prediction-v6-store";
import { titleCase } from "@/components/prediction-v6/cheese-search-step";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, type PredictionSupportLevel } from "@/lib/api";

const EASE = [0.16, 1, 0.3, 1] as const;

const SUPPORT_BADGE_VARIANT: Record<string, "success" | "info" | "warning" | "destructive"> = {
  strong: "success",
  moderate: "info",
  limited: "warning",
  experimental: "destructive",
  unsupported: "destructive",
};

const SUPPORT_LEVEL_META: Record<PredictionSupportLevel, { label: string; tone: "warning" | "destructive"; headline: string }> = {
  supported: { label: "Supported", tone: "warning", headline: "" },
  weak_physical_form: { label: "Weak physical-form support", tone: "warning", headline: "This cheese/physical-form combination is not directly observed in training data." },
  extrapolation: { label: "Numerical extrapolation", tone: "warning", headline: "One or more inputs fall outside the range this specialist was trained on." },
  unsupported_categorical: { label: "Unsupported input", tone: "destructive", headline: "One or more selected values were never seen during training." },
  thin_sample: { label: "Limited training sample", tone: "warning", headline: "This specialist was trained on a small number of examples." },
};

function prettify(value: string | null): string {
  if (!value) return "—";
  return value.replace(/_/g, " ");
}

function useCountUp(target: number, decimals = 0) {
  const [value, setValue] = React.useState(0);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, { duration: 0.8, ease: EASE, onUpdate: setValue });
    return () => controls.stop();
  }, [target, reduce]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
}

export function PredictionV6Result() {
  const { state, dispatch } = usePredictionV6();
  const [factors, setFactors] = React.useState<{ feature: string; contribution: number }[] | null>(null);
  const { result, entry, baseCheeseName, physicalForm } = state;

  React.useEffect(() => {
    if (!result || !entry) return;
    const row = result.candidates[0]?.row;
    if (!row) return;
    api.explainLocalV6({ cheese_category: entry.cheeseCategory, model_task: state.modelTask, row, top_k: 6 })
      .then((response) => setFactors(response.factors))
      .catch(() => setFactors(null));
  }, [result, entry, state.modelTask]);

  const treated = state.treatment.ingredientName !== "none";
  const candidate = result?.candidates[0];
  const displayed = candidate ? (treated ? candidate.predicted_candidate_shelf_life : candidate.predicted_control_shelf_life) : 0;
  const days = useCountUp(displayed, 1);

  if (!result || !entry || !baseCheeseName || !candidate) return null;

  const isSafety = state.modelTask === "safety_endpoint";
  const support = result.support;
  const isSupported = support.level === "supported";
  const meta = SUPPORT_LEVEL_META[support.level];

  const supportReasons: string[] = [];
  if (support.model) {
    for (const item of support.model.unseen_categoricals) {
      supportReasons.push(`'${item.feature}' = '${item.value}' was never seen during training.`);
    }
    for (const item of support.model.extrapolations) supportReasons.push(item.detail);
  }
  if (support.physical_form && support.physical_form.level !== "strong") supportReasons.push(support.physical_form.explanation);
  if (support.routing.level === "thin_sample" && support.routing.reason) supportReasons.push(support.routing.reason);

  const maxContribution = factors?.length ? Math.max(...factors.map((factor) => Math.abs(factor.contribution)), 0.0001) : 1;

  return (
    <div className="mx-auto max-w-[900px] pb-24 pt-7 sm:pt-9">
      {!isSupported && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={`mb-5 rounded-[16px] border px-5 py-4 ${meta.tone === "destructive" ? "border-[#edc7cf] bg-[#fff3f5]" : "border-[#eddcb8] bg-[#fffaf0]"}`}
        >
          <div className="flex items-start gap-2.5">
            <ShieldAlert className={`mt-0.5 size-4 shrink-0 ${meta.tone === "destructive" ? "text-[#a82745]" : "text-[#9c6a15]"}`} />
            <div>
              <p className={`text-[0.66rem] font-semibold ${meta.tone === "destructive" ? "text-[#8f203d]" : "text-[#77561e]"}`}>{meta.label}</p>
              <p className="mt-1 text-[0.54rem] leading-4 text-[#847179]">{meta.headline}</p>
              {supportReasons.length > 0 && (
                <ul className="mt-2 space-y-1 text-[0.5rem] leading-4 text-[#8e7b82]">
                  {supportReasons.map((reason, index) => <li key={index}>• {reason}</li>)}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: EASE }}
        className="text-center"
      >
        {isSafety && (
          <div className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-full border border-[#ead7b7] bg-[#fff9ee] px-3 py-1">
            <ShieldAlert className="size-3 text-[#a36d12]" />
            <span className="text-[0.48rem] font-semibold text-[#8b651f]">Safety-focused estimate, not a challenge-growth model</span>
          </div>
        )}

        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#a17e89]">Predicted shelf life</p>
        <div className={`mt-1 flex items-end justify-center gap-3 ${isSupported ? "text-[#68152d]" : "text-[#8b7a81]"}`}>
          <span className="text-[clamp(5rem,10vw,8.2rem)] font-medium leading-[.8] tracking-[-0.075em]" style={{ fontFamily: "var(--font-display)" }}>{days}</span>
          <span className="mb-1 text-[1.9rem] font-medium text-[#806b73]" style={{ fontFamily: "var(--font-display)" }}>days</span>
        </div>
        {!isSupported && <p className="mx-auto mt-3 max-w-[58ch] text-[0.52rem] leading-4 text-[#938088]">This output is shown for reference only. Review the support notice above before relying on it.</p>}
      </motion.section>

      {treated && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.08 }}
          className="mt-7 grid gap-3 sm:grid-cols-3"
        >
          <ResultCard label="Untreated baseline" value={`${candidate.predicted_control_shelf_life.toFixed(1)} d`} />
          <ResultCard label="Expected extension" value={`${candidate.absolute_improvement_days >= 0 ? "+" : ""}${candidate.absolute_improvement_days.toFixed(1)} d`} tone={candidate.absolute_improvement_days >= 0 ? "success" : "destructive"} />
          <ResultCard label="Relative improvement" value={candidate.relative_improvement_pct !== null ? `${candidate.relative_improvement_pct >= 0 ? "+" : ""}${candidate.relative_improvement_pct.toFixed(1)}%` : "n/a"} tone={candidate.relative_improvement_pct !== null && candidate.relative_improvement_pct >= 0 ? "success" : "destructive"} />
        </motion.div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.14 }}
        className="mt-7 overflow-hidden rounded-[20px] border border-[#e8dce0] bg-white/92 shadow-[0_20px_48px_-40px_rgba(80,27,43,.45)]"
      >
        <div className="grid divide-y divide-[#efe5e8] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <MetaField label="Cheese profile" value={`${titleCase(baseCheeseName)} · ${entry.cheeseCategory.replace("_", "-")} · ${prettify(physicalForm)}`} />
          <MetaField label="Prediction endpoint" value={prettify(state.indicatorType)} />
          <MetaField label="Specialist" value={`${entry.cheeseCategory.replace("_", "-")} model`} />
          <div className="px-5 py-4 text-left">
            <p className="text-[0.48rem] text-[#9c8990]">Physical-form support</p>
            <div className="mt-1.5">
              {support.physical_form ? <Badge variant={SUPPORT_BADGE_VARIANT[support.physical_form.level] ?? "outline"} size="sm">{support.physical_form.label}</Badge> : <span className="text-[0.55rem] text-[#7c6870]">—</span>}
            </div>
          </div>
        </div>
      </motion.section>

      {candidate.warnings.length > 0 && (
        <div className="mt-3 space-y-1 rounded-[14px] border border-[#eee3e6] bg-[#fffafb] px-4 py-3">
          {candidate.warnings.map((warning, index) => <p key={index} className="text-[0.5rem] leading-4 text-[#8d7981]">• {warning}</p>)}
        </div>
      )}

      {factors && factors.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.22 }}
          className="mt-6 rounded-[20px] border border-[#e8dce0] bg-[linear-gradient(145deg,#fff,#fffafb)] p-5 shadow-[0_20px_48px_-40px_rgba(80,27,43,.45)] sm:p-6"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#f7e6eb] text-[#9e2446]"><Sparkles className="size-3.5" /></span>
            <div>
              <h2 className="text-[0.88rem] font-semibold tracking-[-0.02em] text-[#382a30]">What influenced this prediction?</h2>
              <p className="mt-0.5 text-[0.5rem] text-[#9a858d]">Local feature contributions returned by the V6 explainability endpoint.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {factors.map((factor) => {
              const positive = factor.contribution >= 0;
              return (
                <div key={factor.feature} className="grid grid-cols-[145px_1fr_58px] items-center gap-3 sm:grid-cols-[190px_1fr_64px]">
                  <span className="truncate text-[0.55rem] text-[#827078]">{prettify(factor.feature)}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#f0ecee]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (Math.abs(factor.contribution) / maxContribution) * 100)}%` }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className={`h-full rounded-full ${positive ? "bg-[#188a5a]" : "bg-[#d24234]"}`}
                    />
                  </div>
                  <span className={`text-right text-[0.55rem] font-semibold tabular-nums ${positive ? "text-[#17845a]" : "text-[#d23d32]"}`}>
                    {positive ? "+" : ""}{factor.contribution.toFixed(1)}d
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-7 flex justify-center">
        <Button variant="outline" onClick={() => dispatch({ type: "reset" })} className="rounded-[11px] border-[#dfccd2] bg-white/80 text-[#703046] hover:bg-white">
          <RotateCcw className="size-3.5" /> Evaluate another cheese
        </Button>
      </motion.div>
    </div>
  );
}

function ResultCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  return (
    <div className="rounded-[18px] border border-[#e9dde1] bg-white/90 p-4 text-center shadow-[0_14px_34px_-30px_rgba(77,27,43,.48)]">
      <p className="text-[0.48rem] font-semibold uppercase tracking-[0.08em] text-[#9c8990]">{label}</p>
      <p className={`mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] ${tone === "success" ? "text-[#17845a]" : tone === "destructive" ? "text-[#c73c34]" : "text-[#4a3039]"}`}>{value}</p>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4 text-left">
      <p className="text-[0.48rem] text-[#9c8990]">{label}</p>
      <p className="mt-1.5 text-[0.58rem] font-semibold leading-4 text-[#43343a]">{value}</p>
    </div>
  );
}
