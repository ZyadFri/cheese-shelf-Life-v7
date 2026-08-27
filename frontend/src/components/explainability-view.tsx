"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Database,
  FlaskConical,
  GitCompare,
  Info,
  Lightbulb,
  ListTree,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { api, type ModelSummary, type ModelDetails } from "@/lib/api";
import { usePredictionStore } from "@/components/prediction-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BarHChart } from "@/components/charts/bar-h-chart";
import { LineCurveChart } from "@/components/charts/line-curve-chart";

const SEGMENT_PRIORITY = ["cheese_category", "food_matrix", "indicator_type", "is_control"] as const;

const SEGMENT_TONES = [
  { bar: "#a52348", soft: "#fff1f5", icon: "#9e2144" },
  { bar: "#cc8a1b", soft: "#fff8e9", icon: "#b16f05" },
  { bar: "#4c95c8", soft: "#f1f8fd", icon: "#347ba9" },
  { bar: "#58a776", soft: "#f2fbf5", icon: "#3c8a5a" },
] as const;

export function ExplainabilityView({
  models,
  featureCount,
}: {
  models: ModelSummary[];
  featureCount: number;
}) {
  const [active, setActive] = React.useState(models[0]?.id ?? "");
  const [cache, setCache] = React.useState<Record<string, ModelDetails>>({});
  const [loading, setLoading] = React.useState(false);
  const [ebmShapes, setEbmShapes] = React.useState<
    { term: string; type: string; names: string[]; scores: number[] }[] | null
  >(null);

  React.useEffect(() => {
    if (!active || cache[active]) return;
    setLoading(true);
    api.modelDetails(active)
      .then((details) => setCache((prev) => ({ ...prev, [active]: details })))
      .finally(() => setLoading(false));
  }, [active, cache]);

  React.useEffect(() => {
    if (active === "ebm" && !ebmShapes) {
      api.ebmShapes().then((response) => setEbmShapes(response.shapes));
    }
  }, [active, ebmShapes]);

  const details = cache[active];
  const segmentCount = details ? Object.keys(details.category_errors).length : null;
  const testObservations = details?.scatter.test.length ?? null;

  return (
    <div className="relative">
      <ExplainabilityBackdrop />

      <section className="relative -mx-4 overflow-hidden border-b border-[#efe5e8] bg-[linear-gradient(118deg,#fff_0%,#fff9fb_43%,#fff2f6_100%)] px-4 pb-6 pt-7 sm:-mx-5 sm:px-7 lg:-mx-7 lg:px-9">
        <ScientificMotif />
        <div className="relative z-10">
          <div className="mb-3 h-[3px] w-10 rounded-full bg-[#9b2143]" />
          <h1
            className="text-[clamp(2.75rem,5vw,4.6rem)] leading-[.92] font-medium tracking-[-0.055em] text-[#181315]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Explainability
          </h1>
          <p className="mt-3 max-w-[760px] text-[0.72rem] leading-5 text-[#74666c] sm:text-[0.78rem]">
            Understand how each model makes its predictions, globally and for individual formulations.
          </p>

          <div className="mt-5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Global drivers tracked"
              value={featureCount.toLocaleString()}
              sub="Features exposed by the current schema"
              icon={<Database className="size-4" />}
            />
            <SummaryCard
              label="Model families explained"
              value={models.length.toLocaleString()}
              sub="Available model artifacts"
              icon={<ListTree className="size-4" />}
            />
            <SummaryCard
              label="Test observations"
              value={testObservations === null ? "—" : testObservations.toLocaleString()}
              sub={details ? "Stored for the selected model" : "Loading selected model"}
              icon={<GitCompare className="size-4" />}
            />
            <SummaryCard
              label="Segment diagnostics"
              value={segmentCount === null ? "—" : segmentCount.toLocaleString()}
              sub={details ? "Backend error-breakdown dimensions" : "Loading selected model"}
              icon={<ShieldCheck className="size-4" />}
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 mt-3 overflow-hidden rounded-[20px] border border-[#eadfe3] bg-white/94 shadow-[0_20px_52px_-42px_rgba(78,28,44,.42)]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee5e8] px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-[0.86rem] font-semibold tracking-[-0.015em] text-[#241b1f]">Global feature importance</h2>
            <p className="mt-0.5 text-[0.58rem] text-[#928087]">Compare how features influence predictions across supported model families.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eddde2] bg-[#fff8fa] px-2.5 py-1 text-[0.48rem] font-medium text-[#92717c]">
            <Info className="size-3 text-[#a83b59]" />
            Permutation importance uses cross-model consistency
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <Tabs value={active} onValueChange={setActive}>
            <TabsList className="mb-3 h-auto w-full justify-start gap-5 overflow-x-auto rounded-none border-b border-[#eee5e8] bg-transparent p-0">
              {models.map((model) => (
                <TabsTrigger
                  key={model.id}
                  value={model.id}
                  className="rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2.5 pt-0 text-[0.55rem] font-medium text-[#796a70] shadow-none data-[state=active]:border-[#a51f45] data-[state=active]:bg-transparent data-[state=active]:text-[#9b183d]"
                >
                  {model.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {models.map((model) => (
              <TabsContent key={model.id} value={model.id} className="mt-0">
                {active === model.id && (
                  loading && !details ? (
                    <div className="grid gap-3 lg:grid-cols-2">
                      <Skeleton className="h-[300px] rounded-[18px]" />
                      <Skeleton className="h-[300px] rounded-[18px]" />
                    </div>
                  ) : details ? (
                    <ImportancePanel details={details} />
                  ) : null
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1.55fr_.7fr_.72fr]">
        <LocalExplanationCard />
        <FormulationContextCard />
        <HowToReadCard />
      </section>

      {details && Object.keys(details.category_errors).length > 0 && (
        <SegmentInsights details={details} />
      )}

      {active === "ebm" && (
        <section className="mt-3 overflow-hidden rounded-[20px] border border-[#eadfe3] bg-white/94 shadow-[0_18px_48px_-40px_rgba(76,27,44,.40)]">
          <div className="border-b border-[#eee5e8] px-4 py-3.5 sm:px-5">
            <h2 className="text-[0.82rem] font-semibold text-[#241b1f]">EBM shape functions</h2>
            <p className="mt-0.5 text-[0.56rem] text-[#928087]">Stored additive shape functions for the selected Explainable Boosting Machine.</p>
          </div>
          <div className="p-4">
            {!ebmShapes ? (
              <Skeleton className="h-64 w-full rounded-[16px]" />
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {ebmShapes.map((shape) => (
                  <article key={shape.term} className="rounded-[16px] border border-[#eee3e6] bg-[linear-gradient(145deg,#fff,#fffaf4)] p-3">
                    <p className="mb-1 text-[0.56rem] font-semibold capitalize text-[#6f5962]">{humanize(shape.term)}</p>
                    <LineCurveChart
                      height={220}
                      series={[{ name: humanize(shape.term), color: "#b5730b", points: shape.scores }]}
                    />
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function ImportancePanel({ details }: { details: ModelDetails }) {
  const permutation = Object.entries(details.feature_importance.permutation ?? {})
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 10)
    .map(([label, value]) => ({ label: humanize(label), value: Number(value.toFixed(4)) }));

  const native = details.feature_importance.native
    ? Object.entries(details.feature_importance.native)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 10)
        .map(([label, value]) => ({ label: humanize(label), value: Number(value.toFixed(4)) }))
    : null;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ImportanceCard
        title="Permutation importance"
        subtitle="Relative influence across the selected model"
        tone="burgundy"
      >
        <BarHChart data={permutation} color="#a32348" height={268} labelWidth={132} />
      </ImportanceCard>

      <ImportanceCard
        title="Native importance"
        subtitle="Model-native importance where supported"
        tone="amber"
      >
        {native ? (
          <BarHChart data={native} color="#b87405" height={268} labelWidth={132} />
        ) : (
          <div className="flex h-[268px] items-center justify-center px-6 text-center text-[0.57rem] text-[#8e7a82]">
            Native importance is not available for this model family.
          </div>
        )}
      </ImportanceCard>
    </div>
  );
}

function ImportanceCard({
  title,
  subtitle,
  tone,
  children,
}: {
  title: string;
  subtitle: string;
  tone: "burgundy" | "amber";
  children: React.ReactNode;
}) {
  const classes =
    tone === "burgundy"
      ? "border-[#efd9e0] bg-[radial-gradient(circle_at_88%_18%,rgba(197,68,105,.14),transparent_32%),linear-gradient(145deg,#fff,#fff1f5)]"
      : "border-[#efe2ca] bg-[radial-gradient(circle_at_88%_18%,rgba(222,160,47,.16),transparent_34%),linear-gradient(145deg,#fff,#fff8e9)]";

  return (
    <article className={`relative overflow-hidden rounded-[18px] border p-3 shadow-[0_14px_38px_-30px_rgba(77,27,43,.36)] ${classes}`}>
      <MiniMolecule tone={tone} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[0.68rem] font-semibold text-[#2a2024]">{title}</h3>
          <p className="mt-0.5 text-[0.48rem] text-[#8f7c84]">{subtitle}</p>
        </div>
        <Info className={`size-3.5 ${tone === "burgundy" ? "text-[#a42b4d]" : "text-[#b8780d]"}`} />
      </div>
      <div className="relative z-10 mt-1">{children}</div>
    </article>
  );
}

function LocalExplanationCard() {
  const { lastPrediction } = usePredictionStore();
  const [factors, setFactors] = React.useState<{ feature: string; contribution: number }[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!lastPrediction) {
      setFactors(null);
      return;
    }
    const top = lastPrediction.candidates[0];
    if (!top) return;
    setLoading(true);
    api.explainLocal({ model: top.model, row: top.row, top_k: 8 })
      .then((response) => setFactors(response.factors))
      .finally(() => setLoading(false));
  }, [lastPrediction]);

  const top = lastPrediction?.candidates[0];

  return (
    <article className="relative min-h-[252px] overflow-hidden rounded-[20px] border border-[#eadfe3] bg-[linear-gradient(145deg,#fff,#fffafb)] p-4 shadow-[0_18px_48px_-40px_rgba(76,27,44,.42)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[0.82rem] font-semibold text-[#241b1f]">Local explanation for a formulation</h2>
          <p className="mt-0.5 text-[0.55rem] text-[#928087]">Feature contributions returned for your most recent prediction.</p>
        </div>
        <FlaskConical className="size-4 text-[#a42a4d]" />
      </div>

      {!top ? (
        <div className="mt-5 flex min-h-[170px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#e8d9de] bg-[#fff8fa]/72 px-5 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#f7e8ed] text-[#9e2144]">
            <FlaskConical className="size-4" />
          </div>
          <p className="mt-3 text-[0.66rem] font-semibold text-[#44353b]">No prediction yet</p>
          <p className="mt-1 max-w-[380px] text-[0.52rem] leading-4 text-[#927f87]">Run a prediction to populate this panel with formulation-specific contributions from the backend explanation endpoint.</p>
        </div>
      ) : loading || !factors ? (
        <Skeleton className="mt-4 h-[176px] rounded-[16px]" />
      ) : (
        <ContributionView
          factors={factors}
          prediction={top.predicted_candidate_shelf_life}
          candidateName={top.candidate_name}
        />
      )}
    </article>
  );
}

function ContributionView({
  factors,
  prediction,
  candidateName,
}: {
  factors: { feature: string; contribution: number }[];
  prediction: number;
  candidateName: string;
}) {
  const maxAbs = Math.max(1e-9, ...factors.map((factor) => Math.abs(factor.contribution)));

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-[120px_minmax(0,1fr)_92px] md:items-center">
      <div className="rounded-[14px] border border-[#f0e3e7] bg-white/82 p-3 text-center">
        <p className="text-[0.45rem] uppercase tracking-[0.06em] text-[#9a868e]">Prediction</p>
        <strong className="mt-1 block text-[1.35rem] font-semibold tracking-[-0.05em] text-[#7f1735]">{prediction.toFixed(1)}</strong>
        <p className="text-[0.48rem] text-[#9a868e]">days</p>
        <p className="mt-2 truncate text-[0.48rem] font-medium text-[#715d65]" title={candidateName}>{candidateName}</p>
      </div>

      <div className="space-y-1.5">
        <p className="mb-2 text-[0.48rem] font-medium text-[#78646d]">How features push this prediction</p>
        {factors.slice(0, 7).map((factor, index) => {
          const width = Math.max(3, (Math.abs(factor.contribution) / maxAbs) * 48);
          const positive = factor.contribution >= 0;
          return (
            <div key={`${factor.feature}-${index}`} className="grid grid-cols-[112px_minmax(0,1fr)_42px] items-center gap-2">
              <span className="truncate text-right text-[0.45rem] text-[#75636a]" title={humanize(factor.feature)}>{humanize(factor.feature)}</span>
              <div className="relative h-4 rounded-sm bg-white/55">
                <div className="absolute inset-y-0 left-1/2 w-px bg-[#d8c7cd]" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.38, delay: index * 0.035 }}
                  className={`absolute top-[3px] h-[10px] rounded-[3px] ${positive ? "left-1/2 bg-[linear-gradient(90deg,#c74b6c,#a31f46)]" : "right-1/2 bg-[linear-gradient(90deg,#6ba5d3,#4a82b8)]"}`}
                />
              </div>
              <span className={`font-mono text-[0.45rem] ${positive ? "text-[#a52248]" : "text-[#477fb3]"}`}>{positive ? "+" : ""}{factor.contribution.toFixed(1)}</span>
            </div>
          );
        })}
      </div>

      <div className="hidden text-right md:block">
        <p className="text-[0.45rem] uppercase tracking-[0.06em] text-[#9a868e]">Final prediction</p>
        <strong className="mt-1 block text-[1.18rem] font-semibold tracking-[-0.04em] text-[#37292f]">{prediction.toFixed(1)}</strong>
        <p className="text-[0.46rem] text-[#96838b]">days</p>
      </div>
    </div>
  );
}

function FormulationContextCard() {
  const { lastPrediction } = usePredictionStore();
  const top = lastPrediction?.candidates[0];
  const context = top ? buildContext(top.row) : [];

  return (
    <article className="min-h-[252px] rounded-[20px] border border-[#eadfe3] bg-[linear-gradient(145deg,#fff,#fffaf6)] p-4 shadow-[0_18px_48px_-40px_rgba(76,27,44,.38)]">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-[#fff0df] text-[#b5740b]"><FlaskConical className="size-3.5" /></div>
        <h2 className="text-[0.76rem] font-semibold text-[#281f22]">Formulation context</h2>
      </div>

      {context.length === 0 ? (
        <div className="flex min-h-[180px] items-center justify-center px-4 text-center text-[0.52rem] leading-4 text-[#96838b]">Context appears here after a prediction is run.</div>
      ) : (
        <dl className="mt-3 space-y-0.5">
          {context.map((item) => (
            <div key={item.label} className="grid grid-cols-[1fr_1.05fr] gap-2 border-b border-[#f0e8e2] py-1.5 last:border-0">
              <dt className="text-[0.47rem] text-[#8f7d84]">{item.label}</dt>
              <dd className="truncate text-[0.47rem] font-medium text-[#4d3d43]" title={item.value}>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

function HowToReadCard() {
  const items = [
    {
      title: "Global explanations",
      text: "Reveal which features influence predictions across the dataset and compare importance methods.",
      icon: <Lightbulb className="size-3.5" />,
    },
    {
      title: "Local explanations",
      text: "Show why the latest formulation received its prediction by exposing feature contributions.",
      icon: <FlaskConical className="size-3.5" />,
    },
    {
      title: "Use together",
      text: "Global views guide feature understanding; local views explain individual outcomes.",
      icon: <BookOpen className="size-3.5" />,
    },
  ];

  return (
    <article className="relative min-h-[252px] overflow-hidden rounded-[20px] border border-[#eadfe3] bg-[linear-gradient(145deg,#fff,#fffdfd)] p-4 shadow-[0_18px_48px_-40px_rgba(76,27,44,.38)]">
      <div className="absolute -bottom-12 -right-12 size-40 rounded-full border border-[#f1e6e9]" />
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-[#f9e9ef] text-[#9d2144]"><BookOpen className="size-3.5" /></div>
        <h2 className="text-[0.76rem] font-semibold text-[#281f22]">How to read this</h2>
      </div>
      <div className="relative mt-3 space-y-3">
        {items.map((item) => (
          <div key={item.title} className="flex gap-2.5">
            <div className="mt-0.5 text-[#9b6a7a]">{item.icon}</div>
            <div>
              <p className="text-[0.5rem] font-semibold text-[#4d3d43]">{item.title}</p>
              <p className="mt-0.5 text-[0.46rem] leading-4 text-[#8e7a82]">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function SegmentInsights({ details }: { details: ModelDetails }) {
  const entries = prioritizedSegments(details.category_errors).slice(0, 4);

  return (
    <section className="mt-3 overflow-hidden rounded-[20px] border border-[#eadfe3] bg-white/94 p-3.5 shadow-[0_18px_48px_-40px_rgba(76,27,44,.38)] sm:p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-[#f8e9ef] text-[#a12348]"><Sparkles className="size-3.5" /></div>
          <div>
            <h2 className="text-[0.76rem] font-semibold text-[#281f22]">Segment insights</h2>
            <p className="mt-0.5 text-[0.49rem] text-[#918087]">Highest stored test MAE within each available backend category breakdown.</p>
          </div>
        </div>
        <span className="rounded-full border border-[#eadde1] bg-[#fff9fb] px-2.5 py-1 text-[0.46rem] font-medium text-[#8c6170]">Backend-derived breakdown</span>
      </div>

      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {entries.map(([column, groups], index) => (
          <SegmentCard key={column} column={column} groups={groups} tone={SEGMENT_TONES[index % SEGMENT_TONES.length]} />
        ))}
      </div>
    </section>
  );
}

function SegmentCard({
  column,
  groups,
  tone,
}: {
  column: string;
  groups: Record<string, { mae: number; n: number }>;
  tone: (typeof SEGMENT_TONES)[number];
}) {
  const rows = Object.entries(groups).sort((a, b) => b[1].mae - a[1].mae).slice(0, 3);
  const max = Math.max(1e-9, ...rows.map(([, value]) => value.mae));

  return (
    <article className="rounded-[15px] border border-[#eee4e7] p-3" style={{ background: `linear-gradient(145deg,#fff,${tone.soft})` }}>
      <p className="text-[0.5rem] font-semibold text-[#5a474f]">By {humanize(column)} <span className="font-normal text-[#9a858d]">(highest MAE)</span></p>
      <div className="mt-2.5 space-y-2">
        {rows.map(([label, value], index) => (
          <div key={label} className="grid grid-cols-[12px_minmax(0,1fr)_62px] items-center gap-2">
            <span className="text-[0.43rem] text-[#a18e95]">{index + 1}</span>
            <div className="min-w-0">
              <p className="truncate text-[0.45rem] text-[#55434a]" title={humanize(label)}>{humanize(label)}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full" style={{ width: `${Math.max(5, (value.mae / max) * 100)}%`, background: tone.bar }} />
              </div>
            </div>
            <div className="text-right">
              <span className="block font-mono text-[0.45rem] font-semibold text-[#4f3d44]">{value.mae.toFixed(2)}</span>
              <span className="block text-[0.4rem] text-[#9e8a92]">n={value.n.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="group rounded-[17px] border border-[#ecdfe3] bg-white/82 p-3.5 shadow-[0_16px_38px_-32px_rgba(77,27,43,.42)] backdrop-blur-md transition-transform hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f8e8ed] text-[#a32248] transition-transform group-hover:scale-105">{icon}</div>
        <div className="min-w-0">
          <p className="truncate text-[0.49rem] font-semibold text-[#5c4a51]">{label}</p>
          <strong className="mt-0.5 block text-[1.25rem] font-semibold tracking-[-0.04em] text-[#21191c]">{value}</strong>
          <p className="truncate text-[0.43rem] text-[#98858c]">{sub}</p>
        </div>
      </div>
    </article>
  );
}

function buildContext(row: Record<string, unknown>) {
  const specs = [
    ["Cheese category", "cheese_category"],
    ["Food matrix", "food_matrix"],
    ["Storage temperature", "storage_temperature_c"],
    ["pH", "matrix_ph"],
    ["Moisture", "matrix_moisture_pct"],
    ["Packaging", "packaging_type"],
    ["Indicator type", "indicator_type"],
  ] as const;

  return specs.flatMap(([label, key]) => {
    const value = row[key];
    if (value === null || value === undefined || value === "") return [];
    const suffix = key === "storage_temperature_c" ? " °C" : key === "matrix_moisture_pct" ? "%" : "";
    return [{ label, value: `${formatValue(value)}${suffix}` }];
  });
}

function prioritizedSegments(categoryErrors: ModelDetails["category_errors"]) {
  const entries = Object.entries(categoryErrors);
  return entries.sort((a, b) => {
    const ai = SEGMENT_PRIORITY.indexOf(a[0] as (typeof SEGMENT_PRIORITY)[number]);
    const bi = SEGMENT_PRIORITY.indexOf(b[0] as (typeof SEGMENT_PRIORITY)[number]);
    const aRank = ai === -1 ? 999 : ai;
    const bRank = bi === -1 ? 999 : bi;
    return aRank - bRank;
  });
}

function formatValue(value: unknown) {
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2).replace(/\.00$/, "");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return humanize(String(value));
}

function humanize(value: string) {
  return value.replace(/^RULE_/, "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function ScientificMotif() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] opacity-75 lg:block">
      <svg viewBox="0 0 620 210" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#e9b9c7" strokeWidth="1.2" opacity="0.72">
          <path d="M92 76 L148 42 L199 79 L252 48 L309 84 L370 52 L426 90" />
          <path d="M148 42 L151 8 M199 79 L196 118 M252 48 L270 12 M309 84 L318 126 M370 52 L385 14" />
          <circle cx="92" cy="76" r="5" fill="#f7d9e2" />
          <circle cx="148" cy="42" r="6" fill="#f4ccd8" />
          <circle cx="199" cy="79" r="4.5" fill="#f7d9e2" />
          <circle cx="252" cy="48" r="6" fill="#f4ccd8" />
          <circle cx="309" cy="84" r="5" fill="#f7d9e2" />
          <circle cx="370" cy="52" r="6" fill="#f4ccd8" />
          <circle cx="426" cy="90" r="4.5" fill="#f7d9e2" />
        </g>
        <g fill="none" stroke="#f0cbd5" opacity="0.55">
          <path d="M330 146 C390 112 428 113 480 142 S570 179 626 138" />
          <path d="M330 157 C392 123 435 124 486 153 S572 188 626 150" />
          <path d="M334 168 C398 134 438 135 491 163 S575 197 629 160" />
        </g>
      </svg>
    </div>
  );
}

function MiniMolecule({ tone }: { tone: "burgundy" | "amber" }) {
  const color = tone === "burgundy" ? "#d889a0" : "#ddb46b";
  return (
    <svg aria-hidden viewBox="0 0 160 110" className="pointer-events-none absolute -bottom-2 right-0 h-28 w-40 opacity-[.18]">
      <g fill="none" stroke={color} strokeWidth="1.1">
        <path d="M18 70 L50 47 L82 65 L113 40 L145 58" />
        <path d="M50 47 L48 18 M82 65 L80 96 M113 40 L120 12" />
        <circle cx="18" cy="70" r="4" />
        <circle cx="50" cy="47" r="5" />
        <circle cx="82" cy="65" r="4" />
        <circle cx="113" cy="40" r="5" />
        <circle cx="145" cy="58" r="4" />
      </g>
    </svg>
  );
}

function ExplainabilityBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 top-40 size-72 rounded-full bg-[#fbeff3] blur-3xl" />
      <div className="absolute right-[-120px] top-[520px] size-[360px] rounded-full bg-[#fff4df] blur-3xl" />
      <div className="absolute bottom-12 left-[40%] size-64 rounded-full bg-[#f4f8ff] blur-3xl" />
    </div>
  );
}
