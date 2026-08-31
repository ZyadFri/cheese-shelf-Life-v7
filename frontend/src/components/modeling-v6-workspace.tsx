"use client";

import * as React from "react";
import {
  BookOpen,
  CalendarClock,
  Clock3,
  Database,
  ShieldCheck,
  FlaskConical,
  Trophy,
} from "lucide-react";

import { api, type CheeseCategory, type ModelTask, type ModelSummary, type SpecialistModelsResponse } from "@/lib/api";
import { Reveal } from "@/components/page-shell";
import { ModelExplorer } from "@/components/model-explorer";
import { ModelingCompareVisual } from "@/components/modeling-compare-visual";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { value: CheeseCategory; label: string }[] = [
  { value: "soft", label: "Soft" },
  { value: "semi_hard", label: "Semi-hard" },
  { value: "hard", label: "Hard" },
];

const TASKS: { value: ModelTask; label: string }[] = [
  { value: "general_shelf_life", label: "General shelf life" },
  { value: "safety_endpoint", label: "Safety endpoint" },
];

const CATEGORY_LABEL: Record<CheeseCategory, string> = { soft: "Soft", semi_hard: "Semi-hard", hard: "Hard" };
const TASK_LABEL: Record<ModelTask, string> = { general_shelf_life: "General shelf life", safety_endpoint: "Safety endpoint" };

