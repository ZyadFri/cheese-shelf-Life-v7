import Link from "next/link";
import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  Database,
  FlaskConical,
  Layers,
  Lightbulb,
  LineChart,
  Route as RouteIcon,
  Sparkles,
  Trophy,
} from "lucide-react";
import { api, MODEL_LABELS } from "@/lib/api";
import { PageBody, Reveal } from "@/components/page-shell";
import { HistogramChart } from "@/components/charts/histogram-chart";
import { BarHChart } from "@/components/charts/bar-h-chart";

const PIPELINE = [
  {
    icon: Database,
    title: "Data curation",
    desc: "Load training data, remove identifiers and preserve provenance.",
  },
  {
    icon: ClipboardCheck,
    title: "Schema validation",
    desc: "Resolve numeric, categorical and binary feature types.",
  },
  {
    icon: RouteIcon,
    title: "Feature preparation",
    desc: "Encode, impute and scale inputs for each model family.",
  },
  {
    icon: Brain,
    title: "Model training",
    desc: "Fit independent models and select from saved validation artifacts.",
  },
  {
    icon: LineChart,
    title: "Prediction",
    desc: "Compare control and candidate formulations using trained models.",
  },
  {
    icon: Lightbulb,
    title: "Explainability",
    desc: "Inspect feature importance, local factors and EBM behavior.",
  },
];

const NEXT_ACTIONS = [
  {
    href: "/app/prediction",
    title: "Run a new prediction",
    desc: "Enter a formulation and compare shelf-life predictions.",
    icon: FlaskConical,
  },
  {
    href: "/app/explainability",
    title: "Explore explainability",
    desc: "Inspect what drives model output across features and cases.",
    icon: Lightbulb,
  },
  {
    href: "/app/modeling",
    title: "Compare trained models",
    desc: "Review validation and test performance from saved artifacts.",
    icon: LineChart,
  },
];

