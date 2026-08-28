import Link from "next/link";
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
  ExplainPreview,
  HeroProductPreview,
} from "@/components/marketing/previews";
import { TiltCard } from "@/components/marketing/landing-interactions";
import { CapabilityStage } from "@/components/marketing/capability-stage";
import styles from "./landing.module.css";

const SECTION_BADGE =
  "inline-flex items-center rounded-full border border-[#e8c6d0]/80 bg-[linear-gradient(110deg,rgba(255,255,255,.96),rgba(248,224,231,.92),rgba(255,255,255,.96))] px-3 py-1.5 shadow-[0_12px_30px_-22px_rgba(155,28,60,.65)] backdrop-blur-sm";

const LANDING_REFINEMENT = `
/* Research-team refinement: compact editorial cards, not poster-size portraits. */
main #research [class*="teamHeadingWrap"] {
  width: min(92vw, 1280px) !important;
  min-height: 10rem !important;
  margin-top: 4.2rem !important;
  padding: 2rem 2.4rem !important;
  border-radius: 24px !important;
  background:
    linear-gradient(90deg, rgba(255,252,253,.99) 0%, rgba(255,249,251,.97) 58%, rgba(255,252,253,.72) 78%, rgba(255,255,255,.28) 100%),
    url('/marketing/cheeses.jpg') right 40% / 34% auto no-repeat !important;
  box-shadow: 0 24px 60px -50px rgba(91,29,47,.30) !important;
}
main #research [class*="teamHeadingWrap"]::before {
  width: 20rem !important;
  height: 20rem !important;
  right: 22% !important;
  top: -48% !important;
  opacity: .48 !important;
}
main #research [class*="teamHeadingWrap"]::after {
  max-width: 42rem !important;
  margin-top: .72rem !important;
  font-size: .82rem !important;
  line-height: 1.5 !important;
}
main #research [class*="teamHeadingWrap"] h3 {
  max-width: none !important;
  margin-top: .65rem !important;
  font-size: clamp(2.35rem, 4.2vw, 4rem) !important;
  line-height: .98 !important;
}
main #research [class*="teamGrid"] {
  width: min(92vw, 1280px) !important;
  gap: 1rem !important;
  margin-top: 1rem !important;
  align-items: stretch !important;
}
main #research [class*="personCard"] {
  display: grid !important;
  grid-template-rows: 14.5rem auto !important;
  min-height: 0 !important;
  height: 100% !important;
  padding: 0 !important;
  overflow: hidden !important;
  border-radius: 20px !important;
  background: rgba(255,255,255,.96) !important;
  box-shadow: 0 20px 48px -38px rgba(64,25,38,.34) !important;
  transform: none !important;
}
main #research [class*="personCard"]::before,
main #research [class*="personCard"]::after {
  display: none !important;
}
main #research [class*="personCard"]:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 26px 54px -34px rgba(84,29,47,.42) !important;
}
main #research [class*="personPhoto"] {
  position: relative !important;
  inset: auto !important;
  z-index: 1 !important;
  width: 100% !important;
  height: 14.5rem !important;
  overflow: hidden !important;
  border-radius: 0 !important;
  background: #f4edef !important;
}
main #research [class*="personPhoto"]::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 34%;
  background: linear-gradient(180deg, transparent, rgba(52,21,31,.10));
  pointer-events: none;
}
main #research [class*="personPhoto"] img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center 18% !important;
  transform: scale(1.01) !important;
  filter: saturate(.94) contrast(1.015) !important;
}
main #research [class*="personCard"]:hover [class*="personPhoto"] img {
  transform: scale(1.035) !important;
}
main #research [class*="personCard"] > div:last-child {
  position: relative !important;
  inset: auto !important;
  z-index: 2 !important;
  display: flex !important;
  min-height: 12rem !important;
  flex-direction: column !important;
  padding: 1rem 1.1rem 1.12rem !important;
  border: 0 !important;
  border-top: 1px solid rgba(231,218,222,.86) !important;
  border-radius: 0 !important;
  background: linear-gradient(180deg, rgba(255,255,255,.99), rgba(255,249,251,.96)) !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  transform: none !important;
}
main #research [class*="personCard"]:hover > div:last-child {
  transform: none !important;
  background: linear-gradient(180deg, #fff, #fff7fa) !important;
}
main #research [class*="personRole"] {
  align-self: flex-start !important;
  padding: .35rem .58rem !important;
  font-size: .52rem !important;
  letter-spacing: .075em !important;
  background: #fff8fa !important;
}
main #research [class*="personName"] {
  margin-top: .58rem !important;
  font-size: clamp(1.45rem, 2vw, 1.9rem) !important;
  line-height: 1 !important;
}
main #research [class*="personAffiliation"] {
  margin-top: .42rem !important;
  font-size: .66rem !important;
}
main #research [class*="personBio"] {
  margin-top: .55rem !important;
  font-size: .68rem !important;
  line-height: 1.52 !important;
}
main #research [class*="teamGrid"] > div:nth-child(1) [class*="personCard"] {
  border-color: rgba(190,70,99,.52) !important;
  box-shadow: inset 0 3px 0 rgba(174,40,73,.74), 0 20px 48px -38px rgba(64,25,38,.34) !important;
}
main #research [class*="teamGrid"] > div:nth-child(2) [class*="personCard"] {
  border-color: rgba(221,178,159,.68) !important;
  box-shadow: inset 0 3px 0 rgba(205,143,112,.64), 0 20px 48px -38px rgba(64,25,38,.30) !important;
}
main #research [class*="teamGrid"] > div:nth-child(3) [class*="personCard"] {
  border-color: rgba(164,128,177,.58) !important;
  box-shadow: inset 0 3px 0 rgba(126,80,145,.58), 0 20px 48px -38px rgba(64,25,38,.30) !important;
}
@media (max-width: 1080px) {
  main #research [class*="teamGrid"] {
    grid-template-columns: repeat(3, minmax(17rem, 1fr)) !important;
  }
}
@media (max-width: 700px) {
  main #research [class*="teamHeadingWrap"],
  main #research [class*="teamGrid"] {
    width: calc(100vw - 1.4rem) !important;
  }
  main #research [class*="teamHeadingWrap"] {
    min-height: 12rem !important;
    padding: 1.55rem 1.2rem !important;
  }
  main #research [class*="teamGrid"] {
    grid-template-columns: 1fr !important;
  }
  main #research [class*="personCard"] {
    grid-template-rows: 13rem auto !important;
  }
  main #research [class*="personPhoto"] {
    height: 13rem !important;
  }
}
`;

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
    title: "Prepare the data",
    body: "Organize the cheese, storage, packaging and indicator information used by the models.",
  },
  {
    step: "02",
    title: "Split by context",
    body: "Keep related control and treatment samples together when the data is split.",
  },
  {
    step: "03",
    title: "Select the model",
    body: "Choose the appropriate model from the cheese category and prediction endpoint.",
  },
  {
    step: "04",
    title: "Train the models",
    body: "Train the supported model families on the prepared training data.",
  },
  {
    step: "05",
    title: "Validate and predict",
    body: "Check performance on held-out data, then use the saved model for predictions.",
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
    return (
      <figure className="w-full overflow-hidden rounded-[14px] border border-[#ead8de] bg-white shadow-[0_14px_30px_-24px_rgba(87,31,46,.42)]">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Sterilization_effects_of_negative_air_ionization.jpg"
          alt="Untreated and treated laboratory Petri-dish samples shown side by side"
          loading="lazy"
          className="h-[92px] w-full object-cover object-center"
        />
        <figcaption className="border-t border-[#f0e3e7] bg-[#fffafb] px-2.5 py-2 text-[0.45rem] leading-[1.35] text-[#806f75]">
          Control and treatment samples remain grouped together.
        </figcaption>
      </figure>
    );
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
      <div className="grid w-full grid-cols-2 gap-2" aria-label="Supported model families">
        {["LightGBM", "XGBoost", "Random Forest", "EBM"].map((name) => (
          <span
            key={name}
            className="rounded-full border border-[#eadde1] bg-white/88 px-2 py-1.5 text-center text-[0.43rem] font-medium text-[#696166] shadow-[0_8px_20px_-18px_rgba(68,29,40,.35)]"
          >
            {name}
          </span>
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
      <style>{LANDING_REFINEMENT}</style>

      <main className={styles.page}>
        <section className={`${styles.hero} !pt-[3.2rem]`}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <Reveal immediate>
                <p className={`${styles.eyebrow} ${SECTION_BADGE}`}>Cheese shelf-life modelling</p>
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
              <Reveal><p className={`${styles.kicker} ${SECTION_BADGE}`}>Complete by design</p></Reveal>
              <h2 className={styles.platformTitle}>
                <RevealLines lines={["Everything the", "workflow actually", "needs."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={styles.platformCopy}>
                  Six capabilities working together so you can review each stage of the shelf-life workflow in one place.
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
              <Reveal><p className={`${styles.kicker} ${SECTION_BADGE}`}>Pipeline</p></Reveal>
              <h2 className={styles.pipelineTitle}>
                <RevealLines lines={["From data", "to prediction."]} />
              </h2>
              <Reveal delay={0.08}>
                <p className={styles.pipelineCopy}>
                  See how the input data moves through each stage of the modelling pipeline before producing a shelf-life estimate.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <a href="#validation" className={styles.pipelineLink}>See pipeline details <ArrowRight className="size-3.5" /></a>
              </Reveal>
            </div>

            <div className={styles.pipelineCanvas}>
              <div className={styles.pipelineSteps}>
                {PIPELINE.map((item, index) => (
                  <Reveal key={item.step} delay={index * 0.04} y={10}>
                    <article className={styles.pipelineStep}>
                      <span className={styles.pipelineStepBadge}>{item.step}</span>
                      <div className="mb-4 flex h-[7.2rem] items-center justify-center">
                        <PipelineMini index={index} />
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </article>
                  </Reveal>
                ))}
              </div>

              <div className={styles.pipelineAxis}>
                <span>Input data</span><i /><b>› › ›</b><i /><span>Shelf-life estimate</span>
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
              <Reveal><p className={`${styles.kicker} ${SECTION_BADGE}`}>Explainability</p></Reveal>
              <h2 className={styles.sectionTitle}><RevealLines lines={["Understand what", "shaped the result."]} /></h2>
              <Reveal delay={0.08}>
                <p className={styles.sectionCopy}>
                  Review the features that influenced a prediction and how strongly each one contributed.
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
                <Reveal><p className={`${styles.kicker} ${SECTION_BADGE}`}>Research</p></Reveal>
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
              <p className={`${styles.kicker} ${SECTION_BADGE}`}>Research team</p>
              <h3>Project collaborators</h3>
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
              <Reveal><p className={`${styles.kicker} ${SECTION_BADGE}`}>Validation</p></Reveal>
              <h2 className={styles.validationStoryTitle}><RevealLines lines={["Review before", "using a model."]} /></h2>
              <Reveal delay={0.08}>
                <p className={styles.validationStoryBody}>
                  Models are checked on held-out data and across relevant cheese contexts before saved models are used for prediction.
                </p>
              </Reveal>

              <div className={styles.validationDataRow}>
                <Reveal y={10} className="w-full">
                  <div className="w-full rounded-[22px] border border-[#eadde1] bg-[linear-gradient(145deg,#fff,#fff8fa)] p-5 shadow-[0_20px_48px_-38px_rgba(74,25,40,.38)]">
                    <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#9f2847]">Validation checks</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        ["01", "Held-out data", "Check the model on data that was not used for training."],
                        ["02", "Context review", "Review behavior across the cheese and endpoint contexts it supports."],
                        ["03", "Saved model", "Use the validated saved artifact for prediction without retraining."],
                      ].map(([step, title, body]) => (
                        <div key={step} className="rounded-[16px] border border-[#eee3e6] bg-white/88 p-3.5">
                          <span className="text-[0.62rem] font-bold text-[#a51f42]">{step}</span>
                          <strong className="mt-2 block text-[0.78rem] font-semibold text-[#28272a]">{title}</strong>
                          <p className="mt-1.5 text-[0.66rem] leading-[1.5] text-[#747177]">{body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={0.08} y={8}>
                  <aside className={styles.validationStatus}>
                    <span className={styles.validationPulse}>✓</span>
                    <strong>Validation approach</strong>
                    <p>Review models before they are used for predictions.</p>
                    <i />
                    <p>No error scores are surfaced on the landing page.</p>
                  </aside>
                </Reveal>
              </div>
            </div>
            <div className={styles.validationCrumbs} aria-hidden>
              <EditorialImage src="/marketing/cheese-cave.jpg" caption="Cheese maturation environment" className="h-full w-full" imageClassName="object-cover" />
            </div>
          </div>

          <div className={styles.workspaceCtaLiving}>
            <div className={styles.workspaceCtaOverlay} />
            <div className={styles.workspaceCtaContent}>
              <p className={styles.workspaceKicker}>Your workspace</p>
              <h2>Start modelling in your own workspace.</h2>
              <p>Run predictions, compare treatments, classify efficacy and inspect trained models.</p>
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
