import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  Database,
  Users,
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
import { TiltCard } from "@/components/marketing/landing-interactions";
import styles from "./landing.module.css";

const TEAM = [
  {
    name: "Salwa Karboune",
    credential: "PhD",
    role: "Faculty lead",
    affiliation: "McGill University · Food Science",
    bio: "Food-science supervision and research direction for the platform.",
    photo: "/marketing/karboune.jpg",
  },
  {
    name: "Zahra Allahdad",
    credential: "PhD",
    role: "Research Associate",
    affiliation: "Karboune Lab · McGill University",
    bio: "Validated food-science constraints, helped decide which attributes to include or remove, and ensured domain realism.",
    photo: "/marketing/allahdad.jpg",
  },
  {
    name: "Loubna Benabbou",
    credential: "PhD",
    role: "Research Chair Professor",
    affiliation: "Université du Québec à Rimouski",
    bio: "Guided model selection, helped choose the most relevant plots, and contributed to the machine-learning strategy.",
    photo: "/marketing/benabbou.jpg",
  },
];

const CAPABILITIES = [
  {
    title: "Predict from formulation",
    body: "Matrix chemistry, storage, packaging and context routed to the right specialist.",
  },
  {
    title: "Compare against a control",
    body: "Score candidate treatments beside an untreated control and quantify relative gain.",
  },
  {
    title: "Classify efficacy",
    body: "Low, Medium and High shelf-life-improvement tiers with explanation.",
  },
  {
    title: "Rank ingredients",
    body: "Context-adjusted ingredient effects with data-support visibility.",
  },
  {
    title: "Explain any prediction",
    body: "See which features pushed a result up or down, not just the final number.",
  },
  {
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
    body: "Category × endpoint model routing.",
  },
  {
    step: "04",
    title: "Train families",
    body: "RF, LightGBM, XGBoost and EBM.",
  },
  {
    step: "05",
    title: "Validate & serve",
    body: "Select on validation, then load saved artifacts.",
  },
];

const STATS = [
  {
    value: "34k",
    label: "Rows",
    sublabel: "Curated & validated",
    icon: Database,
  },
  {
    value: "8.5k",
    label: "Formulation contexts",
    sublabel: "Modeled",
    icon: Boxes,
  },
  {
    value: "21",
    label: "Published cases",
    sublabel: "Integrated",
    icon: BookOpen,
  },
  {
    value: "6",
    label: "Specialist models",
    sublabel: "Routed by context",
    icon: Users,
  },
];

const RESEARCH_IMAGES = [
  { src: "/marketing/campus.jpg", label: "Macdonald Campus" },
  { src: "/marketing/lab.jpg", label: "Controlled studies" },
  { src: "/marketing/cheese-aging.jpg", label: "Real cheese matrices" },
];

