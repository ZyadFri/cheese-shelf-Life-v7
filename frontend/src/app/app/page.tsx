import Link from "next/link";
import type { ReactNode } from "react";

import { api } from "@/lib/api";
import cheeseImages from "@/data/cheese-images.json";
import { PageBody, Reveal } from "@/components/page-shell";
import {
  DemoVideo,
  PredictionCarousel,
  type PredictionExample,
} from "@/components/home-interactive";

const PREDICTION_EXAMPLES: PredictionExample[] = [
  {
    title: "Mozzarella",
    subtitle: "Soft cheese · sliced",
    image:
      cheeseImages["fresh mozzarella"]?.imageUrl ??
      "/marketing/cheeses.jpg",
    predictedDays: 12.484722176972175,
    condition: "100% CO₂ MAP · 7°C",
    sourceLabel: "External-test case · Alves 1996",
  },
  {
    title: "Fresh cheese",
    subtitle: "Fresh acid-coagulated cheese",
    image:
      cheeseImages["minas fresh cheese"]?.imageUrl ??
      "/marketing/cheeses.jpg",
    predictedDays: 13.737692055707438,
    condition: "Atmospheric air · 4°C",
    sourceLabel: "External-test case · Barukčić 2020",
  },
  {
    title: "Gouda spread",
    subtitle: "Semi-hard · spreadable",
    image: cheeseImages.gouda?.imageUrl ?? "/marketing/cheeses.jpg",
    predictedDays: 52.9774572744566,
    condition: "Temperature storage · 8°C",
    sourceLabel: "External-test case · 2018",
  },
  {
    title: "Aged Provolone",
    subtitle: "Hard cheese · portioned",
    image: cheeseImages.provolone?.imageUrl ?? "/marketing/cheese-aging.jpg",
    predictedDays: 60.0878833834208,
    condition: "Vacuum package · 8°C",
    sourceLabel: "External-test case · Favati 2007",
  },
];

const DRIVER_EXAMPLES = ["Moisture", "Salt", "pH", "Storage temperature"] as const;

