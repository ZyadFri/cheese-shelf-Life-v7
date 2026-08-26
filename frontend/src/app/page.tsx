import Link from "next/link";
import {
  ArrowRight,
  Beaker,
  GitBranch,
  Layers,
  LineChart,
  Lock,
  ScrollText,
  SlidersHorizontal,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsOf } from "@/lib/utils";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Reveal, RevealLines } from "@/components/marketing/reveal";
import { EditorialImage } from "@/components/marketing/editorial-image";
import {
  CategoryErrorPreview,
  ExplainPreview,
  HeroProductPreview,
} from "@/components/marketing/previews";

/**
 * Research team.
 *
 * Dr. Salwa Karboune and Zahra Allahdad are verified against the Karboune
 * Lab's own official team page (karboune-group.lab.mcgill.ca/our-team1-1).
 * Loubna Benabbou's title/affiliation/bio were supplied directly by the
 * project owner and are used as given -- note her affiliation is UQAR, not
 * McGill, so she is presented on her own real credentials rather than folded
 * into the McGill Food Science framing.
 */
const TEAM = [
  {
    name: "Salwa Karboune",
    credential: "PhD",
    role: "Faculty lead",
    affiliation: "Department of Food Science and Agricultural Chemistry, McGill University",
    bio: "Developed within her research group at Macdonald Campus, supporting ongoing work in food preservation and shelf-life science.",
    photo: "/marketing/karboune.jpg",
  },
  {
    name: "Zahra Allahdad",
    credential: "PhD",
    role: "Research Associate",
    affiliation: "Karboune Lab, McGill University (2022–present)",
    bio: "Focuses on food protein modification, developing functional ingredients that improve food product quality.",
    photo: "/marketing/allahdad.jpg",
  },
  {
    name: "Loubna Benabbou",
    credential: "PhD",
    role: "Research Chair Professor",
    affiliation: "AI for Supply Chain Management, Université du Québec à Rimouski",
    bio: "Applies machine learning and operations research to data-driven decision-making, including supply chain management and climate-risk mitigation.",
    photo: "/marketing/benabbou.jpg",
  },
];

/** Capabilities the application actually ships today -- each maps to a real
 *  route in the authenticated workspace. */
const CAPABILITIES = [
  {
    icon: SlidersHorizontal,
    title: "Predict from formulation",
    body: "Matrix chemistry, storage, packaging and the spoilage indicator you track, routed to the specialist trained for that cheese category and task.",
  },
  {
    icon: GitBranch,
    title: "Compare against a control",
    body: "Score candidate treatments beside an untreated control built from the training split's own control rows.",
  },
  {
    icon: Layers,
    title: "Classify efficacy",
    body: "Predict whether a treated formulation lands in the Low, Medium or High shelf-life-improvement tier, with a real SHAP explanation.",
  },
  {
    icon: LineChart,
    title: "Rank ingredients",
    body: "Each ingredient's own context-adjusted effect, controlling for the conditions it happened to be tested under.",
  },
  {
    icon: ScrollText,
    title: "Explain any prediction",
    body: "See which features pushed a prediction up or down — native decompositions from the EBM, perturbation for the tree models.",
  },
  {
    icon: Lock,
    title: "Leakage-safe by design",
    body: "Rows group by context so a formulation and its control never split across train, validation and test.",
  },
];

/** The real V7 training sequence (train_specialists.py --data-version v7). */
const PIPELINE = [
  {
    step: "01",
    title: "Load V7 specialist data",
    body: "Three corrected category files — soft, semi-hard and hard — covering 34,000 rows of cheese formulations.",
  },
  {
    step: "02",
    title: "Split by context, not by row",
    body: "A formulation and its matched control share a context and stay together, so nothing leaks across splits.",
  },
  {
    step: "03",
    title: "Route to a specialist",
    body: "Six models: each cheese category × prediction task (general shelf life, safety endpoint) trains independently.",
  },
  {
    step: "04",
    title: "Train four model families",
    body: "Random Forest, LightGBM, XGBoost and an Explainable Boosting Machine, fit separately per specialist.",
  },
  {
    step: "05",
    title: "Select on validation",
    body: "The deployed model is chosen by validation RMSE. Test metrics are kept for reporting, never for selection.",
  },
  {
    step: "06",
    title: "Serve from saved artifacts",
    body: "The API loads trained models once at startup. Nothing is retrained at request time.",
  },
];

