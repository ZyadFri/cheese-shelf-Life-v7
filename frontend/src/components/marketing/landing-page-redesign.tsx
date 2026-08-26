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
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Reveal, RevealLines } from "@/components/marketing/reveal";
import { EditorialImage } from "@/components/marketing/editorial-image";
import {
  CategoryErrorPreview,
  ExplainPreview,
  HeroProductPreview,
} from "@/components/marketing/previews";
import {
  HoverSurface,
  ScrollProgress,
  TiltSurface,
} from "@/components/marketing/landing-motion";

const STATS = [
  { value: "34,000", label: "Training rows" },
  { value: "8,500", label: "Formulation contexts" },
  { value: "6", label: "Trained specialists" },
  { value: "70/15/15", label: "Grouped split" },
];

const CAPABILITIES = [
  {
    icon: SlidersHorizontal,
    title: "Predict from formulation",
    body: "Route cheese chemistry, storage, packaging and indicator inputs to the matching V7 specialist.",
  },
  {
    icon: GitBranch,
    title: "Compare against control",
    body: "Put treated formulations beside a matched untreated control and inspect the predicted gain.",
  },
  {
    icon: Layers,
    title: "Classify efficacy",
    body: "Estimate Low, Medium or High improvement tiers with the classifier already shipped in the workspace.",
  },
  {
    icon: LineChart,
    title: "Rank ingredients",
    body: "Inspect context-adjusted ingredient effects without turning the ranking into a recipe catalogue.",
  },
  {
    icon: ScrollText,
    title: "Explain predictions",
    body: "Expose the features that matter rather than presenting a shelf-life number as a black box.",
  },
  {
    icon: Lock,
    title: "Leakage-safe by design",
    body: "Keep formulation and control rows together across train, validation and test splits.",
  },
];

const PIPELINE = [
  ["01", "Load V7 data", "Corrected soft, semi-hard and hard specialist datasets."],
  ["02", "Group by context", "Matched formulation/control rows stay together."],
  ["03", "Route specialist", "Cheese category × endpoint determines the model."],
  ["04", "Train four families", "RF, LightGBM, XGBoost and EBM compete."],
  ["05", "Select on validation", "Deployment is chosen without test-set peeking."],
  ["06", "Serve artifacts", "Saved models are loaded once and used at request time."],
];

const TEAM = [
  {
    name: "Salwa Karboune",
    credential: "PhD",
    role: "Faculty lead",
    affiliation: "Department of Food Science and Agricultural Chemistry, McGill University",
    photo: "/marketing/karboune.jpg",
    bio: "Food-science research context and scientific supervision for the shelf-life work at Macdonald Campus.",
  },
  {
    name: "Zahra Allahdad",
    credential: "PhD",
    role: "Research Associate",
    affiliation: "Karboune Lab, McGill University",
    photo: "/marketing/allahdad.jpg",
    bio: "Research on food protein modification and functional ingredients that improve food-product quality.",
  },
  {
    name: "Loubna Benabbou",
    credential: "PhD",
    role: "Research Chair Professor",
    affiliation: "AI for Supply Chain Management, Université du Québec à Rimouski",
    photo: "/marketing/benabbou.jpg",
    bio: "Machine learning and operations-research expertise for data-driven decision-making and applied AI.",
  },
];

const heroHeading =
  "font-sans text-[clamp(3rem,6.2vw,5.7rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-foreground";
const sectionHeading =
  "font-sans text-[clamp(2rem,3.5vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-foreground";

