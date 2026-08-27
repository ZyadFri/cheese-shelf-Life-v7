"use client";

import type { CSSProperties } from "react";
import {
  FlaskConical,
  Layers,
  ListOrdered,
  Lock,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { EditorialImage } from "@/components/marketing/editorial-image";
import { Reveal } from "@/components/marketing/reveal";
import styles from "@/app/landing.module.css";

const CAPABILITIES = [
  {
    title: "Predict from formulation",
    body: "Matrix chemistry, storage, packaging and context routed to the right specialist.",
    detail:
      "A prediction begins with the complete product context rather than the cheese name alone. Composition, physical form, storage, packaging and endpoint information are assembled before the request is routed to the appropriate specialist prediction path.",
    image: "/marketing/lab.jpg",
    imageAlt: "Food-science laboratory workspace",
    eyebrow: "Configured prediction",
    icon: FlaskConical,
  },
  {
    title: "Compare against a control",
    body: "Evaluate candidate treatments beside an untreated reference formulation.",
    detail:
      "Treatment scenarios are interpreted beside a matched baseline so the interface can show what changes when a preservation strategy is introduced. The comparison stays tied to the same formulation and environmental context.",
    image: "/marketing/cheeses.jpg",
    imageAlt: "Assorted cheese samples used for comparison",
    eyebrow: "Matched comparison",
    icon: Layers,
  },
  {
    title: "Classify efficacy",
    body: "Low, Medium and High shelf-life-improvement patterns with explanation.",
    detail:
      "Classification answers a different research question from prediction. Instead of estimating a shelf-life value, it places a complete formulation into an efficacy tier learned from patterns across the training data, using the full formulation rather than an ingredient in isolation.",
    image: "/marketing/microbes.jpg",
    imageAlt: "Microbial growth used in food-science analysis",
    eyebrow: "Formulation classification",
    icon: ShieldCheck,
  },
  {
    title: "Rank ingredients",
    body: "Context-adjusted ingredient effects with data-support visibility.",
    detail:
      "Ingredient efficacy is analyzed across the conditions in which each ingredient was tested. The ranking is designed to separate an ingredient's adjusted association from the context around it, while keeping the available evidence visible to the researcher.",
    image: "/marketing/cheese-aging.jpg",
    imageAlt: "Cheese aging environment",
    eyebrow: "Ingredient intelligence",
    icon: ListOrdered,
  },
  {
    title: "Explain any prediction",
    body: "Inspect which features push a result up or down instead of seeing only the final value.",
    detail:
      "Explainability connects a prediction back to its drivers. Global views describe recurring model behavior, while local explanations show how the specific formulation and storage context contributed to an individual result.",
    image: "/marketing/lab.jpg",
    imageAlt: "Research laboratory analysis",
    eyebrow: "Prediction explanation",
    icon: MessageCircle,
  },
  {
    title: "Leakage-safe by design",
    body: "Grouped context splitting keeps related formulations together across data partitions.",
    detail:
      "The modeling workflow is designed to avoid giving a model an unrealistically easy test. Rows that belong to the same experimental or formulation context are kept together when the data are partitioned, and provenance fields are excluded from model features.",
    image: "/marketing/campus.jpg",
    imageAlt: "McGill Macdonald Campus research environment",
    eyebrow: "Research integrity",
    icon: Lock,
  },
] as const;

export function CapabilityStage() {
  return (
    <div className={styles.capabilityStage}>
      <style>{`
        @keyframes capabilityWordReveal {
          0% { opacity: 0; transform: translateY(7px); filter: blur(2px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .capability-hover-word { opacity: 0; display: inline-block; margin-right: .23em; }
        .capability-hover-group:hover .capability-hover-word,
        .capability-hover-group:focus-within .capability-hover-word {
          animation: capabilityWordReveal .42s cubic-bezier(.16,1,.3,1) both;
        }

        /* Pipeline refinement — staggered connected research cards. */
        main #pipeline {
          overflow: hidden !important;
          background:
            radial-gradient(circle at 88% 12%, rgba(157, 31, 62, .075), transparent 28rem),
            radial-gradient(circle at 3% 88%, rgba(233, 191, 203, .22), transparent 24rem),
            linear-gradient(180deg, #fff 0%, #fffafb 48%, #fff 100%) !important;
        }
        main #pipeline::before {
          content: "";
          position: absolute;
          right: -7rem;
          top: 4rem;
          width: 26rem;
          height: 26rem;
          pointer-events: none;
          background-image: radial-gradient(circle, rgba(162, 37, 69, .12) 0 1px, transparent 1.5px);
          background-size: 10px 10px;
          opacity: .32;
          -webkit-mask-image: radial-gradient(circle, #000 0 28%, transparent 72%);
          mask-image: radial-gradient(circle, #000 0 28%, transparent 72%);
        }
        main #pipeline > div:first-child {
          width: min(95vw, 1540px) !important;
          max-width: none !important;
        }
        main #pipeline [class*="pipelineStory"] {
          display: block !important;
          padding-bottom: 1rem !important;
        }
        main #pipeline [class*="pipelineIntro"] {
          position: relative !important;
          display: block !important;
          min-height: 0 !important;
          max-width: 48rem !important;
          padding: 0 !important;
        }
        main #pipeline [class*="pipelineIntro"] > * {
          grid-column: auto !important;
          grid-row: auto !important;
        }
        main #pipeline [class*="pipelineIntro"] h2 {
          max-width: none !important;
          margin-top: 1rem !important;
          font-size: clamp(3.2rem, 5.2vw, 5.25rem) !important;
          line-height: .95 !important;
          letter-spacing: -.055em !important;
        }
        main #pipeline [class*="pipelineIntro"] [class*="pipelineCopy"] {
          max-width: 36rem !important;
          margin-top: 1.2rem !important;
          font-size: clamp(.9rem, 1.15vw, 1.05rem) !important;
          line-height: 1.62 !important;
        }
        main #pipeline [class*="pipelineIntro"] > div:nth-of-type(3) {
          position: static !important;
          margin-top: 1.15rem !important;
        }
        main #pipeline [class*="pipelineBenchPhoto"],
        main #pipeline [class*="pipelineTexture"],
        main #pipeline [class*="pipelineAxis"],
        main #pipeline [class*="pipelineCurve"] {
          display: none !important;
        }
        main #pipeline [class*="pipelineCanvas"] {
          position: relative !important;
          min-height: 43rem !important;
          margin-top: 1.2rem !important;
          padding: 0 !important;
          isolation: isolate;
        }
        main #pipeline [class*="pipelineCanvas"]::before {
          content: "";
          position: absolute;
          z-index: 0;
          left: 3.5%;
          right: 3.5%;
          top: 4.8rem;
          height: 23rem;
          pointer-events: none;
          background-repeat: no-repeat;
          background-size: 100% 100%;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 390' preserveAspectRatio='none'%3E%3Cpath d='M82 150 C170 150 176 270 265 270 S365 72 470 72 S560 268 680 268 S785 72 905 72 S1010 124 1124 62' fill='none' stroke='%239b1c3c' stroke-width='2.2' stroke-linecap='round' stroke-dasharray='6 6'/%3E%3Ccircle cx='176' cy='220' r='7' fill='white' stroke='%239b1c3c' stroke-width='3'/%3E%3Ccircle cx='366' cy='144' r='7' fill='white' stroke='%239b1c3c' stroke-width='3'/%3E%3Ccircle cx='565' cy='205' r='7' fill='white' stroke='%239b1c3c' stroke-width='3'/%3E%3Ccircle cx='790' cy='150' r='7' fill='white' stroke='%239b1c3c' stroke-width='3'/%3E%3C/svg%3E");
          opacity: .92;
        }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) {
          position: relative !important;
          z-index: 2 !important;
          display: grid !important;
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          gap: clamp(1rem, 1.7vw, 1.8rem) !important;
          align-items: start !important;
          padding: 0 !important;
          overflow: visible !important;
        }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div {
          position: relative !important;
          min-width: 0 !important;
          transition: transform .35s cubic-bezier(.2,.8,.2,1) !important;
        }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(1) { margin-top: 7rem !important; }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(2) { margin-top: 16rem !important; }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(3) { margin-top: 2rem !important; }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(4) { margin-top: 15.2rem !important; }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(5) { margin-top: .2rem !important; }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:not(:last-child)::after {
          display: none !important;
        }
        main #pipeline [class*="pipelineCanvas"] article {
          position: relative !important;
          display: flex !important;
          min-height: 30rem !important;
          height: auto !important;
          flex-direction: column !important;
          padding: 0 !important;
          overflow: hidden !important;
          border: 1px solid rgba(226, 204, 211, .92) !important;
          border-radius: 24px !important;
          background: linear-gradient(180deg, rgba(255,255,255,.99), rgba(255,247,250,.98)) !important;
          box-shadow: 0 26px 70px -48px rgba(76, 27, 43, .45) !important;
          transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease, border-color .35s ease !important;
        }
        main #pipeline [class*="pipelineCanvas"] article:hover {
          transform: translateY(-9px) !important;
          border-color: rgba(168, 46, 78, .56) !important;
          box-shadow: 0 34px 82px -42px rgba(100, 29, 52, .52) !important;
        }
        main #pipeline [class*="pipelineStepBadge"] {
          position: absolute !important;
          z-index: 6 !important;
          top: 1rem !important;
          left: 1rem !important;
          display: grid !important;
          place-items: center !important;
          width: 3.2rem !important;
          height: 3.2rem !important;
          margin: 0 !important;
          border: 2px solid rgba(255,255,255,.92) !important;
          border-radius: 999px !important;
          background: linear-gradient(145deg, #b2264d, #83172f) !important;
          color: white !important;
          box-shadow: 0 12px 30px -12px rgba(104, 18, 43, .62) !important;
          font-size: 1rem !important;
          font-weight: 780 !important;
          line-height: 1 !important;
        }
        main #pipeline [class*="pipelineCanvas"] article > div {
          position: relative !important;
          display: block !important;
          width: 100% !important;
          height: 15rem !important;
          min-height: 15rem !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          border: 0 !important;
          border-radius: 0 !important;
          background-position: center !important;
          background-size: cover !important;
          background-repeat: no-repeat !important;
          transition: background-size .5s ease !important;
        }
        main #pipeline [class*="pipelineCanvas"] article > div::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(45,12,23,.02), rgba(45,12,23,.14));
        }
        main #pipeline [class*="pipelineCanvas"] article > div > * {
          display: none !important;
        }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(1) article > div {
          background-image: url('https://images.unsplash.com/photo-1748263831502-23d923a5c66a?auto=format&fit=crop&w=1200&q=82') !important;
          background-position: center 54% !important;
        }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(2) article > div {
          background-image: url('https://images.unsplash.com/photo-1631557677599-ee5fe0b3440b?auto=format&fit=crop&w=1200&q=82') !important;
          background-position: center !important;
        }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(3) article > div {
          background-image: url('https://images.unsplash.com/photo-1763568258367-1c52beb60be7?auto=format&fit=crop&w=1200&q=82') !important;
          background-position: center 48% !important;
        }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(4) article > div {
          background-image: url('https://images.unsplash.com/photo-1775519520461-6b6e068d9250?auto=format&fit=crop&w=1200&q=82') !important;
          background-position: center !important;
        }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(5) article > div {
          background-image: url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=82') !important;
          background-position: center !important;
        }
        main #pipeline [class*="pipelineCanvas"] article h3 {
          position: relative !important;
          margin: 1.35rem 1.25rem 0 !important;
          padding-bottom: .95rem !important;
          color: #272326 !important;
          font-family: var(--font-display) !important;
          font-size: clamp(1.25rem, 1.65vw, 1.65rem) !important;
          font-weight: 540 !important;
          line-height: 1.04 !important;
          letter-spacing: -.035em !important;
        }
        main #pipeline [class*="pipelineCanvas"] article h3::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: .3rem;
          width: 2rem;
          border-top: 2px solid #a51f42;
        }
        main #pipeline [class*="pipelineCanvas"] article p {
          min-height: 0 !important;
          margin: .3rem 1.25rem 1.45rem !important;
          color: #68666c !important;
          font-size: clamp(.72rem, .84vw, .82rem) !important;
          line-height: 1.58 !important;
        }
        main #pipeline [class*="pipelineLink"] {
          display: inline-flex !important;
          margin-top: 1.25rem !important;
          font-size: .72rem !important;
        }
        @media (max-width: 1180px) {
          main #pipeline [class*="pipelineCanvas"] {
            min-height: 35rem !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            padding-bottom: 1rem !important;
          }
          main #pipeline [class*="pipelineCanvas"]::before { display: none !important; }
          main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) {
            width: max-content !important;
            grid-template-columns: repeat(5, 17rem) !important;
            gap: 1rem !important;
            padding-right: 1rem !important;
          }
          main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(n) {
            margin-top: 0 !important;
          }
          main #pipeline [class*="pipelineCanvas"] article {
            min-height: 27rem !important;
          }
        }
        @media (max-width: 720px) {
          main #pipeline > div:first-child { width: calc(100% - 28px) !important; }
          main #pipeline [class*="pipelineIntro"] h2 {
            font-size: clamp(2.6rem, 12vw, 3.5rem) !important;
          }
          main #pipeline [class*="pipelineCanvas"] {
            min-height: 0 !important;
            overflow: visible !important;
          }
          main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) {
            width: 100% !important;
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          main #pipeline [class*="pipelineCanvas"] article {
            min-height: 0 !important;
          }
          main #pipeline [class*="pipelineCanvas"] article > div {
            height: 13.5rem !important;
            min-height: 13.5rem !important;
          }
        }
      `}</style>

      <div className={styles.capabilityPhoto}>
        <EditorialImage
          src="/marketing/cheese-aging.jpg"
          caption="Cheese research and aging environment"
          className="h-full w-full"
          imageClassName="object-cover"
        />
        <div className={styles.capabilityPhotoWash} />
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
        const isLeft = index < 3;
        const detailPosition = isLeft
          ? "left-[calc(100%+0.7rem)] origin-left"
          : "right-[calc(100%+0.7rem)] origin-right";

        return (
          <Reveal
            key={item.title}
            delay={index * 0.035}
            y={10}
            className={`${styles.capabilityCard} ${styles[`capability${index + 1}`]}`}
          >
            <article
              tabIndex={0}
              className={`${styles.capabilityCardInner} capability-hover-group group relative outline-none`}
            >
              <div className={styles.capabilityCardTop}>
                <span className={styles.capabilityIcon}><Icon className="size-4" strokeWidth={1.7} /></span>
                <span className={styles.capabilityNumber}>{index + 1}</span>
                <h3>{item.title}</h3>
              </div>
              <p>{item.body}</p>
              <CapabilityMini index={index} />
              <span className="mt-2 block text-[0.43rem] font-semibold uppercase tracking-[0.08em] text-[#a15a70] opacity-70 transition-opacity group-hover:opacity-100">
                Hover to explore
              </span>

              <aside
                className={`pointer-events-none absolute top-1/2 z-30 w-[17.5rem] -translate-y-1/2 scale-[0.965] overflow-hidden rounded-[16px] border border-white/80 bg-white/96 opacity-0 shadow-[0_28px_62px_-28px_rgba(66,27,41,.48)] backdrop-blur-xl transition-all duration-300 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:scale-100 group-focus-within:opacity-100 ${detailPosition}`}
              >
                <div className="relative h-[86px] overflow-hidden bg-[#f4e8eb]">
                  <img src={item.image} alt={item.imageAlt} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(54,20,31,.02),rgba(54,20,31,.35))]" />
                  <span className="absolute bottom-2.5 left-3 rounded-full border border-white/60 bg-white/88 px-2.5 py-1 text-[0.46rem] font-bold uppercase tracking-[0.09em] text-[#8f2947] backdrop-blur-md">
                    {item.eyebrow}
                  </span>
                </div>
                <div className="p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#f8e8ed] text-[#9a2143]">
                      <Icon className="size-3.5" strokeWidth={1.7} />
                    </span>
                    <strong className="text-[0.68rem] font-semibold tracking-[-0.015em] text-[#3a2f33]">{item.title}</strong>
                  </div>
                  <p className="mt-2.5 text-[0.55rem] leading-[1.62] text-[#70646a]">
                    {item.detail.split(" ").map((word, wordIndex) => (
                      <span
                        key={`${word}-${wordIndex}`}
                        className="capability-hover-word"
                        style={{ animationDelay: `${wordIndex * 38}ms` }}
                      >
                        {word}
                      </span>
                    ))}
                  </p>
                </div>
              </aside>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

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
        <span>Treatment</span><i className={styles.compareBarStrong} /><b />
        <span>Control</span><i className={styles.compareBarQuiet} /><b />
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
        <span>Context</span><i style={{ "--w": "86%" } as CSSProperties} /><b />
        <span>Evidence</span><i style={{ "--w": "61%" } as CSSProperties} /><b />
        <span>Effect</span><i style={{ "--w": "39%" } as CSSProperties} /><b />
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
