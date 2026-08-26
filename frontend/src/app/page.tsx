import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  Database,
  FlaskConical,
  Layers,
  ListOrdered,
  Lock,
  MessageCircle,
  ShieldCheck,
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
    icon: FlaskConical,
  },
  {
    title: "Compare against a control",
    body: "Score candidate treatments beside an untreated control and quantify relative gain.",
    icon: Layers,
  },
  {
    title: "Classify efficacy",
    body: "Low, Medium and High shelf-life-improvement tiers with explanation.",
    icon: ShieldCheck,
  },
  {
    title: "Rank ingredients",
    body: "Context-adjusted ingredient effects with data-support visibility.",
    icon: ListOrdered,
  },
  {
    title: "Explain any prediction",
    body: "See which features pushed a result up or down, not just the final number.",
    icon: MessageCircle,
  },
  {
    title: "Leakage-safe by design",
    body: "Grouped context splitting keeps matched formulations together across partitions.",
    icon: Lock,
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

function CapabilityMini({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg aria-hidden viewBox="0 0 120 32" className={styles.capabilitySparkline}>
        <path d="M4 24 C18 22 24 18 35 20 S53 24 66 17 S84 19 99 9 S110 8 116 4" />
        {[4, 35, 66, 99, 116].map((cx, i) => (
          <circle key={cx} cx={cx} cy={[24, 20, 17, 9, 4][i]} r="2.4" />
        ))}
      </svg>
    );
  }

  if (index === 1) {
    return (
      <div className={styles.compareMini} aria-hidden>
        <span>Your formula</span><i className={styles.compareBarStrong} /><b>+18%</b>
        <span>Control</span><i className={styles.compareBarQuiet} /><b>0%</b>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className={styles.tierMini} aria-hidden>
        <span>Low</span><span>Medium</span><span className={styles.tierActive}>High</span>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className={styles.rankMini} aria-hidden>
        <span>Salt</span><i style={{ "--w": "86%" } as CSSProperties} /><b>.72</b>
        <span>Ripening</span><i style={{ "--w": "61%" } as CSSProperties} /><b>.48</b>
        <span>Water activity</span><i style={{ "--w": "39%" } as CSSProperties} /><b>.31</b>
      </div>
    );
  }

  if (index === 4) {
    return (
      <svg aria-hidden viewBox="0 0 120 34" className={styles.explainMini}>
        <path d="M4 18 20 24 34 15 48 17 64 13 80 20 96 12 116 8" />
        {[4, 20, 34, 48, 64, 80, 96, 116].map((cx, i) => (
          <circle key={cx} cx={cx} cy={[18, 24, 15, 17, 13, 20, 12, 8][i]} r="2.5" />
        ))}
      </svg>
    );
  }

  return (
    <div className={styles.partitionMini} aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => <span key={i} className={i === 2 || i === 7 || i === 11 ? styles.partitionHot : ""} />)}
    </div>
  );
}