export default function LandingPageRedesign() {
  return (
    <div className="min-h-svh bg-background">
      <ScrollProgress />
      <SiteHeader />

      <main className="overflow-x-clip">
        <section className="relative isolate overflow-hidden border-b border-border px-5 pt-28 pb-20 sm:px-7 sm:pt-32 sm:pb-24">
          <div aria-hidden className="pointer-events-none absolute -top-36 left-[35%] -z-10 h-[560px] w-[760px] rounded-full bg-primary/[0.055] blur-[100px]" />
          <div aria-hidden className="pointer-events-none absolute right-[-14%] bottom-[-45%] -z-10 size-[620px] rounded-full bg-[#f4e8eb] blur-[95px]" />

          <div className="mx-auto grid w-full max-w-[1220px] items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16">
            <div className="relative z-20">
              <Reveal immediate>
                <a href="#validation" className="group inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.04] py-1.5 pr-3 pl-1.5 text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.07] active:translate-y-0">
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.04em] text-white uppercase">New</span>
                  <span className="text-[0.75rem] font-medium">External literature validation</span>
                  <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </Reveal>

              <h1 className={`${heroHeading} mt-7 max-w-[10.8ch]`}>
                <RevealLines immediate lines={["Shelf-life modelling,", "with the evidence"]} />
                <Reveal immediate delay={0.14}>
                  <span className="relative mt-1 block w-fit text-primary">
                    attached.
                    <span aria-hidden className="absolute right-0 -bottom-1 left-0 h-[3px] origin-left scale-x-75 rounded-full bg-primary/22 transition-transform duration-500 hover:scale-x-100" />
                  </span>
                </Reveal>
              </h1>

              <Reveal immediate delay={0.2}>
                <p className="mt-6 max-w-[48ch] text-[1.04rem] leading-7 text-muted-foreground sm:text-[1.1rem]">
                  Model how formulation, packaging and storage change cheese shelf life — and see exactly where the model holds up and where it doesn&apos;t.
                </p>
              </Reveal>

              <Reveal immediate delay={0.25}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/signup" className={buttonVariants({ size: "lg", className: "shadow-[0_14px_32px_-20px_rgba(122,27,46,0.72)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_-20px_rgba(122,27,46,0.8)] active:translate-y-0" })}>
                    Get started <ArrowRight className="size-4" />
                  </Link>
                  <a href="#platform" className={buttonVariants({ size: "lg", variant: "outline", className: "transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 active:translate-y-0" })}>
                    See the platform
                  </a>
                </div>
              </Reveal>

              <Reveal immediate delay={0.3}>
                <dl className="mt-11 grid grid-cols-2 gap-x-7 gap-y-6 border-t border-border pt-6 sm:grid-cols-4">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="group/stat cursor-default">
                      <dt className="numeral text-[1.45rem] font-semibold leading-none tracking-[-0.035em] text-foreground transition-all duration-300 group-hover/stat:-translate-y-1 group-hover/stat:text-primary">{stat.value}</dt>
                      <dd className="mt-2 text-[0.67rem] font-medium leading-4 text-subtle-foreground">{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <div className="relative min-h-[445px] sm:min-h-[510px] lg:min-h-[560px]">
              <Reveal immediate delay={0.1} y={12}>
                <div className="absolute top-0 right-[-8%] h-[58%] w-[64%] overflow-hidden rounded-[30px] border border-white shadow-[0_24px_65px_-34px_rgba(13,14,16,0.52)] sm:right-0">
                  <EditorialImage src="/marketing/cheese-cave.jpg" caption="Cheese ripening environment" className="h-full w-full" priority />
                </div>
              </Reveal>
              <Reveal immediate delay={0.23} y={24}>
                <TiltSurface className="absolute right-0 bottom-3 left-0 z-20 rounded-2xl lg:-left-4">
                  <HeroProductPreview />
                </TiltSurface>
              </Reveal>
              <Reveal immediate delay={0.36}>
                <div className="pointer-events-none absolute top-[38%] right-0 z-30 hidden rounded-full border border-border bg-background/92 px-3 py-2 shadow-md backdrop-blur sm:block">
                  <p className="text-[0.68rem] font-semibold text-foreground">Six V7 specialists</p>
                  <p className="mt-0.5 text-[0.61rem] text-subtle-foreground">category × endpoint routing</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="platform" className="scroll-mt-16 border-b border-border px-5 py-20 sm:px-7 sm:py-24">
          <div className="mx-auto grid w-full max-w-[1180px] gap-12 lg:grid-cols-[0.68fr_1.32fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal><p className="text-[0.68rem] font-semibold tracking-[0.11em] text-primary uppercase">Platform</p></Reveal>
              <h2 className={`${sectionHeading} mt-4 max-w-[12ch]`}><RevealLines lines={["Everything the workflow", "actually needs."]} /></h2>
              <Reveal delay={0.1}><p className="mt-5 max-w-[42ch] text-[0.95rem] leading-7 text-muted-foreground">The product stays technical and honest: prediction, comparison, classification, ranking and explanation without decorative fake features.</p></Reveal>
            </div>

            <div className="grid overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
              {CAPABILITIES.map((item, i) => (
                <Reveal key={item.title} delay={(i % 3) * 0.05}>
                  <HoverSurface className="h-full min-h-[210px] border-r border-b border-border bg-background p-6">
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between">
                        <span className="flex size-10 items-center justify-center rounded-full border border-primary/12 bg-primary/[0.045] text-primary transition-all duration-300 group-hover/surface:rotate-[-4deg] group-hover/surface:scale-110 group-hover/surface:bg-primary group-hover/surface:text-white"><item.icon className="size-4" strokeWidth={1.75} /></span>
                        <span className="numeral text-[0.67rem] text-subtle-foreground transition-colors group-hover/surface:text-primary">0{i + 1}</span>
                      </div>
                      <h3 className="mt-8 text-[1rem] font-semibold tracking-[-0.02em] text-foreground transition-colors group-hover/surface:text-primary">{item.title}</h3>
                      <p className="mt-2 text-[0.81rem] leading-6 text-muted-foreground">{item.body}</p>
                      <span aria-hidden className="mt-auto pt-5 text-[0.72rem] font-semibold text-primary opacity-0 transition-all duration-300 group-hover/surface:translate-x-1 group-hover/surface:opacity-100">Explore →</span>
                    </div>
                  </HoverSurface>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="pipeline" className="relative scroll-mt-16 overflow-hidden border-b border-border bg-[#fbfafb] px-5 py-20 sm:px-7 sm:py-24">
          <div aria-hidden className="pointer-events-none absolute -top-44 right-[-8%] size-[440px] rounded-full bg-primary/[0.045] blur-[100px]" />
          <div className="relative mx-auto w-full max-w-[1180px]">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <Reveal><p className="text-[0.68rem] font-semibold tracking-[0.11em] text-primary uppercase">Pipeline</p></Reveal>
                <h2 className={`${sectionHeading} mt-4`}><RevealLines lines={["From raw data to a", "served prediction."]} /></h2>
              </div>
              <Reveal delay={0.08}><p className="max-w-[40ch] text-[0.84rem] leading-6 text-muted-foreground md:text-right">An inspectable sequence: group safely, route correctly, select on validation and serve saved artifacts.</p></Reveal>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PIPELINE.map(([step, title, body], i) => (
                <Reveal key={step} delay={(i % 3) * 0.045}>
                  <HoverSurface className="h-full rounded-xl border border-border bg-background p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/[0.04] text-[0.7rem] font-semibold text-primary transition-all duration-300 group-hover/surface:scale-110 group-hover/surface:bg-primary group-hover/surface:text-white">{step}</span>
                      <div><h3 className="text-[0.95rem] font-semibold tracking-[-0.018em] text-foreground">{title}</h3><p className="mt-2 text-[0.8rem] leading-6 text-muted-foreground">{body}</p></div>
                    </div>
                    <div className="mt-5 h-px overflow-hidden bg-border"><span className="block h-full w-8 bg-primary transition-all duration-500 group-hover/surface:w-full" /></div>
                  </HoverSurface>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-[#fffdfd]">
          <div className="mx-auto grid min-h-[610px] w-full max-w-[1440px] lg:grid-cols-[0.82fr_1.18fr]">
            <Reveal y={0} className="relative min-h-[330px] overflow-hidden lg:min-h-full">
              <EditorialImage src="/marketing/microbes.jpg" caption="Bacterial colonies on agar" className="absolute inset-0 h-full w-full" />
              <div className="absolute right-5 bottom-5 rounded-full border border-white/35 bg-black/35 px-3 py-1.5 text-[0.64rem] font-medium text-white backdrop-blur-md">Microbiology · shelf-life endpoints</div>
            </Reveal>
            <div className="grid items-center gap-10 px-5 py-20 sm:px-7 sm:py-24 xl:grid-cols-[0.72fr_1.28fr] xl:gap-14">
              <div>
                <Reveal><p className="text-[0.68rem] font-semibold tracking-[0.11em] text-primary uppercase">Explainability</p></Reveal>
                <h2 className={`${sectionHeading} mt-4 max-w-[10ch]`}><RevealLines lines={["A number is not", "an answer."]} /></h2>
                <Reveal delay={0.1}><p className="mt-5 max-w-[42ch] text-[0.92rem] leading-7 text-muted-foreground">Every prediction decomposes into the features that drove it, so the interface exposes evidence rather than hiding behind a single output.</p></Reveal>
                <Reveal delay={0.16}><ul className="mt-6 space-y-2.5">{["Global permutation importance", "Local prediction attribution", "EBM shape functions"].map((line) => <li key={line} className="group flex items-center gap-2.5 text-[0.8rem] text-muted-foreground"><span className="flex size-5 items-center justify-center rounded-full bg-primary/[0.055] text-primary transition-all duration-200 group-hover:scale-110 group-hover:bg-primary group-hover:text-white"><Beaker className="size-3" /></span><span className="transition-colors group-hover:text-foreground">{line}</span></li>)}</ul></Reveal>
              </div>
              <Reveal delay={0.12} y={16}><TiltSurface className="rounded-2xl"><div className="rounded-2xl border border-border bg-background shadow-[0_24px_70px_-40px_rgba(13,14,16,0.55)]"><ExplainPreview height={285} /></div></TiltSurface></Reveal>
            </div>
          </div>
        </section>

        <section id="research" className="scroll-mt-16 border-b border-border px-5 py-20 sm:px-7 sm:py-24">
          <div className="mx-auto w-full max-w-[1180px]">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
              <div><Reveal><p className="text-[0.68rem] font-semibold tracking-[0.11em] text-primary uppercase">Research</p></Reveal><h2 className={`${sectionHeading} mt-4 max-w-[12ch]`}><RevealLines lines={["Built inside a", "food-science programme."]} /></h2></div>
              <Reveal delay={0.1}><p className="max-w-[60ch] text-[0.95rem] leading-7 text-muted-foreground">The platform supports preservation research across cheese matrices, storage conditions and intervention strategies, with provenance kept visible.</p></Reveal>
            </div>

            <div className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] lg:grid-cols-12 lg:auto-rows-[120px]">
              <Reveal y={14} className="col-span-2 row-span-2 lg:col-span-6 lg:row-span-3"><div className="relative h-full overflow-hidden rounded-2xl"><EditorialImage src="/marketing/campus.jpg" caption="Macdonald Campus" className="h-full w-full" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 pt-16"><p className="text-[0.78rem] font-semibold text-white">Macdonald Campus</p><p className="mt-1 text-[0.67rem] text-white/70">McGill University · research context</p></div></div></Reveal>
              <Reveal delay={0.06} y={14} className="row-span-2 lg:col-span-3 lg:row-span-3"><div className="relative h-full overflow-hidden rounded-2xl"><EditorialImage src="/marketing/lab.jpg" caption="Laboratory" className="h-full w-full" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-14"><p className="text-[0.72rem] font-semibold text-white">Laboratory</p></div></div></Reveal>
              <Reveal delay={0.12} y={14} className="row-span-2 lg:col-span-3 lg:row-span-3"><div className="relative h-full overflow-hidden rounded-2xl"><EditorialImage src="/marketing/cheese-aging.jpg" caption="Cheese ripening cellar" className="h-full w-full" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-14"><p className="text-[0.72rem] font-semibold text-white">Cheese ripening</p></div></div></Reveal>
            </div>

            <div className="mt-16"><p className="text-[0.68rem] font-semibold tracking-[0.11em] text-primary uppercase">Research team</p><h3 className="mt-3 text-[clamp(1.55rem,2.4vw,2.3rem)] font-semibold tracking-[-0.045em] text-foreground">The people behind the work.</h3></div>
            <div className="mt-7 grid gap-5 lg:grid-cols-3">
              {TEAM.map((person, i) => (
                <Reveal key={person.name} delay={i * 0.06} y={14}>
                  <HoverSurface className="h-full rounded-2xl border border-border bg-background">
                    <article className="flex h-full flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden border-b border-border"><EditorialImage src={person.photo} caption={person.name} className="absolute inset-0 h-full w-full" imageClassName="object-cover object-top" /><div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" /><span className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-black/30 px-2.5 py-1 text-[0.61rem] font-semibold tracking-[0.05em] text-white uppercase backdrop-blur-md">{person.role}</span></div>
                      <div className="flex flex-1 flex-col p-5 sm:p-6"><h4 className="text-[1.05rem] font-semibold tracking-[-0.025em] text-foreground transition-colors group-hover/surface:text-primary">{person.name}<span className="font-normal text-muted-foreground">, {person.credential}</span></h4><p className="mt-2 text-[0.7rem] leading-5 text-subtle-foreground">{person.affiliation}</p><p className="mt-4 text-[0.8rem] leading-6 text-muted-foreground">{person.bio}</p><span aria-hidden className="mt-auto pt-5 text-[0.7rem] font-semibold text-primary opacity-0 transition-all duration-300 group-hover/surface:translate-x-1 group-hover/surface:opacity-100">Research contributor →</span></div>
                    </article>
                  </HoverSurface>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="validation" className="relative scroll-mt-16 overflow-hidden border-b border-border bg-[#fbf7f8] px-5 py-20 sm:px-7 sm:py-24">
          <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-28 size-[420px] rounded-full bg-primary/[0.045] blur-[100px]" />
          <div className="relative mx-auto grid w-full max-w-[1180px] gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-16">
            <div><Reveal><p className="text-[0.68rem] font-semibold tracking-[0.11em] text-primary uppercase">Validation</p></Reveal><h2 className={`${sectionHeading} mt-4 max-w-[11ch]`}><RevealLines lines={["Designed to show", "where it fails."]} /></h2><Reveal delay={0.1}><p className="mt-5 max-w-[43ch] text-[0.93rem] leading-7 text-muted-foreground">A single accuracy number hides too much. External error is reported by cheese category so weak regions remain visible.</p></Reveal><Reveal delay={0.16}><HoverSurface className="mt-7 rounded-xl border border-primary/12 bg-background/75 p-5"><p className="text-[0.7rem] font-semibold tracking-[0.05em] text-primary uppercase">Current status</p><p className="mt-2.5 text-[0.8rem] leading-6 text-muted-foreground">External validation covers 21 published cases. Soft-cheese agreement is much closer than hard-cheese performance, and the page reports that rather than smoothing it over.</p></HoverSurface></Reveal></div>
            <Reveal delay={0.08} y={16}><TiltSurface className="rounded-2xl"><div className="rounded-2xl border border-border bg-background shadow-[0_24px_70px_-40px_rgba(13,14,16,0.5)]"><CategoryErrorPreview height={230} /></div></TiltSurface></Reveal>
          </div>
        </section>

        <section className="grid border-b border-border lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center px-5 py-20 sm:px-7 sm:py-24"><div className="mx-auto w-full max-w-[520px] lg:mr-0 lg:ml-auto lg:pr-14"><p className="text-[0.68rem] font-semibold tracking-[0.11em] text-primary uppercase">Your workspace</p><h2 className={`${sectionHeading} mt-4 max-w-[12ch]`}><RevealLines lines={["Start modelling in", "your own workspace."]} /></h2><Reveal delay={0.1}><p className="mt-5 max-w-[42ch] text-[0.94rem] leading-7 text-muted-foreground">Run predictions, compare treatments, classify efficacy, rank ingredients and inspect the trained models.</p></Reveal><Reveal delay={0.16}><div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className={buttonVariants({ size: "lg", className: "transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_-20px_rgba(122,27,46,0.75)] active:translate-y-0" })}>Create an account <ArrowRight className="size-4" /></Link><Link href="/login" className={buttonVariants({ size: "lg", variant: "outline", className: "transition-transform duration-200 hover:-translate-y-1 active:translate-y-0" })}>Log in</Link></div></Reveal></div></div>
          <div className="relative min-h-[330px] overflow-hidden lg:min-h-[480px]"><EditorialImage src="/marketing/cheeses.jpg" caption="Cheese varieties" className="absolute inset-0 h-full w-full" /><div className="absolute right-5 bottom-5 rounded-full border border-white/35 bg-black/30 px-3 py-1.5 text-[0.64rem] font-medium text-white backdrop-blur-md">soft · semi-hard · hard</div></div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