function WorkflowMap() {
  return (
    <div className={styles.workflowMap}>
      <svg
        aria-hidden
        viewBox="0 0 800 360"
        preserveAspectRatio="none"
        className={styles.workflowLines}
      >
        <path d="M18 55 H95 Q125 55 125 85 V145 Q125 175 155 175 H260" />
        <path d="M270 55 H330 Q360 55 360 85 V145" />
        <path d="M530 55 H650 Q680 55 680 85 V145 Q680 175 650 175 H555" />
        <path d="M95 305 H165 Q195 305 195 275 V220 Q195 190 225 190 H300" />
        <path d="M705 305 H640 Q610 305 610 275 V220 Q610 190 580 190 H500" />
      </svg>

      {CAPABILITIES.map((item, index) => (
        <Reveal key={item.title} delay={(index % 3) * 0.045} y={10}>
          <article className={`${styles.workflowNode} ${styles[`node${index + 1}`]}`}>
            <span className={styles.nodeNumber}>{index + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        </Reveal>
      ))}

      <div className={styles.workflowCenter}>
        <span className={styles.workflowCenterMark}>M</span>
        Shelf-Life Studio
      </div>
    </div>
  );
}

function MoleculeArt() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 190 190"
      className={styles.moleculeArt}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M38 102 72 76 110 91 139 55" />
        <path d="M72 76 63 38" />
        <path d="M110 91 139 126 163 104" />
        <path d="M139 126 126 162" />
        <path d="M38 102 25 140" />
      </g>
      {[
        [38, 102],
        [72, 76],
        [110, 91],
        [139, 55],
        [63, 38],
        [139, 126],
        [163, 104],
        [126, 162],
        [25, 140],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="currentColor" />
      ))}
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <Reveal immediate>
                <p className={styles.eyebrow}>Predict. Understand. Extend.</p>
              </Reveal>

              <h1 className={styles.heroTitle}>
                <RevealLines
                  immediate
                  lines={["Shelf-life modelling", "with evidence."]}
                />
              </h1>

              <Reveal immediate delay={0.16}>
                <p className={styles.heroLede}>
                  Shelf-Life Studio predicts and explains how food behaves over time.
                  Powered by food-science research and built for transparency.
                </p>
              </Reveal>

              <Reveal immediate delay={0.22}>
                <div className={styles.actions}>
                  <Link
                    href="/signup"
                    className={`${buttonVariants({ size: "lg" })} ${styles.primaryAction}`}
                  >
                    Create an account
                    <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href="#platform"
                    className={`${buttonVariants({ size: "lg", variant: "outline" })} ${styles.secondaryAction}`}
                  >
                    Explore the platform
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal immediate delay={0.12} y={14}>
              <TiltCard className={styles.heroProduct}>
                <HeroProductPreview />
              </TiltCard>
            </Reveal>
          </div>

          <Reveal immediate delay={0.28}>
            <div className={`${styles.container} ${styles.statsStrip}`}>
              {STATS.map((stat) => (
                <div key={stat.label} className={styles.statItem}>
                  <span className={styles.statIcon}>
                    <stat.icon className="size-[17px]" strokeWidth={1.7} />
                  </span>
                  <div>
                    <strong className={styles.statValue}>{stat.value}</strong>
                    <span className={styles.statLabel}>{stat.label}</span>
                    <span className={styles.statSublabel}>{stat.sublabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="platform" className={styles.section}>
          <div className={`${styles.container} ${styles.workflowSection}`}>
            <div>
              <Reveal>
                <p className={styles.kicker}>Complete by design</p>
              </Reveal>
              <h2 className={styles.sectionTitle}>
                <RevealLines
                  lines={["Everything the", "workflow actually", "needs."]}
                />
              </h2>
              <Reveal delay={0.08}>
                <p className={styles.sectionCopy}>
                  Six capabilities working together so you can trust every prediction and
                  act on it.
                </p>
              </Reveal>
            </div>

            <WorkflowMap />
          </div>
        </section>

        <section id="pipeline" className={styles.section}>
          <div className={`${styles.container} ${styles.pipelineGrid}`}>
            <div>
              <Reveal>
                <p className={styles.kicker}>Pipeline</p>
              </Reveal>
              <h2 className={styles.sectionTitle}>
                <RevealLines lines={["From raw data", "to served", "prediction."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={styles.sectionCopy}>
                  A deliberate, inspectable sequence. Nothing retrains at request time.
                </p>
              </Reveal>
            </div>

            <div className={styles.pipelineSteps}>
              {PIPELINE.map((item, index) => (
                <Reveal key={item.step} delay={index * 0.035} y={9}>
                  <article className={styles.pipelineStep}>
                    <span className={styles.stepNumber}>{item.step}</span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <div className={`${styles.container} ${styles.explainability}`}>
            <div className={styles.petriStage}>
              <div className={`${styles.petriBlob} ${styles.petriBlobOne}`} />
              <div className={`${styles.petriBlob} ${styles.petriBlobTwo}`} />
              <div className={styles.petriDisc}>
                <EditorialImage
                  src="/marketing/microbes.jpg"
                  caption="Microbial growth on an agar plate"
                  className="h-full w-full"
                />
              </div>
            </div>

            <div className={styles.explainCopy}>
              <Reveal>
                <p className={styles.kicker}>Explainability</p>
              </Reveal>
              <h2 className={styles.sectionTitle}>
                <RevealLines lines={["A number is", "not an answer."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={styles.sectionCopy}>
                  Every prediction decomposes into the factors that drove it.
                  Explainability stays visible beside the prediction instead of being
                  buried in a technical page.
                </p>
              </Reveal>
              <Reveal delay={0.13}>
                <ul className={styles.explainList}>
                  {["Global feature importance", "Local attribution", "EBM shape functions"].map(
                    (item) => (
                      <li key={item}>
                        <Check className="size-3.5" strokeWidth={1.8} />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={0.12} y={12}>
              <TiltCard className={styles.chartCard}>
                <ExplainPreview height={230} />
              </TiltCard>
            </Reveal>

            <MoleculeArt />
          </div>
        </section>

        <section id="research" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.researchGrid}>
              <div>
                <Reveal>
                  <p className={styles.kicker}>Research</p>
                </Reveal>
                <h2 className={styles.sectionTitle}>
                  <RevealLines
                    lines={["Built inside a", "food-science", "programme."]}
                  />
                </h2>
                <Reveal delay={0.08}>
                  <p className={styles.sectionCopy}>
                    Preservation research, cheese matrices and controlled storage
                    translated into an inspectable modelling workflow.
                  </p>
                </Reveal>
                <Reveal delay={0.12}>
                  <a href="#validation" className={styles.researchButton}>
                    Explore our research
                    <ArrowRight className="size-3.5" />
                  </a>
                </Reveal>
              </div>

              <div className={styles.gallery}>
                {RESEARCH_IMAGES.map((item, index) => (
                  <Reveal key={item.src} delay={index * 0.05} y={10}>
                    <figure className={styles.galleryItem}>
                      <EditorialImage
                        src={item.src}
                        caption={item.label}
                        className="h-full w-full"
                      />
                      <figcaption>{item.label}</figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>

            <div className={styles.teamHeadingWrap}>
              <p className={styles.kicker}>Research team</p>
              <h3>Three collaborators. Equal visual weight.</h3>
            </div>

            <div className={styles.teamGrid}>
              {TEAM.map((person, index) => (
                <Reveal key={person.name} delay={index * 0.055} y={10}>
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

        <section id="validation" className={styles.bottomSection}>
          <div className={styles.validationCopy}>
            <div className={styles.validationInner}>
              <Reveal>
                <p className={styles.kicker}>Validation</p>
              </Reveal>
              <h2 className={styles.validationTitle}>
                <RevealLines lines={["Designed to show", "where it fails."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={styles.validationBody}>
                  We evaluate where the model performs well—and where it needs more data.
                  Error is surfaced by cheese category.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <div className={styles.statusBlock}>
                  <strong>Current status</strong>
                  <span>
                    External literature validation: 21 published cases. Stronger agreement
                    for soft cheeses; substantial error for hard cheeses.
                  </span>
                </div>
              </Reveal>
            </div>
          </div>

          <div className={styles.validationChart}>
            <Reveal y={10} className="w-full">
              <div className={styles.validationChartCard}>
                <CategoryErrorPreview height={190} />
              </div>
            </Reveal>
          </div>

          <div className={styles.workspaceCta}>
            <div className={styles.workspaceGlow} />
            <p className={styles.workspaceKicker}>Your workspace</p>
            <h2>Start modelling in your own workspace.</h2>
            <p>
              Run predictions, compare treatments, classify efficacy and inspect trained
              models.
            </p>
            <div className={styles.workspaceActions}>
              <Link href="/signup" className={styles.workspacePrimary}>
                Create an account
                <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/login" className={styles.workspaceSecondary}>
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