function CapabilityStage() {
  return (
    <div className={styles.capabilityStage}>
      <div className={styles.capabilityPhoto}>
        <EditorialImage
          src="/marketing/cheese-aging.jpg"
          caption="Aged cheese wheels"
          className="h-full w-full"
          imageClassName="object-cover"
        />
        <div className={styles.capabilityPhotoWash} />
        <div className={styles.capabilityBrand}>
          <span className={styles.capabilityBrandMark}>S</span>
          <strong>Shelf-Life<br />Studio</strong>
        </div>
      </div>

      <svg aria-hidden viewBox="0 0 760 560" preserveAspectRatio="none" className={styles.capabilityConnectors}>
        <path d="M286 96 C340 96 322 166 370 182" />
        <path d="M258 265 C316 265 330 257 373 252" />
        <path d="M310 474 C350 474 337 414 386 395" />
        <path d="M640 110 C580 110 597 176 538 192" />
        <path d="M662 292 C604 292 594 276 548 270" />
        <path d="M625 466 C566 466 580 415 530 392" />
      </svg>

      {CAPABILITIES.map((item, index) => {
        const Icon = item.icon;
        return (
          <Reveal
            key={item.title}
            delay={index * 0.035}
            y={10}
            className={`${styles.capabilityCard} ${styles[`capability${index + 1}`]}`}
          >
            <article className={styles.capabilityCardInner}>
              <div className={styles.capabilityCardTop}>
                <span className={styles.capabilityIcon}><Icon className="size-4" strokeWidth={1.7} /></span>
                <span className={styles.capabilityNumber}>{index + 1}</span>
                <h3>{item.title}</h3>
              </div>
              <p>{item.body}</p>
              <CapabilityMini index={index} />
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

function PipelineMini({ index }: { index: number }) {
  if (index === 0) {
    return <div className={`${styles.pipelineDots} ${styles.pipelineDotsCloud}`} aria-hidden />;
  }
  if (index === 1) {
    return <div className={`${styles.pipelineDots} ${styles.pipelineDotsSplit}`} aria-hidden />;
  }
  if (index === 2) {
    return (
      <div className={styles.routeMini} aria-hidden>
        <span /><span /><span /><span />
        <i />
      </div>
    );
  }
  if (index === 3) {
    return (
      <div className={styles.modelMini} aria-hidden>
        {["LightGBM", "XGBoost", "Random Forest", "EBM"].map((name, i) => (
          <div key={name}><span>{name}</span><i style={{ "--w": `${[92, 67, 55, 39][i]}%` } as CSSProperties} /></div>
        ))}
      </div>
    );
  }
  return (
    <div className={styles.serveMini} aria-hidden>
      <span><Check className="size-5" strokeWidth={2} /></span>
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
                <RevealLines immediate lines={["Shelf-life modelling", "with evidence."]} />
              </h1>

              <Reveal immediate delay={0.16}>
                <p className={styles.heroLede}>
                  Shelf-Life Studio predicts and explains how food behaves over time.
                  Powered by food-science research and built for transparency.
                </p>
              </Reveal>

              <Reveal immediate delay={0.22}>
                <div className={styles.actions}>
                  <Link href="/signup" className={`${buttonVariants({ size: "lg" })} ${styles.primaryAction}`}>
                    Create an account
                    <ArrowRight className="size-4" />
                  </Link>
                  <a href="#platform" className={`${buttonVariants({ size: "lg", variant: "outline" })} ${styles.secondaryAction}`}>
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

        <section id="platform" className={`${styles.section} ${styles.platformSection}`}>
          <div className={`${styles.container} ${styles.platformEditorial}`}>
            <div className={styles.platformIntro}>
              <Reveal><p className={styles.kicker}>Complete by design</p></Reveal>
              <h2 className={styles.platformTitle}>
                <RevealLines lines={["Everything the", "workflow actually", "needs."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={styles.platformCopy}>
                  Six capabilities working together so you can trust every prediction and act on it.
                </p>
              </Reveal>
              <Reveal delay={0.13}>
                <a href="#pipeline" className={styles.platformAction}>
                  Explore all capabilities <ArrowRight className="size-3.5" />
                </a>
              </Reveal>
            </div>
            <CapabilityStage />
          </div>
        </section>

        <section id="pipeline" className={`${styles.section} ${styles.pipelineStorySection}`}>
          <div className={`${styles.container} ${styles.pipelineStory}`}>
            <div className={styles.pipelineIntro}>
              <Reveal><p className={styles.kicker}>Pipeline</p></Reveal>
              <h2 className={styles.pipelineTitle}>
                <RevealLines lines={["From raw data", "to served", "prediction."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={styles.pipelineCopy}>
                  A deliberate, inspectable sequence. Nothing retrains at request time.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <a href="#validation" className={styles.pipelineLink}>See pipeline details <ArrowRight className="size-3.5" /></a>
              </Reveal>
              <div className={styles.pipelineBenchPhoto}>
                <EditorialImage src="/marketing/lab.jpg" caption="Food science laboratory work" className="h-full w-full" imageClassName="object-cover" />
              </div>
            </div>

            <div className={styles.pipelineCanvas}>
              <div className={styles.pipelinePortrait}>
                <EditorialImage src="/marketing/lab.jpg" caption="Research laboratory" className="h-full w-full" imageClassName="object-cover" />
              </div>
              <div className={styles.pipelineTexture}>
                <EditorialImage src="/marketing/cheeses.jpg" caption="Cheese texture" className="h-full w-full" imageClassName="object-cover" />
              </div>
              <svg aria-hidden viewBox="0 0 860 150" preserveAspectRatio="none" className={styles.pipelineCurve}>
                <path d="M15 96 C120 124 150 54 244 80 S368 116 452 62 S605 48 690 78 S790 88 845 52" />
              </svg>

              <div className={styles.pipelineStepsLiving}>
                {PIPELINE.map((item, index) => (
                  <Reveal key={item.step} delay={index * 0.04} y={8}>
                    <article className={styles.pipelineLivingStep}>
                      <span className={styles.pipelineStepBadge}>{item.step}</span>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                      <PipelineMini index={index} />
                    </article>
                  </Reveal>
                ))}
              </div>

              <div className={styles.pipelineAxis}>
                <span>Raw data</span><i /><b>› › ›</b><i /><span>Served prediction</span>
              </div>
            </div>
          </div>

          <div className={`${styles.container} ${styles.explainability}`}>
            <div className={styles.petriStage}>
              <div className={`${styles.petriBlob} ${styles.petriBlobOne}`} />
              <div className={`${styles.petriBlob} ${styles.petriBlobTwo}`} />
              <div className={styles.petriDisc}>
                <EditorialImage src="/marketing/microbes.jpg" caption="Microbial growth on an agar plate" className="h-full w-full" />
              </div>
            </div>

            <div className={styles.explainCopy}>
              <Reveal><p className={styles.kicker}>Explainability</p></Reveal>
              <h2 className={styles.sectionTitle}><RevealLines lines={["A number is", "not an answer."]} /></h2>
              <Reveal delay={0.08}>
                <p className={styles.sectionCopy}>
                  Every prediction decomposes into the factors that drove it.
                  Explainability stays visible beside the prediction instead of being buried in a technical page.
                </p>
              </Reveal>
              <Reveal delay={0.13}>
                <ul className={styles.explainList}>
                  {["Global feature importance", "Local attribution", "EBM shape functions"].map((item) => (
                    <li key={item}><Check className="size-3.5" strokeWidth={1.8} />{item}</li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={0.12} y={12}>
              <TiltCard className={styles.chartCard}><ExplainPreview height={230} /></TiltCard>
            </Reveal>
            <MoleculeArt />
          </div>
        </section>

        <section id="research" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.researchGrid}>
              <div>
                <Reveal><p className={styles.kicker}>Research</p></Reveal>
                <h2 className={styles.sectionTitle}><RevealLines lines={["Built inside a", "food-science", "programme."]} /></h2>
                <Reveal delay={0.08}>
                  <p className={styles.sectionCopy}>
                    Preservation research, cheese matrices and controlled storage translated into an inspectable modelling workflow.
                  </p>
                </Reveal>
                <Reveal delay={0.12}>
                  <a href="#validation" className={styles.researchButton}>Explore our research <ArrowRight className="size-3.5" /></a>
                </Reveal>
              </div>

              <div className={styles.gallery}>
                {RESEARCH_IMAGES.map((item, index) => (
                  <Reveal key={item.src} delay={index * 0.05} y={10}>
                    <figure className={styles.galleryItem}>
                      <EditorialImage src={item.src} caption={item.label} className="h-full w-full" />
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
                      <EditorialImage src={person.photo} caption={person.name} className="h-full w-full" imageClassName="object-cover object-top" />
                    </div>
                    <div>
                      <p className={styles.personRole}>{person.role}</p>
                      <h3 className={styles.personName}>{person.name}, {person.credential}</h3>
                      <p className={styles.personAffiliation}>{person.affiliation}</p>
                      <p className={styles.personBio}>{person.bio}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="validation" className={styles.validationStorySection}>
          <div className={styles.validationLeft}>
            <div className={styles.validationLeftInner}>
              <Reveal><p className={styles.kicker}>Validation</p></Reveal>
              <h2 className={styles.validationStoryTitle}><RevealLines lines={["Designed to show", "where it fails."]} /></h2>
              <Reveal delay={0.08}>
                <p className={styles.validationStoryBody}>
                  We evaluate where the model performs well—and where it needs more data. Error is surfaced by cheese category.
                </p>
              </Reveal>

              <div className={styles.validationDataRow}>
                <Reveal y={10} className="w-full">
                  <div className={styles.validationChartCard}><CategoryErrorPreview height={190} /></div>
                </Reveal>
                <Reveal delay={0.08} y={8}>
                  <aside className={styles.validationStatus}>
                    <span className={styles.validationPulse}>↗</span>
                    <strong>Current status</strong>
                    <p>External literature validation: 21 published cases.</p>
                    <i />
                    <p>Stronger agreement for soft cheeses; <b>substantial error for hard cheeses.</b></p>
                  </aside>
                </Reveal>
              </div>
            </div>
            <div className={styles.validationCrumbs} aria-hidden>
              <EditorialImage src="/marketing/cheeses.jpg" caption="Cheese detail" className="h-full w-full" imageClassName="object-cover" />
            </div>
          </div>

          <div className={styles.workspaceCtaLiving}>
            <div className={styles.workspaceCtaOverlay} />
            <div className={styles.workspaceCtaContent}>
              <p className={styles.workspaceKicker}>Your workspace</p>
              <h2>Start modelling in your own workspace.</h2>
              <p>Run predictions, compare treatments, classify efficacy and inspect trained models—on your terms.</p>
              <div className={styles.workspaceActionsLiving}>
                <Link href="/signup" className={styles.workspacePrimaryLiving}>Create an account <ArrowRight className="size-3.5" /></Link>
                <Link href="/login" className={styles.workspaceSecondaryLiving}>Log in</Link>
              </div>
              <span className={styles.workspaceSecurity}><Lock className="size-3.5" /> Account-protected workspace</span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
