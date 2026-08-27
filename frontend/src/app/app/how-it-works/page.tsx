import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Brain,
  ClipboardCheck,
  Database,
  LineChart,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { api } from "@/lib/api";
import { PageBody } from "@/components/page-shell";
import { DemoVideo } from "@/components/home-interactive";

const WORKFLOW = [
  { icon: Database, title: "Data curation & validation", detail: "Curate the workbook, validate the schema, and exclude identifiers or provenance fields from model inputs." },
  { icon: RouteIcon, title: "Feature preparation", detail: "Prepare formulation, processing, packaging, storage, endpoint, and treatment variables for the trained pipelines." },
  { icon: Brain, title: "Model training & calibration", detail: "Train saved model artifacts outside the application, then calibrate the prediction workflow on held-out data." },
  { icon: LineChart, title: "Prediction & comparison", detail: "Route a configured cheese case to the saved prediction system and compare baseline and treatment scenarios." },
  { icon: Sparkles, title: "Explainability & reporting", detail: "Surface global drivers, local contributions, formulation classification, and ingredient-efficacy evidence." },
] as const;

export default async function HowItWorksPage() {
  const [manifest, { models }] = await Promise.all([api.manifest(), api.models()]);
  const modelNames = models.map((model) => model.label);
  const syntheticShare = manifest.n_total > 0 ? (manifest.n_synthetic / manifest.n_total) * 100 : 0;

  return (
    <PageBody className="!max-w-[1500px] px-0 pb-16 pt-0 sm:px-0">
      <section className="relative overflow-hidden border-b border-[#eadde1] bg-[linear-gradient(180deg,#fffaf7_0%,#f9e9e5_72%,#fff_100%)] px-5 pb-8 pt-7 sm:px-7 lg:px-10">
        <ResearchHeroBackdrop />

        <div className="relative mx-auto max-w-[1120px]">
          <div className="mx-auto mb-5 max-w-[700px] text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b4e63]">Research guide</p>
            <h1 className="mt-2 font-serif text-[clamp(2.6rem,4vw,4.45rem)] leading-[0.98] tracking-[-0.045em] text-[#2a2024]">
              How Shelf-Life Studio Works
            </h1>
            <p className="mx-auto mt-3 max-w-[62ch] text-[12px] leading-5 text-[#75676c]">
              See the application in action, then explore the scientific formulation, workflow, and decision logic behind the current system.
            </p>
          </div>

          <div className="relative mx-auto max-w-[820px]">
            <div className="absolute -inset-7 -z-10 rounded-[44px] bg-[radial-gradient(circle_at_50%_42%,rgba(147,37,67,.18),rgba(147,37,67,.035)_48%,transparent_72%)] blur-xl" />
            <div className="rounded-[26px] border border-[#d7c3c8] bg-[#24161b] p-2 shadow-[0_34px_80px_-34px_rgba(60,16,31,.68)] ring-1 ring-white/70">
              <DemoVideo src="/App_Demo.mp4" poster="" />
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center text-center">
            <Link
              href="/app/project-guide"
              className="group inline-flex min-h-12 items-center gap-2.5 rounded-full border border-[#841634] bg-[linear-gradient(135deg,#aa2048,#81152f)] px-6 text-[12px] font-semibold text-white shadow-[0_18px_38px_-20px_rgba(128,21,48,.72)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_46px_-19px_rgba(128,21,48,.78)]"
            >
              <Bot className="size-4" />
              Talk to the Project Chatbot
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="mt-2 text-[10px] text-[#8d7d83]">Ask questions. Explore methods. Understand the project in depth.</p>
          </div>
        </div>
      </section>

      <article
        className="mx-auto mt-8 max-w-[1260px] px-5 sm:px-7"
        style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
      >
        <header className="mx-auto max-w-[840px] text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8e1d3d]">Technical overview</p>
          <h2 className="mt-2 text-[38px] leading-none tracking-[-0.028em] text-[#231d20]">How Shelf-Life Studio Works</h2>
          <p className="mx-auto mt-3 max-w-[78ch] text-[15px] leading-6 text-[#62575b]">
            Shelf-Life Studio is a research-oriented decision-support system for modeling cheese shelf life from formulation, processing, packaging, storage, endpoint, and preservation-treatment context.
          </p>
        </header>

        <div className="mt-7 grid border-y border-[#ded6d8] lg:grid-cols-3">
          <section className="border-b border-[#e3dcde] px-1 py-6 lg:border-b-0 lg:border-r lg:px-6">
            <PaperHeading number="1" title="The big picture" />
            <p className="mt-3 text-[14px] leading-[1.62] text-[#4d4347]">
              The application combines a curated tabular dataset with saved machine-learning artifacts. A configured cheese case is represented by a feature vector containing product composition, physical presentation, processing, storage, packaging, endpoint, and treatment information.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <PaperStat label="Dataset rows" value={manifest.n_total.toLocaleString()} />
              <PaperStat label="Contexts" value={manifest.n_contexts_total.toLocaleString()} />
              <PaperStat label="Synthetic rows" value={manifest.n_synthetic.toLocaleString()} />
              <PaperStat label="Paper-derived rows" value={manifest.n_real_paper_derived.toLocaleString()} />
            </div>

            <p className="mt-4 text-[12.5px] leading-[1.55] text-[#74686c]">
              The current dataset is {syntheticShare.toFixed(1)}% synthetic. These counts are read from the active backend manifest each time this page loads.
            </p>
          </section>

          <section className="border-b border-[#e3dcde] px-1 py-6 lg:border-b-0 lg:border-r lg:px-6">
            <PaperHeading number="2" title="The model at the core" />
            <p className="mt-3 text-[14px] leading-[1.62] text-[#4d4347]">
              For a configured case, the predictive system estimates shelf life as a function of the observed feature vector. The user-facing result is a time quantity in days, while additional modules describe efficacy tiers and ingredient-level adjusted effects.
            </p>

            <PaperEquation>
              <span className="italic">T̂</span>(<span className="italic">x</span>) = <span className="italic">f</span><sub>θ</sub>(<span className="italic">x</span>)
            </PaperEquation>
            <p className="mt-2 text-[12.5px] leading-[1.5] text-[#74686c]">
              where <span className="italic">x</span> denotes the configured formulation and environmental context, and <span className="italic">f</span><sub>θ</sub> is a trained predictor loaded from saved artifacts.
            </p>

            <PaperEquation>
              Δ% = 100 × (<span className="italic">T̂</span><sub>treat</sub> − <span className="italic">T̂</span><sub>control</sub>) / <span className="italic">T̂</span><sub>control</sub>
            </PaperEquation>

            <div className="mt-4 rounded-[8px] border border-[#e7dcdf] bg-[#fffafa] px-3 py-2.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8e1d3d]">Loaded model families</p>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[#62565a]">
                {modelNames.length > 0 ? modelNames.join(" · ") : "No model artifacts reported by the backend."}
              </p>
            </div>
          </section>

          <section className="px-1 py-6 lg:px-6">
            <PaperHeading number="3" title="End-to-end workflow" />
            <p className="mt-3 text-[14px] leading-[1.62] text-[#4d4347]">
              The application separates model training from inference: the web interface reads saved artifacts and routes user inputs through the appropriate prediction, explanation, classification, and ranking services.
            </p>

            <div className="mt-5 space-y-3">
              {WORKFLOW.map((step, index) => (
                <div key={step.title} className="grid grid-cols-[28px_1fr] gap-3">
                  <div className="relative flex justify-center">
                    <span className="relative z-10 flex size-6 items-center justify-center rounded-full bg-[#921b3c] text-[9px] font-bold text-white">{String(index + 1).padStart(2, "0")}</span>
                    {index < WORKFLOW.length - 1 && <span className="absolute bottom-[-16px] top-6 w-px bg-[#dec8cf]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <step.icon className="size-3.5 text-[#971f40]" />
                      <h3 className="text-[13px] font-bold text-[#372d31]">{step.title}</h3>
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-[1.45] text-[#776a6f]">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-[10px] border border-[#e2dadd] bg-[#faf8f8] px-4 py-3 text-[12px] leading-[1.5] text-[#665b5f]">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#92203f]" />
          <p>
            <strong className="text-[#33292d]">Current data provenance.</strong>{" "}
            {manifest.n_real_paper_derived > 0
              ? `${manifest.n_real_paper_derived.toLocaleString()} rows are reported as paper-derived and ${manifest.n_synthetic.toLocaleString()} as synthetic.`
              : `The active backend manifest reports no paper-derived subset; all ${manifest.n_synthetic.toLocaleString()} rows are synthetic.`}{" "}
            Interpret predictions as outputs of the current research prototype and consult References for dataset-generation and source details.
          </p>
        </div>
      </article>
    </PageBody>
  );
}

function PaperHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-7 items-center justify-center border border-[#c893a2] text-[11px] font-bold text-[#8e1d3d] [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)]">{number}</span>
      <h3 className="text-[17px] font-bold text-[#31262b]">{title}</h3>
    </div>
  );
}

function PaperStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[7px] border border-[#e7dfe1] bg-white px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.05em] text-[#8e8085]">{label}</p>
      <p className="mt-1 text-[18px] font-bold tabular-nums text-[#342a2e]">{value}</p>
    </div>
  );
}

function PaperEquation({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-[8px] border border-[#ead9de] bg-[linear-gradient(135deg,#fffafa,#fff6f7)] px-4 py-4 text-center text-[22px] leading-none tracking-[0.01em] text-[#33272c] shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
      {children}
    </div>
  );
}

function ResearchHeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-8 size-[360px] rounded-full bg-[#f1d9d5]/55 blur-3xl" />
      <div className="absolute -right-20 top-10 size-[420px] rounded-full bg-[#eab5b8]/38 blur-3xl" />
      <svg viewBox="0 0 1400 560" className="absolute inset-0 h-full w-full opacity-[0.23]" fill="none">
        <g stroke="#a84a62" strokeWidth="1.2">
          <path d="M35 250C190 170 320 360 485 260S790 175 955 270s290 110 420-20" opacity=".45" />
          <path d="M0 280C170 198 320 390 510 290s300-90 470 0 295 92 430-8" opacity=".22" />
          <path d="M78 115l46-26 47 27v54l-47 27-46-27zM124 89v-51M171 116l48-28M78 116l-48-28M219 88l43 25" opacity=".5" />
          <circle cx="124" cy="38" r="8" /><circle cx="30" cy="88" r="8" /><circle cx="262" cy="113" r="8" />
          <path d="M1170 135l35-20 35 20v41l-35 20-35-20zM1240 135l36-21 36 21v41l-36 20-36-20zM1205 196v41M1276 196l35 20" opacity=".42" />
        </g>
        <g stroke="#9e6574" opacity=".16">
          {Array.from({ length: 13 }).map((_, i) => <path key={`v-${i}`} d={`M${70 + i * 110} 0V560`} />)}
          {Array.from({ length: 6 }).map((_, i) => <path key={`h-${i}`} d={`M0 ${90 + i * 90}H1400`} />)}
        </g>
      </svg>
    </div>
  );
}
