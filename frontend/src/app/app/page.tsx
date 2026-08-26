import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Database,
  FlaskConical,
  Layers,
  Lightbulb,
  LineChart,
  Route as RouteIcon,
  Sparkles,
  Trophy,
} from "lucide-react";

import { api, MODEL_LABELS, type ModelSummary } from "@/lib/api";
import { PageBody, Reveal } from "@/components/page-shell";

const PIPELINE = [
  {
    step: "01",
    title: "Data collection",
    desc: "Curated formulation and shelf-life observations enter the workspace.",
    visual: "data",
  },
  {
    step: "02",
    title: "Preprocessing",
    desc: "Schema checks, cleaning and feature preparation happen consistently.",
    visual: "lab",
  },
  {
    step: "03",
    title: "Context routing",
    desc: "Cheese context and endpoint determine the appropriate specialist path.",
    visual: "routing",
  },
  {
    step: "04",
    title: "Model training",
    desc: "Independent model families compete on saved validation artifacts.",
    visual: "training",
  },
  {
    step: "05",
    title: "Prediction",
    desc: "The selected model estimates shelf life for the requested formulation.",
    visual: "prediction",
  },
  {
    step: "06",
    title: "Explainability",
    desc: "Feature effects reveal why the model produced its final prediction.",
    visual: "explain",
  },
] as const;

const NEXT_ACTIONS = [
  {
    href: "/app/prediction",
    title: "Predict a formulation",
    desc: "Estimate shelf life for a formulation and compare candidates.",
    icon: FlaskConical,
  },
  {
    href: "/app/ingredients",
    title: "Compare ingredients",
    desc: "Explore context-aware ingredient efficacy and ranking.",
    icon: Sparkles,
  },
  {
    href: "/app/modeling",
    title: "Inspect model performance",
    desc: "Compare validation and test behavior across trained models.",
    icon: LineChart,
  },
] as const;