/** Real, counted directly from the three V7 specialist CSVs and manifests. */
const STATS = [
  { value: "34,000", label: "Training rows" },
  { value: "8,500", label: "Formulation contexts" },
  { value: "6", label: "Trained specialists" },
  { value: "70/15/15", label: "Grouped split" },
];

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <main className="flex flex-col overflow-x-clip">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative border-b border-border px-5 pt-28 pb-16 sm:px-7 sm:pt-32 sm:pb-20">
          {/* Photograph bleeding in from the right edge, behind the preview. */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 hidden h-full w-[34%] xl:block"
          >
            <EditorialImage
              src="/marketing/cheese-cave.jpg"
              caption=""
              className="h-full w-full"
              imageClassName="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/50" />
          </div>

          <div className="relative mx-auto grid w-full max-w-[1180px] items-center gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-14">
            <div>
              <Reveal immediate>
                <Link
                  href="#validation"
                  className="group inline-flex items-center gap-2 rounded-full border border-border py-1 pr-2.5 pl-1 transition-colors hover:border-border-strong"
                >
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-medium text-primary">
                    New
                  </span>
                  <span className="type-caption text-muted-foreground">
                    External literature validation
                  </span>
                  <ArrowRight className="size-3 text-subtle-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Reveal>

              <h1 className="type-hero mt-6 text-foreground">
                <RevealLines
                  immediate
                  lines={["Shelf-life modelling,", "with the evidence"]}
                />
                <span className="block text-primary italic">attached.</span>
              </h1>

              <Reveal immediate delay={0.18}>
                <p className="type-lede mt-5 max-w-[46ch] text-muted-foreground">
                  Model how formulation, packaging and storage change cheese shelf life —
                  and see exactly where the model holds up and where it doesn&apos;t.
                </p>
              </Reveal>

              <Reveal immediate delay={0.24}>
                <div className="mt-7 flex flex-wrap items-center gap-2.5">
                  <Link href="/signup" className={buttonVariants({ size: "lg" })}>
                    Get started
                    <ArrowRight className="size-4" />
                  </Link>
                  <a href="#platform" className={buttonVariants({ size: "lg", variant: "outline" })}>
                    See the platform
                  </a>
                </div>
              </Reveal>

              <Reveal immediate delay={0.3}>
                <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-4">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <dt className="numeral text-[1.375rem] leading-none font-medium tracking-[-0.02em] text-foreground">
                        {stat.value}
                      </dt>
                      <dd className="type-caption mt-1.5 text-subtle-foreground">{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <Reveal immediate delay={0.2} y={16}>
              <HeroProductPreview />
            </Reveal>
          </div>
        </section>

        {/* ── Platform ─────────────────────────────────────────────────── */}
        <section id="platform" className="scroll-mt-16 border-b border-border px-5 py-20 sm:px-7 sm:py-24">
          <div className="mx-auto grid w-full max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal>
                <p className="type-eyebrow text-primary">Platform</p>
              </Reveal>
              <h2 className="type-section mt-3 text-foreground">
                <RevealLines lines={["Everything the workflow", "actually needs."]} />
              </h2>
              <Reveal delay={0.1}>
                <p className="type-lede mt-4 max-w-[42ch] text-muted-foreground">
                  Built around how shelf-life studies are really run: a formulation, a
                  control, a spoilage indicator, and a question about whether a treatment
                  meaningfully extends the result.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {CAPABILITIES.map((item, i) => (
                <Reveal key={item.title} delay={(i % 3) * 0.05}>
                  <div className="border-t border-border pt-4">
                    <item.icon className="size-4 text-primary" strokeWidth={1.75} />
                    <h3 className="type-title mt-3 text-foreground">{item.title}</h3>
                    <p className="type-ui mt-1.5 leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pipeline ─────────────────────────────────────────────────── */}
        <section id="pipeline" className="scroll-mt-16 border-b border-border px-5 py-20 sm:px-7 sm:py-24">
          <div className="mx-auto w-full max-w-[1180px]">
            <div className="max-w-[640px]">
              <Reveal>
                <p className="type-eyebrow text-primary">Pipeline</p>
              </Reveal>
              <h2 className="type-section mt-3 text-foreground">
                <RevealLines lines={["From raw data", "to served prediction."]} />
              </h2>
              <Reveal delay={0.1}>
                <p className="type-lede mt-4 max-w-[54ch] text-muted-foreground">
                  Training is a deliberate, inspectable sequence. Nothing is retrained at
                  request time — the API loads saved artifacts once and serves from them.
                </p>
              </Reveal>
            </div>

            <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {PIPELINE.map((s, i) => (
                <Reveal key={s.step} delay={(i % 3) * 0.05}>
                  <div className="relative border-t border-border pt-4">
                    <span
                      aria-hidden
                      className="absolute -top-px left-0 h-px w-8 bg-primary"
                    />
                    <span className="numeral type-caption font-medium text-primary">{s.step}</span>
                    <h3 className="type-title mt-2 text-foreground">{s.title}</h3>
                    <p className="type-ui mt-1.5 leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Explainability ───────────────────────────────────────────── */}
        <section className="border-b border-border">
          <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)]">
            <Reveal y={0} className="relative min-h-[260px] lg:min-h-full">
              <EditorialImage
                src="/marketing/microbes.jpg"
                caption="Bacterial colonies on an agar plate"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover"
              />
            </Reveal>

            <div className="grid gap-10 px-5 py-20 sm:px-7 sm:py-24 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:items-center xl:gap-14">
              <div>
                <Reveal>
                  <p className="type-eyebrow text-primary">Explainability</p>
                </Reveal>
                <h2 className="type-section mt-3 text-foreground">
                  <RevealLines lines={["A number is not", "an answer."]} />
                </h2>
                <Reveal delay={0.1}>
                  <p className="type-lede mt-4 max-w-[44ch] text-muted-foreground">
                    Every prediction decomposes into the features that drove it. The
                    Explainable Boosting Machine exposes its additive shape functions
                    directly; the tree models substitute each feature with its training
                    reference value and measure the shift.
                  </p>
                </Reveal>
                <Reveal delay={0.16}>
                  <ul className="mt-5 flex flex-col gap-2">
                    {[
                      "Global importance, permutation-based",
                      "Local attribution for any single prediction",
                      "EBM shape functions for the top terms",
                    ].map((line) => (
                      <li key={line} className="type-ui flex items-start gap-2 text-muted-foreground">
                        <Beaker className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={1.75} />
                        {line}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>

              <Reveal delay={0.14} y={16}>
                <div className="rounded-xl border border-border bg-background shadow-[0_16px_40px_-24px_rgba(13,14,16,0.2)]">
                  <ExplainPreview height={250} />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Research context ─────────────────────────────────────────── */}
        <section id="research" className="scroll-mt-16 border-b border-border px-5 py-20 sm:px-7 sm:py-24">
          <div className="mx-auto w-full max-w-[1180px]">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:gap-16">
              <div>
                <Reveal>
                  <p className="type-eyebrow text-primary">Research</p>
                </Reveal>
                <h2 className="type-section mt-3 text-foreground">
                  <RevealLines lines={["Built inside a", "food-science programme."]} />
                </h2>
                <Reveal delay={0.1}>
                  <p className="type-lede mt-4 text-muted-foreground">
                    The platform supports preservation research — comparing antimicrobial
                    and antioxidant interventions across cheese matrices under controlled
                    storage, with provenance tracked for every row that informs a model.
                  </p>
                </Reveal>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  {
                    src: "/marketing/lab.jpg",
                    caption: "Microbiology laboratory",
                    text: "Controlled storage trials with tracked provenance.",
                  },
                  {
                    src: "/marketing/cheese-aging.jpg",
                    caption: "Cheese ripening cellar",
                    text: "Real matrices across ripening times and conditions.",
                  },
                  {
                    src: "/marketing/campus.jpg",
                    caption: "Macdonald Campus, McGill University",
                    text: "Results you can defend in a paper or a review.",
                  },
                ].map((fig, i) => (
                  <Reveal key={fig.src} delay={i * 0.06} y={16}>
                    <figure>
                      <EditorialImage
                        src={fig.src}
                        caption={fig.caption}
                        className="aspect-[4/3] rounded-lg border border-border"
                      />
                      <figcaption className="type-caption mt-2.5 text-subtle-foreground">
                        {fig.text}
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Team — three equal editorial panels. */}
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {TEAM.map((person, i) => (
                <Reveal key={person.name} delay={i * 0.06} y={16}>
                  <article className="flex h-full flex-col rounded-xl border border-border p-6">
                    <div className="flex items-center gap-3.5">
                      <Avatar className="size-14 shrink-0 border border-border">
                        <AvatarImage src={person.photo} alt="" />
                        <AvatarFallback className="type-ui">{initialsOf(person.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="type-eyebrow text-primary">{person.role}</p>
                        <h3 className="type-title mt-1 text-foreground">
                          {person.name}
                          <span className="text-muted-foreground">, {person.credential}</span>
                        </h3>
                      </div>
                    </div>
                    <p className="type-caption mt-4 text-subtle-foreground">{person.affiliation}</p>
                    <p className="type-ui mt-2.5 leading-relaxed text-muted-foreground">{person.bio}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Validation ───────────────────────────────────────────────── */}
        <section id="validation" className="scroll-mt-16 border-b border-border px-5 py-20 sm:px-7 sm:py-24">
          <div className="mx-auto grid w-full max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)_minmax(0,0.8fr)] lg:items-start lg:gap-12">
            <div>
              <Reveal>
                <p className="type-eyebrow text-primary">Validation</p>
              </Reveal>
              <h2 className="type-section mt-3 text-foreground">
                <RevealLines lines={["Designed to show", "where it fails."]} />
              </h2>
              <Reveal delay={0.1}>
                <p className="type-lede mt-4 text-muted-foreground">
                  A single headline accuracy number hides more than it reveals. Error is
                  reported by cheese category, so a model that performs well overall but
                  poorly on one category cannot pass unnoticed.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.08} y={16}>
              <div className="rounded-xl border border-border bg-background">
                <CategoryErrorPreview height={170} />
              </div>
            </Reveal>

            <Reveal delay={0.14} y={16}>
              <div className="rounded-xl border border-border bg-muted/40 p-5">
                <p className="type-label font-medium text-foreground">Current status</p>
                <p className="type-ui mt-2.5 leading-relaxed text-muted-foreground">
                  Models train on a synthetic, literature-constrained corpus. External
                  validation against 21 published cases shows close agreement for soft
                  cheeses and substantial error for hard cheeses. Those results are
                  reported in the workspace rather than smoothed over.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Closing CTA ──────────────────────────────────────────────── */}
        <section className="grid border-b border-border lg:grid-cols-2">
          <div className="flex flex-col justify-center px-5 py-20 sm:px-7 sm:py-24">
            <div className="mx-auto w-full max-w-[520px] lg:mr-0 lg:ml-auto lg:pr-14">
              <h2 className="type-section text-foreground">
                <RevealLines lines={["Start modelling in", "your own workspace."]} />
              </h2>
              <Reveal delay={0.1}>
                <p className="type-lede mt-4 text-muted-foreground">
                  Create an account to run predictions, compare treatments and inspect the
                  trained models.
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="mt-7 flex flex-wrap items-center gap-2.5">
                  <Link href="/signup" className={buttonVariants({ size: "lg" })}>
                    Create an account
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
                    Log in
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="relative min-h-[280px] lg:min-h-[420px]">
            <EditorialImage
              src="/marketing/cheeses.jpg"
              caption="A range of cheese varieties"
              className="absolute inset-0 h-full w-full"
              imageClassName="object-cover"
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
