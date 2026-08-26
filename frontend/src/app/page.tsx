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
  LandingProgress,
  TiltCard,
} from "@/components/marketing/landing-interactions";
import styles from "./landing.module.css";

const TEAM = [
  {
    name: "Salwa Karboune",
    credential: "PhD",
    role: "Faculty lead",
    affiliation:
      "Dean, Faculty of Agricultural and Environmental Sciences · Associate Vice-President, Macdonald Campus · McGill University",
    bio: "Professor in Food Science and Agricultural Chemistry whose research program spans functional food ingredients, biocatalysis and food product innovation.",
    photo: "/marketing/karboune.jpg",
  },
  {
    name: "Zahra Allahdad",
    credential: "PhD",
    role: "Research Associate",
    affiliation: "Karboune Lab · McGill University · 2022–present",
    bio: "Researches food protein modification and functional ingredients that improve food quality and sustainability.",
    photo: "/marketing/allahdad.jpg",
  },
  {
    name: "Loubna Benabbou",
    credential: "PhD",
    role: "Research Chair Professor",
    affiliation: "Université du Québec à Rimouski · Campus de Lévis",
    bio: "Works across machine learning, decision science and resilient digital supply chains.",
    photo: "/marketing/benabbou.jpg",
  },
];

const CAPABILITIES = [
  {
    icon: SlidersHorizontal,
    title: "Predict from formulation",
    body: "Matrix chemistry, storage, packaging and indicator context routed to the right specialist.",
  },
  {
    icon: GitBranch,
    title: "Compare against a control",
    body: "Score candidate treatments beside an untreated control and quantify relative gain.",
  },
  {
    icon: Layers,
    title: "Classify efficacy",
    body: "Low, Medium and High shelf-life-improvement tiers with a real explanation.",
  },
  {
    icon: LineChart,
    title: "Rank ingredients",
    body: "Context-adjusted ingredient effects with data-support visibility.",
  },
  {
    icon: ScrollText,
    title: "Explain any prediction",
    body: "See which features pushed a result up or down, not just the final number.",
  },
  {
    icon: Lock,
    title: "Leakage-safe by design",
    body: "Grouped context splitting keeps matched formulations together across partitions.",
  },
];

const PIPELINE = [
  {
    step: "01",
    title: "Load V7 data",
    body: "Soft, semi-hard and hard corrected specialist files.",
  },
  {
    step: "02",
    title: "Split by context",
    body: "Matched formulation/control rows stay together.",
  },
  {
    step: "03",
    title: "Route specialist",
    body: "Cheese category × endpoint model routing.",
  },
  {
    step: "04",
    title: "Train families",
    body: "Random Forest, LightGBM, XGBoost and EBM.",
  },
  {
    step: "05",
    title: "Validate & serve",
    body: "Select on validation, then load saved artifacts.",
  },
];

const STATS = [
  { value: "34,000", label: "Training rows" },
  { value: "8,500", label: "Formulation contexts" },
  { value: "6", label: "Trained specialists" },
  { value: "70/15/15", label: "Grouped split" },
];

