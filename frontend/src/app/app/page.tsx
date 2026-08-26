import Link from "next/link";

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
    desc: "Schema checks, cleaning and feature preparation stay consistent.",
    visual: "lab",
  },
  {
    step: "03",
    title: "Context routing",
    desc: "Cheese context and endpoint determine the specialist path.",
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
    desc: "Feature effects reveal what pushed the prediction up or down.",
    visual: "explain",
  },
] as const;

const NEXT_ACTIONS = [
  {
    href: "/app/prediction",
    title: "Predict a formulation",
    desc: "Estimate shelf life and compare candidate treatments.",
  },
  {
    href: "/app/ingredients",
    title: "Compare ingredients",
    desc: "Explore context-aware ingredient efficacy and ranking.",
  },
  {
    href: "/app/modeling",
    title: "Inspect model performance",
    desc: "Compare validation and test behavior across trained models.",
  },
  {
    href: "/app/explainability",
    title: "Explore explainability",
    desc: "Understand the factors driving individual predictions.",
  },
] as const;

const FAMILY_COLORS = ["#7d1732", "#a93a58", "#c76a82", "#d995a7", "#e7bcc8", "#f2dce2"];

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

  const metrics = [
    {
      label: "Total rows",
      value: manifest.n_total.toLocaleString(),
      sub: "Current training dataset",
    },
    {
      label: "Contexts",
      value: manifest.n_contexts_total.toLocaleString(),
      sub: "Unique formulation contexts",
    },
    {
      label: "Target range",
      value: `${synthetic.target_min.toFixed(1)}–${synthetic.target_max.toFixed(1)} d`,
      sub: "Observed shelf-life span",
    },
    {
      label: "Trained models",
      value: String(manifest.models_trained.length),
      sub: "Saved model families",
    },
    {
      label: "Validation RMSE",
      value: bestModel ? `${bestModel.validation_rmse.toFixed(2)} d` : "—",
      sub: "Lowest saved validation error",
    },
    {
      label: "Validation R²",
      value: bestModel ? bestModel.validation_r2.toFixed(3) : "—",
      sub: bestModel?.label ?? "Current best model",
    },
  ] as const;

  return (
    <PageBody className="relative isolate max-w-[1400px] pb-20 pt-4 sm:px-5 lg:px-6">
      <DashboardAmbience />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,.95fr)_minmax(310px,.82fr)_minmax(0,1.18fr)]">
        <section className="relative overflow-hidden rounded-[22px] border border-[#ecdfe3] bg-[linear-gradient(145deg,#fffdfd_0%,#fff8fa_58%,#fff4f7_100%)] p-6 shadow-[0_24px_60px_-46px_rgba(99,36,55,.45)] sm:p-7">
          <div className="pointer-events-none absolute -bottom-16 -right-20 h-52 w-72 rounded-[45%] border border-[#eabfcc]/40" />
          <div className="pointer-events-none absolute -bottom-10 -right-14 h-44 w-64 rounded-[46%] border border-[#eabfcc]/30" />
          <div className="pointer-events-none absolute -bottom-4 -right-8 h-36 w-56 rounded-[47%] border border-[#eabfcc]/22" />

          <div className="relative flex h-full min-h-[292px] flex-col justify-between">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#9d6475]">Overview</p>
              <h1
                className="mt-3 max-w-[10ch] text-[clamp(2.45rem,4vw,3.85rem)] leading-[.95] font-medium tracking-[-0.052em] text-[#5c1630]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Shelf-Life Prediction Workspace
              </h1>
              <p className="mt-4 max-w-[42ch] text-[0.88rem] leading-6 text-[#75646b]">
                Advanced machine-learning models turn formulation, processing and storage data into transparent shelf-life predictions.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href="/app/prediction"
                className="inline-flex min-h-10 items-center rounded-lg bg-[linear-gradient(135deg,#9f1d40,#7a1631)] px-4 text-[0.74rem] font-semibold text-white shadow-[0_14px_30px_-18px_rgba(122,22,49,.64)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-17px_rgba(122,22,49,.7)]"
              >
                Run a prediction&nbsp;&nbsp;→
              </Link>
              <Link
                href="/app/modeling"
                className="inline-flex min-h-10 items-center rounded-lg border border-[#e2cbd2] bg-white/88 px-4 text-[0.74rem] font-semibold text-[#713047] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#d4adb9] hover:bg-white"
              >
                Explore models&nbsp;&nbsp;→
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#ecdfe3] bg-white/92 p-5 shadow-[0_22px_56px_-46px_rgba(90,35,52,.42)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.58rem] font-medium text-[#967983]">Best model · validation</p>
              <h2 className="mt-1 text-[1.08rem] font-semibold tracking-[-0.03em] text-[#5e1831]">
                {bestModel?.label ??
                  MODEL_LABELS[manifest.best_model_by_validation_rmse] ??
                  manifest.best_model_by_validation_rmse}
              </h2>
            </div>
            <span className="rounded-full border border-[#efd8de] bg-[#fff1f4] px-2.5 py-1 text-[0.52rem] font-medium text-[#9b4560]">
              Current leader
            </span>
          </div>

          {bestModel && (
            <div className="mt-5 grid grid-cols-2 divide-x divide-[#f0e5e8] border-y border-[#f0e5e8] py-3">
              <div className="pr-4">
                <span className="text-[0.52rem] text-[#9b858d]">Validation RMSE</span>
                <strong className="mt-1 block text-[1.15rem] font-semibold tracking-[-0.04em] text-[#4f2534]">
                  {bestModel.validation_rmse.toFixed(2)} days
                </strong>
              </div>
              <div className="pl-4">
                <span className="text-[0.52rem] text-[#9b858d]">R² score</span>
                <strong className="mt-1 block text-[1.15rem] font-semibold tracking-[-0.04em] text-[#4f2534]">
                  {bestModel.validation_r2.toFixed(3)}
                </strong>
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.58rem] font-semibold text-[#655159]">Shelf-life distribution</p>
                <p className="text-[0.49rem] text-[#9f8c93]">Current training dataset</p>
              </div>
              <span className="text-[0.49rem] font-medium text-[#9c6978]">{manifest.n_total.toLocaleString()} rows</span>
            </div>
            <MiniHistogram counts={synthetic.shelf_life_histogram} max={histogramMax} />
          </div>
        </section>

        <Reveal>
          <div className="grid h-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="relative min-h-[116px] overflow-hidden rounded-[18px] border border-[#eee2e6] bg-[linear-gradient(145deg,rgba(255,255,255,.96),rgba(255,248,250,.94))] p-4 shadow-[0_16px_38px_-32px_rgba(89,35,51,.4)] transition-all hover:-translate-y-0.5 hover:border-[#ddc3cb] hover:shadow-[0_20px_42px_-30px_rgba(89,35,51,.46)]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-[#f9e4ea]/65 blur-2xl" />
                <div className="relative">
                  <p className="text-[0.55rem] font-medium text-[#927b84]">{metric.label}</p>
                  <strong className="mt-2 block text-[1.34rem] leading-none font-semibold tracking-[-0.045em] text-[#5d2136]">
                    {metric.value}
                  </strong>
                  <p className="mt-2.5 text-[0.5rem] leading-4 text-[#a08c93]">{metric.sub}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.72fr)_minmax(300px,.58fr)]">
        <Reveal>
          <section className="rounded-[22px] border border-[#ecdfe3] bg-white/90 p-5 shadow-[0_20px_52px_-44px_rgba(88,34,50,.42)] backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#916a77]">Our modeling pipeline</p>
                <p className="mt-1 text-[0.66rem] text-[#97858c]">From data to reliable predictions through one shared backend.</p>
              </div>
              <Link href="/app/how-it-works" className="text-[0.6rem] font-semibold text-[#8c2746] hover:underline">
                View pipeline details&nbsp;&nbsp;→
              </Link>
            </div>

            <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              <div className="pointer-events-none absolute left-[4%] right-[4%] top-[104px] hidden h-px bg-[linear-gradient(90deg,transparent,#c96982_8%,#c96982_92%,transparent)] 2xl:block" />
              {PIPELINE.map((step, index) => (
                <article key={step.step} className="group relative z-10">
                  <div className="overflow-hidden rounded-[14px] border border-[#eadde1] bg-[#fffafa] shadow-[0_12px_28px_-24px_rgba(78,28,44,.44)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#d7b4bf] group-hover:shadow-[0_18px_34px_-22px_rgba(78,28,44,.48)]">
                    <PipelineVisual type={step.visual} />
                  </div>
                  <div className="relative mt-3 px-1 text-center 2xl:text-left">
                    <span className="mx-auto mb-2 grid size-6 place-items-center rounded-full border border-[#b85b76] bg-white text-[0.5rem] font-semibold text-[#8a1f3e] shadow-sm 2xl:mx-0">
                      {index + 1}
                    </span>
                    <h3 className="text-[0.64rem] font-semibold text-[#4f3540]">{step.title}</h3>
                    <p className="mt-1 text-[0.52rem] leading-4 text-[#97858d]">{step.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.04}>
          <aside className="rounded-[22px] border border-[#ecdfe3] bg-[linear-gradient(150deg,#fff,#fff7f9)] p-5 shadow-[0_20px_52px_-44px_rgba(88,34,50,.42)]">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#865e6c]">What can I do next?</p>
            <div className="mt-4 grid gap-2.5">
              {NEXT_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-[14px] border border-[#eee1e5] bg-white/90 px-3.5 py-3 transition-all hover:-translate-y-0.5 hover:border-[#d9b9c3] hover:bg-white hover:shadow-[0_12px_28px_-22px_rgba(79,29,44,.42)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <strong className="block text-[0.64rem] font-semibold text-[#5b3140]">{action.title}</strong>
                      <span className="mt-0.5 block text-[0.52rem] leading-4 text-[#9a878e]">{action.desc}</span>
                    </div>
                    <span className="shrink-0 text-sm text-[#9c4861] transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.72fr)_minmax(300px,.58fr)]">
        <Reveal delay={0.05}>
          <section className="rounded-[22px] border border-[#ecdfe3] bg-white/90 p-5 shadow-[0_20px_52px_-44px_rgba(88,34,50,.42)] backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#916a77]">Dataset intelligence</p>
                <p className="mt-1 text-[0.6rem] text-[#9a878e]">Live views derived from the current saved artifacts.</p>
              </div>
              <span className="h-px flex-1 bg-[#eee3e6]" />
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <article className="rounded-[17px] border border-[#eee2e5] bg-[#fffdfd] p-4">
                <div className="mb-3">
                  <h3 className="text-[0.7rem] font-semibold text-[#583543]">Shelf-life distribution</h3>
                  <p className="mt-0.5 text-[0.52rem] text-[#9c8990]">Across the full training dataset.</p>
                </div>
                <HistogramVisual counts={synthetic.shelf_life_histogram} edges={synthetic.shelf_life_bin_edges} />
                <div className="mt-3 flex items-center justify-between border-t border-[#f1e8ea] pt-2 text-[0.5rem] text-[#9a878e]">
                  <span>Total rows</span>
                  <strong className="font-semibold text-[#65505a]">{manifest.n_total.toLocaleString()}</strong>
                </div>
              </article>

              <article className="rounded-[17px] border border-[#eee2e5] bg-[#fffdfd] p-4">
                <div className="mb-3">
                  <h3 className="text-[0.7rem] font-semibold text-[#583543]">Ingredient family composition</h3>
                  <p className="mt-0.5 text-[0.52rem] text-[#9c8990]">Non-control treatment rows.</p>
                </div>
                <div className="grid min-h-[196px] grid-cols-[116px_minmax(0,1fr)] items-center gap-4">
                  <div className="relative mx-auto size-[114px] rounded-full" style={{ background: donutGradient }}>
                    <div className="absolute inset-[20px] grid place-items-center rounded-full bg-[#fffdfd] text-center shadow-inner">
                      <div>
                        <strong className="block text-[1rem] font-semibold tracking-[-0.04em] text-[#5e263b]">
                          {familyTotal.toLocaleString()}
                        </strong>
                        <span className="text-[0.46rem] text-[#9c8990]">treatment rows</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {familySlices.map((slice, index) => (
                      <div key={slice.label} className="grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-2 text-[0.49rem]">
                        <span className="size-2 rounded-full" style={{ background: FAMILY_COLORS[index] }} />
                        <span className="truncate capitalize text-[#67545c]">{slice.label}</span>
                        <span className="font-mono tabular-nums text-[#9d8990]">{((slice.value / familyTotal) * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#f1e8ea] pt-2 text-[0.5rem] text-[#9a878e]">
                  <span>Most represented</span>
                  <strong className="max-w-[56%] truncate capitalize font-semibold text-[#65505a]">{topFamily?.label ?? "—"}</strong>
                </div>
              </article>

              <article className="rounded-[17px] border border-[#eee2e5] bg-[#fffdfd] p-4">
                <div className="mb-3">
                  <h3 className="text-[0.7rem] font-semibold text-[#583543]">Model performance comparison</h3>
                  <p className="mt-0.5 text-[0.52rem] text-[#9c8990]">Validation RMSE in days · lower is better.</p>
                </div>
                <ModelPerformanceVisual models={modelsByRmse} bestModelId={bestModel?.id} />
                <div className="mt-3 flex items-center justify-between border-t border-[#f1e8ea] pt-2 text-[0.5rem] text-[#9a878e]">
                  <span>Best validation model</span>
                  <strong className="max-w-[58%] truncate font-semibold text-[#8b2746]">{bestModel?.label ?? "—"}</strong>
                </div>
              </article>
            </div>
          </section>
        </Reveal>

        <div className="grid gap-4">
          <Reveal delay={0.06}>
            <aside className="rounded-[22px] border border-[#ecdfe3] bg-white/90 p-5 shadow-[0_20px_52px_-44px_rgba(88,34,50,.42)]">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#865e6c]">Artifact status</p>
              <div className="mt-4 grid gap-3">
                <StatusRow label="Built at" value={formatBuildTime(manifest.created_at_utc)} />
                <StatusRow label="Validation rows" value={manifest.n_validation.toLocaleString()} />
                <StatusRow label="Test rows" value={manifest.n_test.toLocaleString()} />
                <StatusRow label="Training duration" value={`${manifest.total_training_duration_sec.toFixed(1)} s`} />
              </div>
              <Link href="/app/modeling" className="mt-4 inline-flex text-[0.56rem] font-semibold text-[#8c2746] hover:underline">
                View training details&nbsp;&nbsp;→
              </Link>
            </aside>
          </Reveal>

          <Reveal delay={0.08}>
            <aside className="relative overflow-hidden rounded-[22px] border border-[#e9d8dd] bg-[linear-gradient(145deg,#fff8fa,#fcecf1)] p-5 shadow-[0_20px_52px_-44px_rgba(88,34,50,.42)]">
              <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-[#e8bbc7]/30 blur-3xl" />
              <div className="relative">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#865e6c]">Current insight</p>
                <p className="mt-3 text-[0.6rem] leading-5 text-[#6b5660]">
                  {bestModel
                    ? `${bestModel.label} currently leads validation at ${bestModel.validation_rmse.toFixed(2)} RMSE days and R² ${bestModel.validation_r2.toFixed(3)}.`
                    : "Model performance is available from the current saved artifacts."}
                  {topFamily
                    ? ` The most represented treatment family is ${topFamily.label}, with ${topFamily.value.toLocaleString()} rows.`
                    : ""}
                </p>
                <Link href="/app/modeling" className="mt-4 inline-flex text-[0.56rem] font-semibold text-[#8c2746] hover:underline">
                  View detailed analysis&nbsp;&nbsp;→
                </Link>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>

      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1 text-[0.48rem] text-[#aa969d]">
        <span>Shelf-Life Studio V7 · McGill University</span>
        <span>Saved artifacts · {formatBuildTime(manifest.created_at_utc)}</span>
      </footer>
    </PageBody>
  );
}

function DashboardAmbience() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-[-10vw] top-[-4rem] -z-20 h-[82rem] overflow-hidden">
      <div className="absolute left-[4%] top-0 size-[28rem] rounded-full bg-[#fae7ed]/78 blur-[105px]" />
      <div className="absolute right-[2%] top-[23rem] size-[31rem] rounded-full bg-[#f9eee9]/72 blur-[115px]" />
      <div className="absolute left-[36%] top-[48rem] size-[25rem] rounded-full bg-[#fff0f4]/72 blur-[100px]" />
      <svg className="absolute -left-16 top-[31rem] h-[31rem] w-[40rem] opacity-35" viewBox="0 0 720 530">
        <g fill="none" stroke="#bc7186" strokeWidth="1">
          {Array.from({ length: 11 }).map((_, index) => (
            <path
              key={index}
              d={`M${12 + index * 9} ${442 - index * 14} C 158 ${314 - index * 7}, 266 ${494 - index * 15}, 398 ${314 - index * 8} S 584 ${166 + index * 8}, 708 ${205 - index * 5}`}
              opacity={0.07 + index * 0.019}
            />
          ))}
        </g>
      </svg>
      <div className="absolute right-[-2rem] top-[55rem] h-[20rem] w-[30rem] opacity-24 [background-image:radial-gradient(circle_at_2px_2px,rgba(154,54,82,.22)_1px,transparent_1.5px)] [background-size:22px_22px]" />
    </div>
  );
}

function MiniHistogram({ counts, max }: { counts: number[]; max: number }) {
  return (
    <div className="flex h-[92px] items-end gap-[2px] border-b border-[#eee2e5] px-1">
      {counts.map((count, index) => (
        <span
          key={index}
          className="min-w-0 flex-1 rounded-t-[2px] bg-[linear-gradient(180deg,#8d1c3c,#d9879c)]"
          style={{ height: `${Math.max(3, (count / max) * 100)}%` }}
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
        <div className="pointer-events-none absolute inset-x-0 top-1/4 border-t border-[#f1e8ea]" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-[#f1e8ea]" />
        <div className="pointer-events-none absolute inset-x-0 top-3/4 border-t border-[#f1e8ea]" />
        <div className="relative z-10 flex h-full items-end gap-[2px]">
          {counts.map((count, index) => (
            <span
              key={index}
              className="min-w-0 flex-1 rounded-t-[2px] bg-[linear-gradient(180deg,#8a1738,#d98298)] transition-opacity hover:opacity-75"
              style={{ height: `${Math.max(2, (count / max) * 100)}%` }}
              title={`${count.toLocaleString()} rows`}
            />
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[0.45rem] font-mono text-[#a08d94]">
        <span>{edges[0]?.toFixed(1) ?? "0"}</span>
        <span>{edges[midpoint]?.toFixed(1) ?? ""}</span>
        <span>{edges.at(-1)?.toFixed(1) ?? ""}</span>
      </div>
      <p className="mt-1 text-center text-[0.46rem] text-[#9b8a90]">Shelf-life days</p>
    </div>
  );
}

function PipelineVisual({ type }: { type: (typeof PIPELINE)[number]["visual"] }) {
  if (type === "data") {
    return (
      <div className="relative h-[104px] overflow-hidden bg-[#f8f2f4]">
        <img src="/marketing/microbes.jpg" alt="" className="h-full w-full object-cover opacity-88 transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.04),rgba(101,29,50,.2))]" />
      </div>
    );
  }
  if (type === "lab") {
    return (
      <div className="relative h-[104px] overflow-hidden bg-[#f8f2f4]">
        <img src="/marketing/lab.jpg" alt="" className="h-full w-full object-cover opacity-92 transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.02),rgba(101,29,50,.14))]" />
      </div>
    );
  }
  if (type === "routing") {
    return (
      <svg aria-hidden viewBox="0 0 180 104" className="h-[104px] w-full bg-[linear-gradient(145deg,#fffafa,#fff1f5)]">
        <g fill="none" stroke="#b75a75" strokeWidth="1.35">
          <path d="M14 22 H52 C72 22 70 42 91 42 H164" />
          <path d="M14 52 H64 C82 52 81 42 100 42" />
          <path d="M14 82 H52 C72 82 70 62 91 62 H164" />
        </g>
        {[22, 52, 82].map((y) => <circle key={y} cx="14" cy={y} r="3" fill="#8d1f3f" />)}
        <circle cx="94" cy="52" r="6.5" fill="#8d1f3f" />
        <circle cx="164" cy="42" r="3" fill="#d28095" />
        <circle cx="164" cy="62" r="3" fill="#d28095" />
      </svg>
    );
  }
  if (type === "training") {
    return (
      <svg aria-hidden viewBox="0 0 180 104" className="h-[104px] w-full bg-[linear-gradient(145deg,#fffafa,#fff2f5)]">
        <path d="M14 85 H168" stroke="#ead8dd" />
        <path d="M20 14 V87" stroke="#ead8dd" />
        <path d="M20 79 C42 74 52 57 68 53 S96 57 112 37 S140 24 166 18" fill="none" stroke="#8d1b3b" strokeWidth="2" />
        <path d="M20 70 C42 67 54 64 69 63 S97 63 112 52 S141 42 166 38" fill="none" stroke="#d78fa2" strokeWidth="1.6" />
      </svg>
    );
  }
  if (type === "prediction") {
    return (
      <svg aria-hidden viewBox="0 0 180 104" className="h-[104px] w-full bg-[linear-gradient(145deg,#fffafa,#fff2f5)]">
        <path d="M15 84 H168" stroke="#ead8dd" />
        <path d="M21 14 V86" stroke="#ead8dd" />
        <path d="M20 78 C40 76 50 69 64 64 S91 57 104 44 S130 32 144 23 S157 19 166 18" fill="none" stroke="#8b1939" strokeWidth="2.1" />
        <path d="M20 83 C40 80 50 73 64 69 S91 62 104 51 S130 39 144 31 S157 26 166 24" fill="none" stroke="#e2adba" strokeWidth="8" opacity=".24" />
        {[64, 104, 144, 166].map((x, i) => <circle key={x} cx={x} cy={[64, 44, 23, 18][i]} r="2.4" fill="#8b1939" />)}
      </svg>
    );
  }
  return (
    <svg aria-hidden viewBox="0 0 180 104" className="h-[104px] w-full bg-[linear-gradient(145deg,#fffafa,#fff2f5)]">
      <path d="M18 52 C31 34 42 26 54 36 S74 75 88 64 S106 25 120 39 S143 76 154 57 S164 38 170 43" fill="none" stroke="#8c1b3b" strokeWidth="1.8" />
      <path d="M18 52 C31 70 42 78 54 68 S74 29 88 40 S106 79 120 65 S143 28 154 47 S164 66 170 61" fill="none" stroke="#d88fa2" strokeWidth="1.5" opacity=".82" />
      <path d="M18 52 H170" stroke="#ead8dd" strokeDasharray="4 4" />
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
            <span className={`mb-1 text-[0.45rem] font-mono ${isBest ? "font-semibold text-[#8b2746]" : "text-[#9b858d]"}`}>
              {model.validation_rmse.toFixed(2)}
            </span>
            <div className="flex h-full w-full items-end justify-center">
              <span
                className={`w-[62%] min-w-5 rounded-t-[5px] ${
                  isBest
                    ? "bg-[linear-gradient(180deg,#8c1738,#641126)]"
                    : "bg-[linear-gradient(180deg,#efcfd7,#d995a8)]"
                }`}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className={`mt-2 w-full truncate text-center text-[0.45rem] ${isBest ? "font-semibold text-[#7d1732]" : "text-[#78666d]"}`} title={model.label}>
              {shortModelLabel(model.label)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f1e8ea] pb-2.5 last:border-0 last:pb-0">
      <span className="text-[0.53rem] text-[#9b878e]">{label}</span>
      <strong className="max-w-[64%] text-right text-[0.53rem] font-semibold text-[#634c56]">{value}</strong>
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