export default async function HomePage() {
  const [manifest, synthetic] = await Promise.all([api.manifest(), api.datasetSynthetic()]);

  const atAGlance = [
    {
      label: "Rows in current dataset",
      value: manifest.n_total.toLocaleString(),
      image:
        cheeseImages["parmigiano reggiano"]?.thumbUrl ??
        "/marketing/cheeses.jpg",
    },
    {
      label: "Formulation contexts",
      value: manifest.n_contexts_total.toLocaleString(),
      image: cheeseImages.camembert?.thumbUrl ?? "/marketing/cheese-aging.jpg",
    },
    {
      label: "Trained model families",
      value: String(manifest.models_trained.length),
      image: cheeseImages.cheddar?.thumbUrl ?? "/marketing/cheeses.jpg",
    },
  ];

  const modelNames = manifest.models_trained
    .map((model) => prettifyModelName(model))
    .slice(0, 4);

  return (
    <PageBody className="relative isolate max-w-[1480px] overflow-hidden pb-16 pt-5 sm:px-5 lg:px-7">
      <HomeBackdrop />

      <section className="relative grid gap-5 xl:grid-cols-[minmax(300px,.78fr)_minmax(520px,1.24fr)_minmax(250px,.62fr)] xl:items-stretch">
        <div className="relative flex min-h-[330px] flex-col justify-center px-1 py-5 sm:px-3 xl:min-h-[360px]">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#9b5f72]">
            Welcome to Shelf-Life Studio
          </p>
          <h1
            className="mt-4 max-w-[9.5ch] text-[clamp(3rem,5.1vw,5.15rem)] leading-[.9] font-medium tracking-[-0.06em] text-[#6a1834]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Smarter shelf-life starts here
          </h1>
          <p className="mt-5 max-w-[39ch] text-[0.9rem] leading-6 text-[#78676e]">
            Predict, understand, and extend shelf life with machine-learning workflows built for formulation, storage, packaging, and ingredient decisions.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <a
              href="#app-demo"
              className="inline-flex min-h-11 items-center rounded-[10px] bg-[linear-gradient(135deg,#aa2148,#861735)] px-4.5 text-[0.74rem] font-semibold text-white shadow-[0_16px_34px_-19px_rgba(132,22,52,.66)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-18px_rgba(132,22,52,.7)]"
            >
              Watch demo&nbsp;&nbsp;▶
            </a>
            <Link
              href="/app/results"
              className="inline-flex min-h-11 items-center rounded-[10px] border border-[#e5ced5] bg-white/80 px-4.5 text-[0.74rem] font-semibold text-[#7c3149] shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#d7b0bd] hover:bg-white"
            >
              Explore results&nbsp;&nbsp;→
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[0.56rem] text-[#9a858d]">
            <span>Real + synthetic research data</span>
            <span className="hidden text-[#d0b8c0] sm:inline">•</span>
            <span>
              Current shelf-life span {synthetic.target_min.toFixed(0)}–{synthetic.target_max.toFixed(0)} days
            </span>
          </div>
        </div>

        <Reveal delay={0.02}>
          <DemoVideo
            src="/App_Demo.mp4"
            poster={cheeseImages.gorgonzola?.imageUrl ?? "/marketing/cheese-aging.jpg"}
          />
        </Reveal>

        <Reveal delay={0.04}>
          <aside className="h-full rounded-[24px] border border-[#ecdfe3] bg-[linear-gradient(145deg,rgba(255,252,253,.98),rgba(255,246,249,.93))] p-5 shadow-[0_22px_56px_-44px_rgba(92,32,50,.44)] backdrop-blur-xl">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#9b5f72]">
              At a glance
            </p>
            <div className="mt-4 grid gap-2.5">
              {atAGlance.map((item) => (
                <article
                  key={item.label}
                  className="group flex min-h-[74px] items-center justify-between gap-3 overflow-hidden rounded-[15px] border border-[#eee2e6] bg-white/88 px-3.5 py-2.5 shadow-[0_10px_28px_-24px_rgba(82,28,44,.42)] transition-all hover:-translate-y-0.5 hover:border-[#dbbec7] hover:bg-white"
                >
                  <div>
                    <strong className="block text-[1.23rem] font-semibold tracking-[-0.04em] text-[#682039]">
                      {item.value}
                    </strong>
                    <span className="mt-1 block text-[0.52rem] leading-4 text-[#938087]">{item.label}</span>
                  </div>
                  <div className="size-[58px] shrink-0 overflow-hidden rounded-[12px] bg-[#f8eff2]">
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#eadfe2] pt-3 text-[0.5rem] text-[#9a868e]">
              <span>Data updated</span>
              <span className="font-medium text-[#715460]">{formatBuildDate(manifest.created_at_utc)}</span>
            </div>
          </aside>
        </Reveal>
      </section>

      <Reveal delay={0.05}>
        <section className="mt-5 rounded-[24px] border border-[#eadfe2] bg-white/84 p-4 shadow-[0_22px_58px_-48px_rgba(89,30,48,.45)] backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#965b6e]">How it works</p>
              <p className="mt-1 text-[0.62rem] text-[#99858d]">One continuous path from research data to a decision you can explain.</p>
            </div>
            <Link href="/app/how-it-works" className="text-[0.58rem] font-semibold text-[#8c2847] hover:underline">
              View full workflow&nbsp;&nbsp;→
            </Link>
          </div>

          <div className="grid gap-3 lg:grid-cols-5">
            <WorkflowStep number="1" title="Collect & prepare data" description="Bring together formulation, processing, storage, packaging, and literature context.">
              <PhotoVisual src="/images/food-lab.jpg" alt="Food-science laboratory preparation" />
            </WorkflowStep>

            <WorkflowStep number="2" title="Model & train" description="Train and compare multiple modeling approaches against the same prepared data.">
              <div className="relative h-[116px] overflow-hidden rounded-[12px] bg-[#f6edef]">
                <img src="/marketing/cheese-aging.jpg" alt="Cheese aging shelves" className="absolute inset-0 h-full w-full object-cover opacity-25" />
                <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,.9),rgba(255,248,250,.8))]" />
                <div className="relative flex h-full flex-col justify-center p-3">
                  <span className="text-[0.47rem] font-semibold uppercase tracking-[0.08em] text-[#a0808b]">Available model families</span>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {modelNames.map((name) => (
                      <span key={name} className="rounded-full border border-[#ead8de] bg-white/88 px-2 py-1 text-[0.47rem] font-medium text-[#74515e] shadow-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </WorkflowStep>

            <WorkflowStep number="3" title="Predict shelf life" description="Estimate shelf life for a new formulation and compare treatment scenarios side by side.">
              <div className="relative h-[116px] overflow-hidden rounded-[12px] border border-[#eee2e6] bg-[linear-gradient(145deg,#fff,#fff5f8)] p-3">
                <div className="absolute -right-8 -top-8 size-24 rounded-full bg-[#f5dbe3] blur-2xl" />
                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <span className="text-[0.47rem] font-medium text-[#a18790]">Prediction output</span>
                    <strong className="mt-1.5 block text-[1.05rem] font-semibold tracking-[-0.04em] text-[#9b2143]">Shelf-life estimate</strong>
                    <span className="mt-1 block text-[0.48rem] text-[#927e86]">Baseline + candidate treatments</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-full bg-[#f6e5ea] px-2 py-1 text-[0.45rem] text-[#8f5365]">days</span>
                    <span className="rounded-full bg-[#f6e5ea] px-2 py-1 text-[0.45rem] text-[#8f5365]">improvement</span>
                  </div>
                </div>
              </div>
            </WorkflowStep>

            <WorkflowStep number="4" title="Understand drivers" description="See the formulation and storage factors that push each prediction up or down.">
              <div className="relative h-[116px] overflow-hidden rounded-[12px] bg-[#f8f1f3] p-3">
                <img src="/images/microscope.jpg" alt="Microscope in a food-science lab" className="absolute inset-0 h-full w-full object-cover opacity-[.09]" />
                <div className="relative flex h-full flex-wrap content-center gap-1.5">
                  {DRIVER_EXAMPLES.map((label) => (
                    <span key={label} className="rounded-full border border-[#ead8de] bg-white/86 px-2 py-1 text-[0.46rem] font-medium text-[#76535f] shadow-sm">
                      {label}
                    </span>
                  ))}
                  <span className="mt-1 block w-full text-[0.45rem] leading-4 text-[#9b858e]">Per-prediction contributions are available in Explainability.</span>
                </div>
              </div>
            </WorkflowStep>

            <WorkflowStep number="5" title="Compare & decide" description="Explore alternatives, inspect the evidence, and move forward with a clearer formulation choice.">
              <PhotoVisual src="/marketing/cheeses.jpg" alt="Assorted cheese samples for comparison" />
            </WorkflowStep>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section className="mt-5 rounded-[24px] border border-[#eadfe2] bg-[linear-gradient(145deg,rgba(255,255,255,.9),rgba(255,248,250,.84))] p-4 shadow-[0_22px_58px_-48px_rgba(89,30,48,.45)] backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#965b6e]">Example predictions</p>
              <p className="mt-1 text-[0.62rem] text-[#99858d]">Real model outputs already saved in the V7 external-test artifact, paired with real cheese imagery.</p>
            </div>
            <Link href="/app/results" className="text-[0.58rem] font-semibold text-[#8c2847] hover:underline">
              View all results&nbsp;&nbsp;→
            </Link>
          </div>

          <PredictionCarousel items={PREDICTION_EXAMPLES} />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#efe5e8] px-1 pt-3 text-[0.49rem] text-[#a18d94]">
            <span>Prediction values: V7 external-test prediction artifact</span>
            <span>Cheese imagery: Wikipedia / Wikimedia Commons catalog</span>
          </div>
        </section>
      </Reveal>

      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1 text-[0.49rem] text-[#a18f96]">
        <span>Shelf-Life Studio V7 · McGill University</span>
        <span>Research workspace · updated {formatBuildDate(manifest.created_at_utc)}</span>
      </footer>
    </PageBody>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[17px] border border-[#eee2e6] bg-white/92 p-3.5 shadow-[0_12px_30px_-26px_rgba(82,28,45,.44)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d9b8c3] hover:shadow-[0_20px_38px_-25px_rgba(82,28,45,.46)]">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[#c7758b] bg-[#fff8fa] text-[0.55rem] font-semibold text-[#982541]">
          {number}
        </span>
        <div>
          <h2 className="text-[0.66rem] font-semibold text-[#5e2b3d]">{title}</h2>
          <p className="mt-1 min-h-[48px] text-[0.51rem] leading-4 text-[#958188]">{description}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function PhotoVisual({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-[116px] overflow-hidden rounded-[12px] bg-[#f4ecef]">
      <img src={src} alt={alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#52192b]/24 to-transparent" />
    </div>
  );
}

function HomeBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <div className="absolute -left-40 top-[-8rem] size-[34rem] rounded-full bg-[#f9e9ee]/82 blur-[110px]" />
      <div className="absolute right-[-8rem] top-[5rem] size-[30rem] rounded-full bg-[#fff0f3]/80 blur-[100px]" />
      <div className="absolute bottom-[-10rem] left-[38%] size-[34rem] rounded-full bg-[#faeff1]/70 blur-[115px]" />
      <svg className="absolute -left-20 top-44 h-[25rem] w-[34rem] opacity-[.18]" viewBox="0 0 620 430">
        <g fill="none" stroke="#b96c81" strokeWidth="1">
          {Array.from({ length: 9 }).map((_, index) => (
            <path
              key={index}
              d={`M0 ${330 - index * 15} C 120 ${250 - index * 5}, 230 ${395 - index * 12}, 365 ${270 - index * 7} S 520 ${130 + index * 5}, 620 ${170 - index * 3}`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

function prettifyModelName(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\bebm\b/i, "EBM")
    .replace(/\bxgboost\b/i, "XGBoost")
    .replace(/\blightgbm\b/i, "LightGBM")
    .replace(/\brandom forest\b/i, "Random Forest")
    .replace(/\blstm\b/i, "LSTM");
}

function formatBuildDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