const RESEARCH_IMAGES = [
  { src: "/marketing/campus.jpg", label: "Macdonald Campus" },
  { src: "/marketing/lab.jpg", label: "Controlled studies" },
  { src: "/marketing/cheese-aging.jpg", label: "Real cheese matrices" },
];

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <LandingProgress />
      <SiteHeader />

      <main className="overflow-x-clip">
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className="relative z-10">
              <Reveal immediate>
                <a href="#validation" className={styles.eyebrow}>
                  <span className={styles.newPill}>New</span>
                  External literature validation
                  <ArrowRight className="size-3" />
                </a>
              </Reveal>

              <h1 className={styles.heroTitle}>
                <RevealLines
                  immediate
                  lines={["Shelf-life modelling,", "with the evidence"]}
                />
                <Reveal immediate delay={0.16}>
                  <span className={styles.heroAccent}>attached.</span>
                </Reveal>
              </h1>

              <Reveal immediate delay={0.22}>
                <p className={styles.lede}>
                  Model how formulation, packaging and storage change cheese shelf life —
                  and see exactly where the model holds up and where it doesn&apos;t.
                </p>
              </Reveal>

              <Reveal immediate delay={0.28}>
                <div className={styles.actions}>
                  <Link
                    href="/signup"
                    className={`${buttonVariants({ size: "lg" })} ${styles.primaryAction}`}
                  >
                    Get started
                    <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href="#platform"
                    className={`${buttonVariants({ size: "lg", variant: "outline" })} ${styles.secondaryAction}`}
                  >
                    See the platform
                  </a>
                </div>
              </Reveal>

              <Reveal immediate delay={0.34}>
                <dl className={styles.stats}>
                  {STATS.map((stat) => (
                    <div key={stat.label} className={styles.stat}>
                      <dt className={styles.statValue}>{stat.value}</dt>
                      <dd className={styles.statLabel}>{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <div className={styles.heroVisual}>
              <Reveal immediate delay={0.1} y={10}>
                <div className={styles.heroPhoto}>
                  <EditorialImage
                    src="/marketing/cheeses.jpg"
                    caption="Cheese varieties"
                    className="h-full w-full"
                    priority
                  />
                </div>
              </Reveal>

              <Reveal immediate delay={0.23} y={18}>
                <TiltCard className={styles.productWrap}>
                  <HeroProductPreview />
                </TiltCard>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="platform" className={styles.section}>
          <div className={`${styles.container} ${styles.platformGrid}`}>
            <div>
              <Reveal>
                <p className={styles.kicker}>Platform</p>
              </Reveal>
              <h2 className={styles.sectionTitle}>
                <RevealLines lines={["Everything the workflow", "actually needs."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={`${styles.copy} mt-4 max-w-[42ch]`}>
                  Built around how shelf-life studies are really run: a formulation, a
                  control, a spoilage indicator, and a question about whether a treatment
                  meaningfully extends the result.
                </p>
              </Reveal>
            </div>

            <div className={styles.features}>
              {CAPABILITIES.map((item, index) => (
                <Reveal key={item.title} delay={(index % 3) * 0.04}>
                  <article className={styles.feature}>
                    <span className={styles.featureIndex}>0{index + 1}</span>
                    <span className={styles.featureIcon}>
                      <item.icon className="size-4" strokeWidth={1.7} />
                    </span>
                    <h3 className={styles.featureTitle}>{item.title}</h3>
                    <p className={styles.featureBody}>{item.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="pipeline" className={`${styles.section} ${styles.pipeline}`}>
          <div className={`${styles.container} ${styles.pipelineGrid}`}>
            <div>
              <Reveal>
                <p className={styles.kicker}>Pipeline</p>
              </Reveal>
              <h2 className={styles.sectionTitle}>
                <RevealLines lines={["From raw data to a", "served prediction."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={`${styles.copy} mt-4 max-w-[37ch]`}>
                  A deliberate, inspectable sequence. Nothing retrains at request time.
                </p>
              </Reveal>
            </div>

            <div className={styles.steps}>
              {PIPELINE.map((item, index) => (
                <Reveal key={item.step} delay={index * 0.035}>
                  <article className={styles.step}>
                    <span className={styles.stepNumber}>{item.step}</span>
                    <h3 className={styles.stepTitle}>{item.title}</h3>
                    <p className={styles.stepBody}>{item.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.explainSection}>
          <Reveal y={0} className={styles.explainPhoto}>
            <EditorialImage
              src="/marketing/microbes.jpg"
              caption="Microbial growth on an agar plate"
              className="h-full w-full"
            />
          </Reveal>

          <div className={styles.explainCopy}>
            <Reveal>
              <p className={styles.kicker}>Explainability</p>
            </Reveal>
            <h2 className={styles.sectionTitle}>
              <RevealLines lines={["A number is not", "an answer."]} />
            </h2>
            <Reveal delay={0.08}>
              <p className={`${styles.copy} mt-4`}>
                Every prediction decomposes into the factors that drove it. Explainability
                stays visible beside the result instead of being buried in a technical
                page.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <ul className={styles.explainList}>
                {["Global feature importance", "Local attribution", "EBM shape functions"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Beaker className="size-3 text-primary" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </Reveal>
          </div>

          <div className={styles.chartWrap}>
            <Reveal y={12} className="w-full">
              <div className={styles.chartSurface}>
                <ExplainPreview height={240} />
              </div>
            </Reveal>
          </div>
        </section>

        <section id="research" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.researchTop}>
              <div>
                <Reveal>
                  <p className={styles.kicker}>Research</p>
                </Reveal>
                <h2 className={styles.sectionTitle}>
                  <RevealLines lines={["Built inside a", "food-science programme."]} />
                </h2>
                <Reveal delay={0.08}>
                  <p className={`${styles.copy} mt-4 max-w-[40ch]`}>
                    Preservation research, cheese matrices and controlled storage
                    translated into an inspectable modelling workflow.
                  </p>
                </Reveal>
              </div>

              <div className={styles.gallery}>
                {RESEARCH_IMAGES.map((item, index) => (
                  <Reveal key={item.src} delay={index * 0.05} y={12}>
                    <figure className={styles.galleryItem}>
                      <EditorialImage
                        src={item.src}
                        caption={item.label}
                        className="h-full w-full"
                      />
                      <figcaption className={styles.galleryLabel}>{item.label}</figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>

            <div className={styles.teamIntro}>
              <div>
                <p className={styles.kicker}>Research team</p>
                <h3 className={styles.teamHeading}>Three collaborators. Equal visual weight.</h3>
              </div>
              <p className="hidden max-w-[34ch] text-right text-[0.72rem] leading-5 text-subtle-foreground md:block">
                Real professional photographs, real affiliations and a consistent
                side-by-side presentation.
              </p>
            </div>

            <div className={styles.teamGrid}>
              {TEAM.map((person, index) => (
                <Reveal key={person.name} delay={index * 0.055} y={12}>
                  <article className={styles.personCard}>
                    <div className={styles.personPhoto}>
                      <EditorialImage
                        src={person.photo}
                        caption={person.name}
                        className="h-full w-full"
                        imageClassName="object-cover object-top"
                      />
                    </div>
                    <div>
                      <p className={styles.personRole}>{person.role}</p>
                      <h3 className={styles.personName}>
                        {person.name}, {person.credential}
                      </h3>
                      <p className={styles.personAffiliation}>{person.affiliation}</p>
                      <p className={styles.personBio}>{person.bio}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="validation" className={`${styles.section} ${styles.validation}`}>
          <div className={`${styles.container} ${styles.validationGrid}`}>
            <div>
              <Reveal>
                <p className={styles.kicker}>Validation</p>
              </Reveal>
              <h2 className={styles.sectionTitle}>
                <RevealLines lines={["Designed to show", "where it fails."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={`${styles.copy} mt-4 max-w-[43ch]`}>
                  A single headline accuracy number hides more than it reveals. Error is
                  reported by cheese category so weak generalization stays visible.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <div className={styles.status}>
                  <p className={styles.statusTitle}>Current status</p>
                  <p className={styles.statusBody}>
                    External literature validation covers 21 published cases. Agreement is
                    stronger for soft cheeses; hard-cheese error remains substantial and is
                    reported directly.
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal y={12}>
              <TiltCard className={styles.chartSurface}>
                <CategoryErrorPreview height={210} />
              </TiltCard>
            </Reveal>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={styles.finalCopy}>
            <div className={styles.finalInner}>
              <p className={styles.kicker}>Your workspace</p>
              <h2 className={styles.sectionTitle}>
                <RevealLines lines={["Start modelling in", "your own workspace."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={`${styles.copy} mt-4 max-w-[42ch]`}>
                  Create an account to run predictions, compare treatments, classify
                  efficacy and inspect the trained models.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <div className={styles.actions}>
                  <Link
                    href="/signup"
                    className={`${buttonVariants({ size: "lg" })} ${styles.primaryAction}`}
                  >
                    Create an account
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/login"
                    className={`${buttonVariants({ size: "lg", variant: "outline" })} ${styles.secondaryAction}`}
                  >
                    Log in
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>

          <div className={styles.finalPhoto}>
            <EditorialImage
              src="/marketing/research-banner.png"
              caption="Macdonald Campus research"
              className="h-full w-full"
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