const FAMILY_COLORS = ["#7d0f2e", "#a52b4c", "#bd5d76", "#d78c9e", "#e5b2bf", "#f1d7de"];

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

  const familyTotal = Math.max(
    familyData.reduce((sum, item) => sum + item.value, 0),
    1,
  );
  const familySlices = buildFamilySlices(familyData);
  const donutGradient = buildDonutGradient(familySlices);
  const modelsByRmse = [...models].sort((a, b) => a.validation_rmse - b.validation_rmse);
  const histogramMax = Math.max(...synthetic.shelf_life_histogram, 1);
  const topFamily = familyData[0];

  const metricItems = [
    {
      label: "Total rows",
      value: manifest.n_total.toLocaleString(),
      sub: "Training dataset",
      icon: <Database className="size-4" />,
    },
    {
      label: "Contexts",
      value: manifest.n_contexts_total.toLocaleString(),
      sub: "Unique formulations",
      icon: <RouteIcon className="size-4" />,
    },
    {
      label: "Target range",
      value: `${synthetic.target_min.toFixed(1)}–${synthetic.target_max.toFixed(1)} d`,
      sub: "Shelf-life days",
      icon: <LineChart className="size-4" />,
    },
    {
      label: "Trained models",
      value: String(manifest.models_trained.length),
      sub: "Saved model families",
      icon: <Layers className="size-4" />,
    },
    {
      label: "Validation RMSE",
      value: bestModel ? `${bestModel.validation_rmse.toFixed(2)} d` : "—",
      sub: "Best saved model",
      icon: <Sparkles className="size-4" />,
    },
    {
      label: "Validation R²",
      value: bestModel ? bestModel.validation_r2.toFixed(3) : "—",
      sub: bestModel?.label ?? "Current best model",
      icon: <Trophy className="size-4" />,
    },
  ] as const;

  return (
    <PageBody className="relative isolate max-w-[1380px] pb-20 pt-4 sm:px-5 lg:px-6">
      <DashboardAmbience />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,.9fr)]">
        <section className="relative min-h-[344px] overflow-hidden rounded-[24px] border border-[#eadde1] bg-[#4c071b] shadow-[0_28px_70px_-44px_rgba(63,16,31,.8)]">
          <img
            src="/marketing/cheeses.jpg"
            alt="Cheese assortment used as a visual representation of shelf-life research"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(73,0,20,.97)_0%,rgba(91,8,31,.9)_32%,rgba(90,17,37,.48)_60%,rgba(31,13,18,.12)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,.13),transparent_23rem)]" />

          <div className="relative z-10 flex min-h-[344px] flex-col justify-between p-6 sm:p-7 lg:p-8">
            <div className="max-w-[31rem]">
              <span className="inline-flex rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/82 backdrop-blur-md">
                Research snapshot
              </span>
              <h1
                className="mt-4 max-w-[9.5ch] text-[clamp(2.35rem,4.3vw,4.05rem)] leading-[.94] font-medium tracking-[-0.052em] text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Shelf-Life Prediction Workspace
              </h1>
              <p className="mt-4 max-w-[42ch] text-[0.92rem] leading-6 text-white/78">
                Advanced machine-learning models transform formulation, processing and storage data
                into transparent shelf-life predictions.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href="/app/prediction"
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-4 text-[0.76rem] font-semibold text-white shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#75142f]"
                >
                  Run a prediction <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="/app/modeling"
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 text-[0.76rem] font-semibold text-[#7b1833] shadow-[0_12px_28px_-18px_rgba(0,0,0,.5)] transition-transform hover:-translate-y-0.5"
                >
                  Explore models <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(260px,.82fr)] sm:items-end">
              <div className="rounded-2xl border border-white/16 bg-[#3a0717]/48 p-4 text-white shadow-[0_16px_44px_-30px_rgba(0,0,0,.75)] backdrop-blur-xl">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.58rem] font-semibold uppercase tracking-[.08em] text-white/56">
                      Best model
                    </p>
                    <p className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-white">
                      {bestModel?.label ??
                        MODEL_LABELS[manifest.best_model_by_validation_rmse] ??
                        manifest.best_model_by_validation_rmse}
                    </p>
                  </div>
                  {bestModel && (
                    <div className="grid grid-cols-2 gap-x-5 text-right">
                      <div>
                        <span className="block text-[0.52rem] text-white/50">RMSE</span>
                        <strong className="mt-0.5 block text-[0.76rem] font-semibold">
                          {bestModel.validation_rmse.toFixed(2)} d
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[0.52rem] text-white/50">R²</span>
                        <strong className="mt-0.5 block text-[0.76rem] font-semibold">
                          {bestModel.validation_r2.toFixed(3)}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/30 bg-white/84 p-3.5 text-[#34262b] shadow-[0_18px_42px_-30px_rgba(15,5,8,.7)] backdrop-blur-xl">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-[0.58rem] font-semibold uppercase tracking-[.08em] text-[#8b6672]">
                      Shelf-life distribution
                    </p>
                    <p className="mt-0.5 text-[0.5rem] text-[#a58b94]">Current training dataset</p>
                  </div>
                  <span className="rounded-full bg-[#f4e3e9] px-2 py-1 text-[0.5rem] font-medium text-[#8a2944]">
                    {manifest.n_total.toLocaleString()} rows
                  </span>
                </div>
                <MiniHistogram counts={synthetic.shelf_life_histogram} max={histogramMax} />
              </div>
            </div>
          </div>
        </section>

        <Reveal>
          <div className="grid h-full gap-3 sm:grid-cols-2 xl:grid-cols-2">
            {metricItems.map((metric, index) => (
              <article
                key={metric.label}
                className="group relative min-h-[104px] overflow-hidden rounded-[18px] border border-[#eadfe2] bg-white/88 p-4 shadow-[0_18px_42px_-34px_rgba(74,28,43,.44)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[#d9b8c2] hover:shadow-[0_22px_48px_-32px_rgba(74,28,43,.48)]"
              >
                <div className="absolute -right-7 -top-7 size-20 rounded-full bg-[#fae7ed] opacity-65 blur-xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.58rem] font-medium text-[#8f7b82]">{metric.label}</p>
                    <strong className="mt-1.5 block truncate text-[1.35rem] leading-none font-semibold tracking-[-0.045em] text-[#2d2528]">
                      {metric.value}
                    </strong>
                    <p className="mt-2 truncate text-[0.52rem] text-[#aa959c]">{metric.sub}</p>
                  </div>
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full ${
                      index === metricItems.length - 1
                        ? "bg-success/12 text-success"
                        : "bg-[#fae9ee] text-primary"
                    }`}
                  >
                    {metric.icon}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,.62fr)]">
        <Reveal>
          <section className="rounded-[22px] border border-[#eadfe2] bg-white/90 p-5 shadow-[0_20px_48px_-40px_rgba(73,27,42,.45)] backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[1rem] font-semibold tracking-[-0.025em] text-[#2e272a]">
                    Our shared modeling pipeline
                  </h2>
                  <span className="rounded-full bg-[#f5e5ea] px-2 py-1 text-[0.5rem] font-medium text-[#91536a]">
                    Dynamic backend
                  </span>
                </div>
                <p className="mt-1 text-[0.65rem] text-[#96858c]">
                  From curated data to transparent prediction, one inspectable sequence.
                </p>
              </div>
              <Link href="/app/how-it-works" className="text-[0.62rem] font-semibold text-primary hover:underline">
                Pipeline details →
              </Link>
            </div>

            <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              <div className="pointer-events-none absolute left-[4%] right-[4%] top-[66px] hidden h-[2px] bg-[#9b1c3c] opacity-65 2xl:block" />
              {PIPELINE.map((step, index) => (
                <article
                  key={step.step}
                  className="group relative z-10 overflow-hidden rounded-[15px] border border-[#eadfe2] bg-[#fffdfd] shadow-[0_12px_28px_-24px_rgba(76,29,43,.45)] transition-all hover:-translate-y-1 hover:border-[#d4a8b4] hover:shadow-[0_18px_34px_-22px_rgba(76,29,43,.5)]"
                >
                  <PipelineVisual type={step.visual} />
                  <span className="absolute left-3 top-[58px] hidden size-2 rounded-[2px] bg-[#8d1735] ring-4 ring-white 2xl:block" />
                  <div className="p-3.5">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-[0.5rem] font-mono text-[#aa8e97]">{step.step}</span>
                      <span className="h-px w-5 bg-[#d7a9b5]" />
                    </div>
                    <h3 className="text-[0.66rem] font-semibold text-[#32292d]">{step.title}</h3>
                    <p className="mt-1 text-[0.54rem] leading-4 text-[#8b7a81]">{step.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.04}>
          <aside className="rounded-[22px] border border-[#eadfe2] bg-[linear-gradient(150deg,#fff,#fff7fa)] p-5 shadow-[0_20px_48px_-40px_rgba(73,27,42,.45)]">
            <h2 className="text-[0.98rem] font-semibold tracking-[-0.02em] text-[#2d2528]">What can I do next?</h2>
            <p className="mt-1 text-[0.58rem] text-[#9b878f]">Move directly into the next research task.</p>
            <div className="mt-4 grid gap-2.5">
              {NEXT_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-[#eadfe2] bg-white/88 p-3 transition-all hover:-translate-y-0.5 hover:border-[#d3a8b5] hover:shadow-[0_12px_26px_-20px_rgba(75,31,45,.5)]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f8e4ea] text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-[0.65rem] font-semibold text-[#3a3034]">{action.title}</strong>
                      <span className="mt-0.5 block text-[0.54rem] leading-4 text-[#928087]">{action.desc}</span>
                    </div>
                    <ArrowRight className="size-3.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </aside>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,.62fr)]">
        <Reveal delay={0.05}>
          <section className="rounded-[22px] border border-[#eadfe2] bg-white/88 p-5 shadow-[0_20px_48px_-40px_rgba(73,27,42,.45)] backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div>
                <h2 className="text-[1rem] font-semibold tracking-[-0.02em] text-[#2d2629]">Dataset intelligence</h2>
                <p className="mt-1 text-[0.6rem] text-[#97858c]">Three live views derived from the current saved artifacts.</p>
              </div>
              <span className="h-px flex-1 bg-[#eadfe2]" />
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <article className="rounded-[17px] border border-[#ece2e5] bg-[#fffdfd] p-4">
                <div className="mb-3">
                  <h3 className="text-[0.72rem] font-semibold text-[#312a2d]">Shelf-life distribution</h3>
                  <p className="mt-0.5 text-[0.54rem] text-[#9a888f]">Rows across the full training dataset.</p>
                </div>
                <HistogramVisual counts={synthetic.shelf_life_histogram} edges={synthetic.shelf_life_bin_edges} />
                <div className="mt-3 flex items-center justify-between border-t border-[#f0e8eb] pt-2 text-[0.52rem] text-[#98868d]">
                  <span>Total rows</span>
                  <strong className="font-semibold text-[#55484d]">{manifest.n_total.toLocaleString()}</strong>
                </div>
              </article>

              <article className="rounded-[17px] border border-[#ece2e5] bg-[#fffdfd] p-4">
                <div className="mb-3">
                  <h3 className="text-[0.72rem] font-semibold text-[#312a2d]">Ingredient family composition</h3>
                  <p className="mt-0.5 text-[0.54rem] text-[#9a888f]">Distribution of non-control treatment rows.</p>
                </div>
                <div className="grid min-h-[196px] grid-cols-[118px_minmax(0,1fr)] items-center gap-4">
                  <div className="relative mx-auto size-[116px] rounded-full" style={{ background: donutGradient }}>
                    <div className="absolute inset-[20px] grid place-items-center rounded-full bg-[#fffdfd] text-center shadow-inner">
                      <div>
                        <strong className="block text-[1rem] font-semibold tracking-[-0.04em] text-[#372d31]">
                          {familyTotal.toLocaleString()}
                        </strong>
                        <span className="text-[0.47rem] text-[#9c888f]">treatment rows</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {familySlices.map((slice, index) => (
                      <div key={slice.label} className="grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-2 text-[0.5rem]">
                        <span className="size-2 rounded-full" style={{ background: FAMILY_COLORS[index] }} />
                        <span className="truncate capitalize text-[#62545a]">{slice.label}</span>
                        <span className="font-mono tabular-nums text-[#9b858d]">{((slice.value / familyTotal) * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#f0e8eb] pt-2 text-[0.52rem] text-[#98868d]">
                  <span>Most represented</span>
                  <strong className="max-w-[56%] truncate capitalize font-semibold text-[#55484d]">{topFamily?.label ?? "—"}</strong>
                </div>
              </article>

              <article className="rounded-[17px] border border-[#ece2e5] bg-[#fffdfd] p-4">
                <div className="mb-3">
                  <h3 className="text-[0.72rem] font-semibold text-[#312a2d]">Model performance comparison</h3>
                  <p className="mt-0.5 text-[0.54rem] text-[#9a888f]">Validation RMSE in days · lower is better.</p>
                </div>
                <ModelPerformanceVisual models={modelsByRmse} bestModelId={bestModel?.id} />
                <div className="mt-3 flex items-center justify-between border-t border-[#f0e8eb] pt-2 text-[0.52rem] text-[#98868d]">
                  <span>Best validation model</span>
                  <strong className="max-w-[58%] truncate font-semibold text-success">{bestModel?.label ?? "—"}</strong>
                </div>
              </article>
            </div>
          </section>
        </Reveal>

        <div className="grid gap-4">
          <Reveal delay={0.06}>
            <aside className="rounded-[22px] border border-[#eadfe2] bg-white/90 p-5 shadow-[0_20px_48px_-40px_rgba(73,27,42,.45)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[0.84rem] font-semibold text-[#31292d]">Artifact provenance</h2>
                <span className="rounded-full bg-success/10 px-2 py-1 text-[0.5rem] font-medium text-success">Saved</span>
              </div>
              <div className="mt-4 grid gap-3">
                <ProvenanceRow label="Built at" value={formatBuildTime(manifest.created_at_utc)} />
                <ProvenanceRow label="Validation rows" value={manifest.n_validation.toLocaleString()} />
                <ProvenanceRow label="Test rows" value={manifest.n_test.toLocaleString()} />
                <ProvenanceRow label="Random seed" value={String(manifest.random_seed)} />
              </div>
              <Link
                href="/app/modeling"
                className="mt-4 inline-flex items-center gap-1.5 text-[0.58rem] font-semibold text-primary hover:underline"
              >
                View training details <ArrowRight className="size-3" />
              </Link>
            </aside>
          </Reveal>

          <Reveal delay={0.08}>
            <aside className="relative overflow-hidden rounded-[22px] border border-[#e7d5db] bg-[linear-gradient(145deg,#fff8fa,#f9e7ed)] p-5 shadow-[0_20px_48px_-40px_rgba(73,27,42,.45)]">
              <div className="absolute -right-10 -top-10 size-32 rounded-full bg-[#e6b5c3]/35 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-white/75 text-primary shadow-sm">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-[0.8rem] font-semibold text-[#31292d]">Current insight</h2>
                    <p className="text-[0.5rem] text-[#9b7e88]">Generated from current dashboard data</p>
                  </div>
                </div>
                <p className="mt-4 text-[0.61rem] leading-5 text-[#65545b]">
                  {bestModel
                    ? `${bestModel.label} currently leads validation at ${bestModel.validation_rmse.toFixed(2)} RMSE days and R² ${bestModel.validation_r2.toFixed(3)}.`
                    : "Model performance is available from the current saved artifacts."}
                  {topFamily
                    ? ` The most represented treatment family is ${topFamily.label}, with ${topFamily.value.toLocaleString()} rows.`
                    : ""}
                </p>
                <Link
                  href="/app/modeling"
                  className="mt-4 inline-flex items-center gap-1.5 text-[0.58rem] font-semibold text-primary hover:underline"
                >
                  View detailed analysis <ArrowRight className="size-3" />
                </Link>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </PageBody>
  );
}

function DashboardAmbience() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-[-10vw] top-[-4rem] -z-20 h-[78rem] overflow-hidden">
      <div className="absolute left-[1%] top-[4rem] size-[28rem] rounded-full bg-[#f7e7ec]/80 blur-[100px]" />
      <div className="absolute right-[3%] top-[24rem] size-[30rem] rounded-full bg-[#f6ede7]/75 blur-[110px]" />
      <svg className="absolute -left-16 top-[20rem] h-[30rem] w-[38rem] opacity-35" viewBox="0 0 700 520">
        <g fill="none" stroke="#a85d72" strokeWidth="1">
          {Array.from({ length: 10 }).map((_, index) => (
            <path
              key={index}
              d={`M${10 + index * 9} ${430 - index * 14} C 150 ${310 - index * 7}, 260 ${490 - index * 15}, 390 ${310 - index * 8} S 570 ${160 + index * 8}, 690 ${200 - index * 5}`}
              opacity={0.08 + index * 0.022}
            />
          ))}
        </g>
      </svg>
      <div className="absolute right-0 top-[50rem] h-[20rem] w-[30rem] opacity-30 [background-image:radial-gradient(circle_at_2px_2px,rgba(122,27,46,.22)_1px,transparent_1.5px)] [background-size:22px_22px]" />
    </div>
  );
}

function MiniHistogram({ counts, max }: { counts: number[]; max: number }) {
  return (
    <div className="flex h-[74px] items-end gap-[2px]">
      {counts.map((count, index) => (
        <span
          key={index}
          className="min-w-0 flex-1 rounded-t-[2px] bg-[linear-gradient(180deg,#8e1738,#cf788e)]"
          style={{ height: `${Math.max(4, (count / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function HistogramVisual({ counts, edges }: { counts: number[]; edges: number[] }) {
  const max = Math.max(...counts, 1);
  const midpoint = Math.floor((edges.length - 1) / 2);
  return (
    <div>
      <div className="relative h-[188px] border-b border-l border-[#eadfe2] pl-2 pt-2">
        <div className="pointer-events-none absolute inset-x-0 top-1/4 border-t border-[#f0e8eb]" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-[#f0e8eb]" />
        <div className="pointer-events-none absolute inset-x-0 top-3/4 border-t border-[#f0e8eb]" />
        <div className="relative z-10 flex h-full items-end gap-[2px]">
          {counts.map((count, index) => (
            <span
              key={index}
              className="group relative min-w-0 flex-1 rounded-t-[2px] bg-[linear-gradient(180deg,#8a1736,#cf7d91)] transition-opacity hover:opacity-75"
              style={{ height: `${Math.max(2, (count / max) * 100)}%` }}
              title={`${count.toLocaleString()} rows`}
            />
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[0.46rem] font-mono text-[#a08d94]">
        <span>{edges[0]?.toFixed(1) ?? "0"}</span>
        <span>{edges[midpoint]?.toFixed(1) ?? ""}</span>
        <span>{edges.at(-1)?.toFixed(1) ?? ""}</span>
      </div>
      <p className="mt-1 text-center text-[0.48rem] text-[#9b8a90]">Shelf-life days</p>
    </div>
  );
}

function PipelineVisual({ type }: { type: (typeof PIPELINE)[number]["visual"] }) {
  if (type === "data") {
    return (
      <div className="relative h-[82px] overflow-hidden border-b border-[#eee4e7] bg-[#f6f0f2]">
        <img src="/marketing/microbes.jpg" alt="" className="h-full w-full object-cover opacity-88 transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#5c1b2f]/28 to-transparent" />
      </div>
    );
  }
  if (type === "lab") {
    return (
      <div className="relative h-[82px] overflow-hidden border-b border-[#eee4e7] bg-[#f6f0f2]">
        <img src="/marketing/lab.jpg" alt="" className="h-full w-full object-cover opacity-92 transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#5c1b2f]/20 to-transparent" />
      </div>
    );
  }
  if (type === "routing") {
    return (
      <svg aria-hidden viewBox="0 0 180 82" className="h-[82px] w-full border-b border-[#eee4e7] bg-[#fff8fa]">
        <g fill="none" stroke="#b55771" strokeWidth="1.4">
          <path d="M12 17 H54 C72 17 71 34 88 34 H164" />
          <path d="M12 40 H66 C82 40 81 34 96 34" />
          <path d="M12 63 H54 C72 63 71 48 88 48 H164" />
        </g>
        {[17, 40, 63].map((y) => <circle key={y} cx="12" cy={y} r="3.2" fill="#8f1b39" />)}
        <circle cx="91" cy="41" r="7" fill="#8f1b39" />
        <circle cx="164" cy="34" r="3.2" fill="#cf7f93" />
        <circle cx="164" cy="48" r="3.2" fill="#cf7f93" />
      </svg>
    );
  }
  if (type === "training") {
    return (
      <svg aria-hidden viewBox="0 0 180 82" className="h-[82px] w-full border-b border-[#eee4e7] bg-[#fff8fa]">
        <path d="M12 64 C35 58 45 44 61 40 S90 44 104 27 S132 18 168 14" fill="none" stroke="#8b1837" strokeWidth="2" />
        <path d="M12 57 C33 55 47 51 61 50 S91 50 105 39 S135 31 168 28" fill="none" stroke="#d38a9c" strokeWidth="1.6" />
        <path d="M12 68 H168" stroke="#ead9de" />
        <path d="M18 10 V70" stroke="#ead9de" />
      </svg>
    );
  }
  if (type === "prediction") {
    return (
      <svg aria-hidden viewBox="0 0 180 82" className="h-[82px] w-full border-b border-[#eee4e7] bg-[#fff8fa]">
        <path d="M12 65 C30 63 39 58 52 54 S79 49 91 38 S119 28 132 20 S151 15 168 14" fill="none" stroke="#8f1a39" strokeWidth="2.2" />
        <path d="M12 68 C30 66 39 61 52 58 S78 52 92 44 S118 35 132 28 S152 22 168 20" fill="none" stroke="#e2a6b5" strokeWidth="8" opacity=".25" />
        {[52, 91, 132, 168].map((x, i) => <circle key={x} cx={x} cy={[54, 38, 20, 14][i]} r="2.5" fill="#8f1a39" />)}
      </svg>
    );
  }
  return (
    <svg aria-hidden viewBox="0 0 180 82" className="h-[82px] w-full border-b border-[#eee4e7] bg-[#fff8fa]">
      <path d="M12 41 C24 25 34 18 45 27 S65 57 78 48 S95 19 108 31 S130 62 142 45 S155 25 168 34" fill="none" stroke="#8f1a39" strokeWidth="1.8" />
      <path d="M12 41 C24 57 34 64 45 55 S65 25 78 34 S95 63 108 51 S130 20 142 37 S155 57 168 48" fill="none" stroke="#d8899d" strokeWidth="1.5" opacity=".85" />
      <path d="M12 41 H168" stroke="#ead9de" strokeDasharray="4 4" />
    </svg>
  );
}

function ModelPerformanceVisual({ models, bestModelId }: { models: ModelSummary[]; bestModelId?: string }) {
  const max = Math.max(...models.map((model) => model.validation_rmse), 1);
  return (
    <div className="flex h-[210px] items-end gap-3 border-b border-l border-[#eadfe2] px-2 pb-1 pt-5">
      {models.map((model) => {
        const isBest = model.id === bestModelId;
        const height = Math.max(14, (model.validation_rmse / max) * 100);
        return (
          <div key={model.id} className="flex min-w-0 flex-1 flex-col items-center justify-end self-stretch">
            <span className={`mb-1 text-[0.46rem] font-mono ${isBest ? "font-semibold text-success" : "text-[#927e86]"}`}>
              {model.validation_rmse.toFixed(2)}
            </span>
            <div className="flex h-full w-full items-end justify-center">
              <span
                className={`w-[62%] min-w-5 rounded-t-[5px] ${isBest ? "bg-[linear-gradient(180deg,#8f1737,#5e0e25)]" : "bg-[linear-gradient(180deg,#e7bdc8,#c46b82)]"}`}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className={`mt-2 w-full truncate text-center text-[0.46rem] ${isBest ? "font-semibold text-[#7d1732]" : "text-[#77666d]"}`} title={model.label}>
              {shortModelLabel(model.label)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ProvenanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f0e8eb] pb-2.5 last:border-0 last:pb-0">
      <span className="text-[0.55rem] text-[#9a858d]">{label}</span>
      <strong className="max-w-[62%] text-right text-[0.55rem] font-semibold text-[#51444a]">{value}</strong>
    </div>
  );
}

function buildFamilySlices(data: { label: string; value: number }[]) {
  const top = data.slice(0, 5);
  const rest = data.slice(5).reduce((sum, item) => sum + item.value, 0);
  return rest > 0 ? [...top, { label: "other", value: rest }] : top;
}

function buildDonutGradient(slices: { label: string; value: number }[]) {
  const total = Math.max(slices.reduce((sum, slice) => sum + slice.value, 0), 1);
  let start = 0;
  const stops = slices.map((slice, index) => {
    const end = start + (slice.value / total) * 100;
    const stop = `${FAMILY_COLORS[index]} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    start = end;
    return stop;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function shortModelLabel(label: string) {
  return label
    .replace("Explainable Boosting Machine", "EBM")
    .replace("Random Forest", "RF")
    .replace("LightGBM", "LightGBM")
    .replace("XGBoost", "XGBoost");
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
