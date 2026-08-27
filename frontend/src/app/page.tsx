import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Check,
  Lock,
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
import { CapabilityStage } from "@/components/marketing/capability-stage";
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

const RESEARCH_IMAGES = [
  { src: "/marketing/campus.jpg", label: "Macdonald Campus" },
  { src: "/marketing/lab.jpg", label: "Controlled studies" },
  { src: "/marketing/cheese-aging.jpg", label: "Real cheese matrices" },
];

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
                <p className={styles.eyebrow}>Cheese shelf-life modelling</p>
              </Reveal>

              <h1 className={styles.heroTitle}>
                <RevealLines immediate lines={["Cheese Shelf-Life", "Prediction & Analysis"]} />
              </h1>

              <Reveal immediate delay={0.16}>
                <p className={styles.heroLede}>
                  Shelf-Life Studio is a research platform for estimating and interpreting cheese shelf life across different products, formulations, storage conditions, and quality or safety indicators.
                </p>
              </Reveal>

              <Reveal immediate delay={0.19}>
                <p className="mt-4 max-w-[48ch] text-[0.78rem] leading-5 text-[#7b626b]">
                  <strong className="font-semibold text-[#6f263d]">Developed by the Department of Food Science and Agricultural Chemistry.</strong>
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