export default async function HomePage() {
  const [manifest, synthetic, modelResponse] = await Promise.all([
    api.manifest(),
    api.datasetSynthetic(),
    api.models(),
  ]);

  const models = modelResponse.models;
  const bestModel =
    models.find((model) => model.is_best) ??
    models.find((model) => model.id === manifest.best_model_by_validation_rmse) ??
    models[0];

  const familyData = Object.entries(synthetic.ingredient_families)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label: label.replace(/_/g, " "), value }));

  const topFamilies = familyData.slice(0, 8);
  const modelsByRmse = [...models].sort((a, b) => a.validation_rmse - b.validation_rmse);
  const maxRmse = Math.max(...modelsByRmse.map((model) => model.validation_rmse), 1);
  const histogramMax = Math.max(...synthetic.shelf_life_histogram, 1);
  const heroBars = synthetic.shelf_life_histogram.slice(0, 16);
  const topFamily = familyData[0];

  const metricItems = [
    {
      label: "Total rows",
      value: manifest.n_total.toLocaleString(),
      icon: <Database className="size-4" />,
      tone: "primary",
    },
    {
      label: "Contexts",
      value: manifest.n_contexts_total.toLocaleString(),
      icon: <RouteIcon className="size-4" />,
      tone: "primary",
    },
    {
      label: "Target range",
      value: `${synthetic.target_min.toFixed(1)}–${synthetic.target_max.toFixed(1)} d`,
      icon: <LineChart className="size-4" />,
      tone: "primary",
    },
    {
      label: "Models trained",
      value: String(manifest.models_trained.length),
      icon: <Layers className="size-4" />,
      tone: "primary",
    },
    {
      label: "Best model",
      value:
        bestModel?.label ??
        MODEL_LABELS[manifest.best_model_by_validation_rmse] ??
        manifest.best_model_by_validation_rmse,
      icon: <Trophy className="size-4" />,
      tone: "success",
    },
    {
      label: "Validation RMSE",
      value: bestModel ? `${bestModel.validation_rmse.toFixed(2)} d` : "—",
      icon: <Sparkles className="size-4" />,
      tone: "primary",
    },
  ] as const;

  return (
    <PageBody className="relative isolate pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-18vw] top-[-5rem] -z-20 h-[72rem] overflow-hidden"
      >
        <div className="absolute left-[8%] top-0 size-[30rem] rounded-full bg-[#f8e5eb]/70 blur-[90px]" />
        <div className="absolute right-[4%] top-[16rem] size-[28rem] rounded-full bg-[#f5ece4]/80 blur-[100px]" />
        <div className="absolute left-[38%] top-[36rem] size-[24rem] rounded-full bg-[#fbf0f3]/90 blur-[90px]" />
        <svg className="absolute left-[-4rem] top-[2rem] h-[38rem] w-[46rem] opacity-45" viewBox="0 0 760 620">
          <g fill="none" stroke="#b87587" strokeWidth="1">
            {Array.from({ length: 11 }).map((_, index) => (
              <path
                key={index}
                d={`M${20 + index * 7} ${450 - index * 13} C 160 ${320 - index * 5}, 225 ${
                  500 - index * 17
                }, 350 ${330 - index * 9} S 560 ${180 + index * 8}, 735 ${215 - index * 6}`}
                opacity={0.08 + index * 0.018}
              />
            ))}
          </g>
        </svg>
        <div className="absolute right-[-2rem] top-[34rem] h-[22rem] w-[28rem] opacity-30 [background-image:radial-gradient(circle_at_2px_2px,rgba(122,27,46,.22)_1px,transparent_1.5px)] [background-size:23px_23px]" />
      </div>

      <section className="relative mb-4 overflow-hidden rounded-[26px] border border-[#eadde1] bg-[linear-gradient(115deg,rgba(255,252,253,.98),rgba(255,246,249,.94)_48%,rgba(250,241,235,.96))] shadow-[0_30px_70px_-52px_rgba(77,33,46,.55)]">
        <div className="grid min-h-[350px] lg:grid-cols-[.86fr_1.14fr]">
          <div className="relative z-10 flex flex-col justify-center px-7 py-8 sm:px-9 lg:px-10">
            <span className="mb-5 inline-flex w-fit items-center rounded-full border border-[#ead7dd] bg-white/78 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur">
              Research workspace
            </span>
            <h1
              className="max-w-[10ch] text-[clamp(2.55rem,4.6vw,4.2rem)] leading-[.94] font-medium tracking-[-0.055em] text-[#1d1b1d]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Research snapshot
            </h1>
            <p className="mt-4 max-w-[39ch] text-[0.98rem] leading-7 text-[#6f6870]">
              Monitor the current dataset, trained models and prediction workflow from one
              evidence-driven workspace.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/app/prediction"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#9f1f41,#721428)] px-5 text-sm font-semibold text-white shadow-[0_14px_32px_-18px_rgba(122,27,46,.75)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-16px_rgba(122,27,46,.72)]"
              >
                Run a prediction
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/app/modeling"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#dfcbd1] bg-white/75 px-4 text-sm font-medium text-[#4c4247] shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#c996a4] hover:bg-white"
              >
                Explore results
                <ArrowRight className="size-3.5 text-primary" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.72rem] text-[#8e7b82]">
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-success" />
                Saved artifacts
              </span>
              <span>Built {formatBuildTime(manifest.created_at_utc)}</span>
            </div>
          </div>

          <div className="relative min-h-[330px] overflow-hidden lg:min-h-0">
            <img
              src="/marketing/cheese-cave.jpg"
              alt="Cheese aging shelves"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,249,251,.96)_0%,rgba(255,249,251,.63)_18%,rgba(75,32,43,.06)_54%,rgba(34,19,22,.38)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#34171f]/48 via-[#5e3440]/12 to-transparent" />

            <div className="absolute left-6 top-6 grid gap-2 sm:left-8 sm:top-8">
              <div className="w-[170px] rounded-2xl border border-white/55 bg-white/78 p-3.5 shadow-[0_16px_34px_-22px_rgba(45,22,28,.52)] backdrop-blur-xl">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[.08em] text-[#95727d]">
                  Predicted range
                </p>
                <p className="mt-1 text-lg font-semibold tracking-[-0.04em] text-[#251f22]">
                  {synthetic.target_min.toFixed(1)}–{synthetic.target_max.toFixed(1)} d
                </p>
                <p className="mt-0.5 text-[0.56rem] text-[#9b848c]">shelf_life_days</p>
              </div>

              <div className="w-[170px] rounded-2xl border border-white/55 bg-white/78 p-3.5 shadow-[0_16px_34px_-22px_rgba(45,22,28,.52)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.58rem] font-semibold uppercase tracking-[.08em] text-[#95727d]">
                      Best model
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-[-0.04em] text-[#251f22]">
                      {bestModel?.label ?? "—"}
                    </p>
                  </div>
                  <span className="grid size-8 place-items-center rounded-full bg-success/12 text-success">
                    <Trophy className="size-4" />
                  </span>
                </div>
                {bestModel && (
                  <p className="mt-2 text-[0.58rem] text-[#816e75]">
                    Validation RMSE {bestModel.validation_rmse.toFixed(2)} d
                  </p>
                )}
              </div>
            </div>

            <div className="absolute bottom-6 right-6 w-[min(330px,calc(100%-2.5rem))] rounded-2xl border border-white/40 bg-[#2e1a20]/54 p-4 text-white shadow-[0_20px_50px_-28px_rgba(20,8,12,.8)] backdrop-blur-xl sm:bottom-8 sm:right-8">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[0.63rem] font-semibold">Shelf-life distribution</p>
                  <p className="mt-0.5 text-[0.52rem] text-white/58">Rows by shelf-life bin</p>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[0.5rem] text-white/70">
                  {manifest.n_total.toLocaleString()} rows
                </span>
              </div>
              <div className="flex h-[86px] items-end gap-[3px]">
                {heroBars.map((count, index) => (
                  <span
                    key={index}
                    className="min-w-0 flex-1 rounded-t-[3px] bg-[linear-gradient(180deg,#f3b8c7,#b12c4e)] shadow-[0_0_14px_rgba(206,82,112,.18)]"
                    style={{
                      height: `${Math.max(5, (count / histogramMax) * 100)}%`,
                      opacity: 0.62 + (index / Math.max(heroBars.length - 1, 1)) * 0.32,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Reveal>
        <div className="mb-4 grid overflow-hidden rounded-[20px] border border-[#eadfe2] bg-white/84 shadow-[0_20px_48px_-38px_rgba(73,32,45,.5)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-6">
          {metricItems.map((metric, index) => (
            <div
              key={metric.label}
              className="group relative flex min-h-[92px] items-center gap-3 px-4 py-4 transition-colors hover:bg-[#fff8fa] lg:border-r lg:border-[#eee4e7] lg:last:border-r-0"
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 ${
                  metric.tone === "success"
                    ? "bg-success/12 text-success"
                    : "bg-[#fae9ee] text-primary"
                }`}
              >
                {metric.icon}
              </span>
              <div className="min-w-0">
                <strong className="block truncate text-[1.02rem] font-semibold tracking-[-0.035em] text-[#252125]">
                  {metric.value}
                </strong>
                <span className="mt-0.5 block text-[0.58rem] text-[#91828a]">{metric.label}</span>
              </div>
              {index < metricItems.length - 1 && (
                <span className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-px bg-gradient-to-b from-transparent via-[#eadfe2] to-transparent lg:block" />
              )}
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(285px,.7fr)]">
        <Reveal>
          <section className="h-full rounded-[22px] border border-[#eadfe2] bg-white/86 p-5 shadow-[0_20px_50px_-42px_rgba(74,34,46,.5)] backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[#252125]">
                    Modeling pipeline
                  </h2>
                  <span className="rounded-full bg-[#f7e8ed] px-2 py-1 text-[0.52rem] font-medium text-[#8b5364]">
                    Shared backend
                  </span>
                </div>
                <p className="mt-1 text-[0.72rem] text-[#887a81]">
                  One trained-artifact pipeline powers every modeling screen.
                </p>
              </div>
              <Link
                href="/app/how-it-works"
                className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-primary hover:underline"
              >
                How it works <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="relative grid gap-5 sm:grid-cols-2 xl:grid-cols-6 xl:gap-3">
              <div className="pointer-events-none absolute left-[6%] right-[6%] top-[21px] hidden h-px bg-[linear-gradient(90deg,transparent,#d9a8b6_8%,#d9a8b6_92%,transparent)] xl:block" />
              {PIPELINE.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="group relative z-10">
                    <div className="mb-3 flex items-center justify-between xl:block">
                      <span
                        className={`grid size-11 place-items-center rounded-full border shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md ${
                          index === 3
                            ? "border-[#8c1b37] bg-[linear-gradient(145deg,#a62649,#72152b)] text-white shadow-[0_10px_25px_-13px_rgba(122,27,46,.72)]"
                            : "border-[#eadde1] bg-[#fff9fb] text-primary"
                        }`}
                      >
                        <Icon className="size-[18px]" />
                      </span>
                      <span className="text-[0.55rem] font-mono text-[#a28c94] xl:absolute xl:right-0 xl:top-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-[0.68rem] font-semibold text-[#312b2e]">{step.title}</h3>
                    <p className="mt-1.5 text-[0.58rem] leading-4 text-[#8a7d83]">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.04}>
          <aside className="h-full rounded-[22px] border border-[#eadfe2] bg-[linear-gradient(155deg,rgba(255,255,255,.92),rgba(255,246,249,.88))] p-5 shadow-[0_20px_50px_-42px_rgba(74,34,46,.5)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-[#f7e8ed] text-primary">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h2 className="text-[0.98rem] font-semibold tracking-[-0.02em] text-[#292427]">
                  What can I do next?
                </h2>
                <p className="text-[0.58rem] text-[#97858d]">Jump directly into a workflow.</p>
              </div>
            </div>

            <div className="grid gap-2.5">
              {NEXT_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-[#eadfe2] bg-white/78 p-3 transition-all hover:-translate-y-0.5 hover:border-[#d6afb9] hover:bg-white hover:shadow-[0_12px_28px_-22px_rgba(75,33,46,.5)]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#fae9ee] text-primary transition-transform group-hover:scale-105">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-[0.67rem] font-semibold text-[#3a3035]">
                        {action.title}
                      </strong>
                      <span className="mt-0.5 block text-[0.56rem] leading-4 text-[#907f86]">
                        {action.desc}
                      </span>
                    </div>
                    <ArrowRight className="size-3.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </aside>
        </Reveal>
      </div>

      <Reveal delay={0.06}>
        <section>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#9a7f88]">
              Dataset intelligence
            </span>
            <span className="h-px flex-1 bg-[#e9dfe2]" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-[22px] border border-[#eadfe2] bg-white/88 p-5 shadow-[0_18px_46px_-40px_rgba(72,32,44,.52)] backdrop-blur-xl">
              <div className="mb-1">
                <h3 className="text-sm font-semibold text-[#2b2729]">Shelf-life distribution</h3>
                <p className="mt-1 text-[0.66rem] text-[#8e8187]">Across the full training dataset.</p>
              </div>
              <div className="-mx-2 mt-2">
                <HistogramChart
                  counts={synthetic.shelf_life_histogram}
                  edges={synthetic.shelf_life_bin_edges}
                />
              </div>
            </article>

            <article className="rounded-[22px] border border-[#eadfe2] bg-white/88 p-5 shadow-[0_18px_46px_-40px_rgba(72,32,44,.52)] backdrop-blur-xl">
              <div className="mb-1">
                <h3 className="text-sm font-semibold text-[#2b2729]">Rows by ingredient family</h3>
                <p className="mt-1 text-[0.66rem] text-[#8e8187]">Non-control treatment rows only.</p>
              </div>
              <div className="-mx-2 mt-2">
                <BarHChart data={topFamilies} height={230} labelWidth={108} />
              </div>
            </article>

            <article className="rounded-[22px] border border-[#eadfe2] bg-[linear-gradient(155deg,rgba(255,255,255,.94),rgba(255,247,249,.9))] p-5 shadow-[0_18px_46px_-40px_rgba(72,32,44,.52)] backdrop-blur-xl">
              <div>
                <h3 className="text-sm font-semibold text-[#2b2729]">Model performance</h3>
                <p className="mt-1 text-[0.66rem] text-[#8e8187]">Validation RMSE · lower is better.</p>
              </div>

              <div className="mt-5 grid gap-4">
                {modelsByRmse.map((model) => {
                  const isBest = model.id === bestModel?.id;
                  const width = Math.max(8, (model.validation_rmse / maxRmse) * 100);
                  return (
                    <div key={model.id}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-[0.62rem]">
                        <span className={isBest ? "font-semibold text-success" : "font-medium text-[#5f5359]"}>
                          {model.label}
                        </span>
                        <span className="font-mono tabular-nums text-[#8f7d85]">
                          {model.validation_rmse.toFixed(2)} d
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#f1ebed]">
                        <div
                          className={`h-full rounded-full ${
                            isBest
                              ? "bg-[linear-gradient(90deg,#3c9b70,#157f52)]"
                              : "bg-[linear-gradient(90deg,#c05772,#831a35)]"
                          }`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {bestModel && (
                <div className="mt-5 rounded-xl border border-success/15 bg-success/[0.055] p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-success/12 text-success">
                      <Trophy className="size-3.5" />
                    </span>
                    <div>
                      <p className="text-[0.58rem] font-semibold text-success">Best validation model</p>
                      <p className="mt-0.5 text-[0.56rem] text-[#6e7c74]">
                        {bestModel.label} · R² {bestModel.validation_r2.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-[#eadfe2] bg-[linear-gradient(90deg,#fff8fa,#fffdfd,#fff8fa)] px-4 py-3.5 shadow-[0_16px_38px_-34px_rgba(73,32,45,.46)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f8e7ec] text-primary">
              <Sparkles className="size-4" />
            </span>
            <p className="text-[0.68rem] leading-5 text-[#73656c]">
              {topFamily
                ? `Most represented treatment family: ${topFamily.label} (${topFamily.value.toLocaleString()} rows).`
                : "Ingredient-family coverage is available from the current training dataset."}
              {bestModel
                ? ` Current best validation model: ${bestModel.label} at ${bestModel.validation_rmse.toFixed(2)} RMSE days.`
                : ""}
            </p>
          </div>
          <Link
            href="/app/modeling"
            className="inline-flex shrink-0 items-center gap-1.5 text-[0.67rem] font-semibold text-primary hover:underline"
          >
            View modeling details <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </Reveal>
    </PageBody>
  );
}

function formatBuildTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}