export function ModelingV6Workspace() {
  const [category, setCategory] = React.useState<CheeseCategory>("hard");
  const [task, setTask] = React.useState<ModelTask>("general_shelf_life");
  const [data, setData] = React.useState<SpecialistModelsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api.v6Models(category, task)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((err) => {
        if (active) {
          setData(null);
          setError(err instanceof Error ? err.message : "This specialist has no saved artifacts yet.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, task]);

  const fetchDetails = React.useCallback(
    (modelId: string) => api.v6ModelDetails(category, task, modelId),
    [category, task],
  );

  return (
    <>
      <Reveal>
        <section className="relative z-10 -mt-1 overflow-hidden rounded-[20px] border border-[#eadfe3] bg-white/94 p-4 shadow-[0_18px_48px_-40px_rgba(76,27,44,.42)] sm:p-5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#9b838c]">Specialist</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-4">
            <SegmentedControl options={CATEGORIES} value={category} onChange={setCategory} />
            <div className="h-5 w-px bg-[#eee5e8]" />
            <SegmentedControl options={TASKS} value={task} onChange={setTask} />
          </div>
        </section>
      </Reveal>

      {error ? (
        <Reveal>
          <section className="mt-4 flex min-h-[200px] items-center justify-center rounded-[20px] border border-[#eadfe3] bg-white/94 p-8 text-center shadow-[0_18px_48px_-40px_rgba(76,27,44,.42)]">
            <p className="max-w-sm text-[0.68rem] text-[#8e7d84]">
              No saved artifacts for {CATEGORY_LABEL[category]} · {TASK_LABEL[task]} yet. Train it via <code className="font-mono">python train_specialists.py</code>.
            </p>
          </section>
        </Reveal>
      ) : loading || !data ? (
        <WorkspaceSkeleton />
      ) : (
        <Workspace key={`${category}-${task}`} data={data} category={category} task={task} fetchDetails={fetchDetails} />
      )}
    </>
  );
}

function Workspace({
  data,
  category,
  task,
  fetchDetails,
}: {
  data: SpecialistModelsResponse;
  category: CheeseCategory;
  task: ModelTask;
  fetchDetails: (modelId: string) => ReturnType<typeof api.v6ModelDetails>;
}) {
  const models = [...data.models].sort((a, b) => a.validation_rmse - b.validation_rmse);
  const bestModel = models.find((model) => model.is_best) ?? models[0];
  const manifest = data.manifest;

  const trainPct = percentage(manifest.n_train, manifest.n_total);
  const validationPct = percentage(manifest.n_validation, manifest.n_total);
  const testPct = percentage(manifest.n_test, manifest.n_total);

  return (
    <>
      <Reveal>
        <section className="relative z-10 mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Best algorithm"
            value={bestModel?.label ?? "—"}
            sub="Lowest validation RMSE"
            icon={<Trophy className="size-4" />}
            tone="burgundy"
          />
          <MetricCard
            label="Train rows"
            value={manifest.n_train.toLocaleString()}
            sub={`${trainPct}% of this specialist's data`}
            icon={<Database className="size-4" />}
            tone="blue"
          />
          <MetricCard
            label="Validation rows"
            value={manifest.n_validation.toLocaleString()}
            sub={`${validationPct}% of this specialist's data`}
            icon={<ShieldCheck className="size-4" />}
            tone="blue"
          />
          <MetricCard
            label="Test rows"
            value={manifest.n_test.toLocaleString()}
            sub={`${testPct}% of this specialist's data, held out`}
            icon={<FlaskConical className="size-4" />}
            tone="amber"
          />
        </section>
      </Reveal>

      <section className="mt-4 grid gap-3 xl:grid-cols-[1.18fr_.92fr]">
        <Reveal>
          <article className="overflow-hidden rounded-[20px] border border-[#eadfe3] bg-white/94 shadow-[0_18px_48px_-40px_rgba(76,27,44,.42)]">
            <div className="px-4 pb-2 pt-3.5 sm:px-5">
              <h2 className="text-[0.86rem] font-semibold tracking-[-0.015em] text-[#241b1f]">Model comparison</h2>
              <p className="mt-0.5 text-[0.56rem] text-[#95838a]">
                {CATEGORY_LABEL[category]} · {TASK_LABEL[task]} — ranked by validation RMSE (lower is better).
              </p>
            </div>
            <div className="overflow-x-auto px-2 pb-2 sm:px-3">
              <table className="w-full min-w-[660px] border-collapse text-[0.56rem]">
                <thead>
                  <tr className="border-b border-[#eee5e8] text-left uppercase tracking-[0.055em] text-[#a08f96]">
                    <th className="px-2 py-2 font-medium">Model</th>
                    <th className="px-2 py-2 text-right font-medium">Val R²</th>
                    <th className="px-2 py-2 text-right font-medium">Test R²</th>
                    <th className="px-2 py-2 text-right font-medium">Val RMSE</th>
                    <th className="px-2 py-2 text-right font-medium">Test RMSE</th>
                    <th className="px-2 py-2 text-right font-medium">Val MAE</th>
                    <th className="px-2 py-2 text-right font-medium">Test MAE</th>
                    <th className="px-2 py-2 text-right font-medium">Train time</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr
                      key={model.id}
                      className={`border-b border-[#f2ebed] last:border-0 ${model.is_best ? "bg-[linear-gradient(90deg,#fff0f4,#fff8fa)]" : "transition-colors hover:bg-[#fffafb]"}`}
                    >
                      <td className={`px-2 py-2.5 font-medium ${model.is_best ? "text-[#921d3f]" : "text-[#34282d]"}`}>
                        <div className="flex items-center gap-1.5">
                          {model.is_best && <Trophy className="size-3 text-[#b67908]" />}
                          <span>{model.label}</span>
                          {model.is_best && (
                            <span className="rounded-full border border-[#ead9df] bg-white px-1.5 py-0.5 text-[0.45rem] font-semibold text-[#8b5a69]">best</span>
                          )}
                        </div>
                      </td>
                      <NumberCell value={model.validation_r2} digits={3} emphasis={model.is_best} />
                      <NumberCell value={model.test_r2} digits={3} />
                      <NumberCell value={model.validation_rmse} digits={2} />
                      <NumberCell value={model.test_rmse} digits={2} />
                      <NumberCell value={model.validation_mae} digits={2} />
                      <NumberCell value={model.test_mae} digits={2} />
                      <td className="px-2 py-2.5 text-right tabular-nums text-[#8b7a81]">{model.training_duration_sec.toFixed(1)}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.03}>
          <article className="relative overflow-hidden rounded-[20px] border border-[#74142f] bg-[linear-gradient(145deg,#74142f,#4d0b20)] p-4 text-white shadow-[0_22px_54px_-34px_rgba(82,10,31,.62)] sm:p-5">
            <div className="pointer-events-none absolute -bottom-20 -right-12 h-48 w-80 rounded-[50%] border border-white/10" />
            <div className="pointer-events-none absolute -bottom-12 right-12 h-36 w-64 rounded-[50%] border border-white/10" />
            <div className="pointer-events-none absolute bottom-4 right-2 h-20 w-52 rounded-[50%] border border-white/[.08]" />
            <div className="relative z-10">
              <h2 className="text-[0.82rem] font-semibold">Validation vs. test RMSE by model</h2>
              <p className="mt-0.5 text-[0.54rem] text-white/65">Lower is better. A small val↔test gap indicates generalization.</p>
              <ModelingCompareVisual models={models} />
              <div className="mt-1 flex justify-center gap-4 text-[0.48rem] text-white/72">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#efbdca]" />Validation RMSE</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-white" />Test RMSE</span>
              </div>
            </div>
          </article>
        </Reveal>
      </section>

      <Reveal delay={0.04}>
        <div className="mt-3">
          <ModelExplorer models={models} fetchDetails={fetchDetails} />
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <section className="mt-3 overflow-hidden rounded-[20px] border border-[#eadfe3] bg-white/94 shadow-[0_18px_48px_-40px_rgba(76,27,44,.42)]">
          <div className="flex items-center gap-2 border-b border-[#eee5e8] px-4 py-3 sm:px-5">
            <BookOpen className="size-3.5 text-[#9b2042]" />
            <div>
              <h2 className="text-[0.76rem] font-semibold text-[#271d21]">Training run details</h2>
              <p className="mt-0.5 text-[0.5rem] text-[#96838b]">Retraining happens only via <code className="font-mono">python train_specialists.py</code>, never from this dashboard.</p>
            </div>
          </div>
          <div className="grid divide-y divide-[#eee5e8] md:grid-cols-3 md:divide-x md:divide-y-0 xl:grid-cols-6">
            <RunDetail icon={<FlaskConical className="size-3.5" />} label="Specialist" value={`${CATEGORY_LABEL[category]} · ${TASK_LABEL[task]}`} />
            <RunDetail icon={<Trophy className="size-3.5" />} label="Best algorithm" value={bestModel?.label ?? "—"} />
            <RunDetail icon={<ShieldCheck className="size-3.5" />} label="Train / val / test rows" value={`${manifest.n_train.toLocaleString()} / ${manifest.n_validation.toLocaleString()} / ${manifest.n_test.toLocaleString()}`} />
            <RunDetail icon={<Database className="size-3.5" />} label="Random seed" value={String(manifest.random_seed)} />
            <RunDetail icon={<Clock3 className="size-3.5" />} label="Total training duration" value={`${manifest.total_training_duration_sec.toFixed(1)} s`} />
            <RunDetail icon={<CalendarClock className="size-3.5" />} label="Trained at (UTC)" value={manifest.created_at_utc.split(".")[0]} />
          </div>
        </section>
      </Reveal>
    </>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-[11px] border border-[#eadfe3] bg-[#fbf6f7] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-[8px] px-3 py-1.5 text-[0.62rem] font-semibold transition-colors ${
            option.value === value
              ? "bg-white text-[#8e1839] shadow-[0_4px_14px_-6px_rgba(76,27,44,.4)]"
              : "text-[#8f7c84] hover:text-[#5f4a52]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[94px] w-full rounded-[17px]" />)}
      </div>
      <div className="grid gap-3 xl:grid-cols-[1.18fr_.92fr]">
        <Skeleton className="h-[280px] w-full rounded-[20px]" />
        <Skeleton className="h-[280px] w-full rounded-[20px]" />
      </div>
      <Skeleton className="h-[320px] w-full rounded-[20px]" />
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  tone: "burgundy" | "blue" | "amber";
}) {
  const toneClasses = {
    burgundy: {
      card: "border-[#ead4dc] bg-[radial-gradient(circle_at_92%_20%,rgba(192,69,103,.10),transparent_36%),linear-gradient(145deg,#fff,#fff7f9)]",
      icon: "bg-[#f7e8ed] text-[#9b2042]",
      value: "text-[#8e1839]",
    },
    blue: {
      card: "border-[#dfe8f2] bg-[radial-gradient(circle_at_92%_20%,rgba(86,137,191,.10),transparent_36%),linear-gradient(145deg,#fff,#f7fbff)]",
      icon: "bg-[#edf4fb] text-[#376fa8]",
      value: "text-[#1e1b1d]",
    },
    amber: {
      card: "border-[#eee2ce] bg-[radial-gradient(circle_at_92%_20%,rgba(216,154,50,.12),transparent_36%),linear-gradient(145deg,#fff,#fffaf1)]",
      icon: "bg-[#fbf1df] text-[#af7106]",
      value: "text-[#1e1b1d]",
    },
  }[tone];

  return (
    <article className={`relative min-h-[94px] overflow-hidden rounded-[17px] border p-4 shadow-[0_16px_38px_-32px_rgba(77,27,43,.42)] ${toneClasses.card}`}>
      <div className="pointer-events-none absolute -bottom-8 -right-5 h-20 w-40 rounded-[50%] border border-current opacity-[.045]" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.52rem] font-semibold uppercase tracking-[0.09em] text-[#8f7c84]">{label}</p>
          <strong className={`mt-1.5 block text-[1.34rem] font-semibold tracking-[-0.04em] ${toneClasses.value}`}>{value}</strong>
          <p className="mt-1 text-[0.51rem] text-[#8e7d84]">{sub}</p>
        </div>
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${toneClasses.icon}`}>{icon}</div>
      </div>
    </article>
  );
}

function NumberCell({ value, digits, emphasis = false }: { value: number; digits: number; emphasis?: boolean }) {
  return <td className={`px-2 py-2.5 text-right tabular-nums ${emphasis ? "font-semibold text-[#9b2042]" : "text-[#44363c]"}`}>{value.toFixed(digits)}</td>;
}

function RunDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 px-4 py-3">
      <div className="flex items-center gap-1.5 text-[#a18e95]">
        {icon}
        <span className="text-[0.46rem] uppercase tracking-[0.055em]">{label}</span>
      </div>
      <p className="mt-1 truncate font-mono text-[0.5rem] text-[#3f3338]" title={value}>{value}</p>
    </div>
  );
}

function percentage(part: number, total: number) {
  if (!total) return "0";
  const value = (part / total) * 100;
  return value >= 10 ? value.toFixed(0) : value.toFixed(1);
}
