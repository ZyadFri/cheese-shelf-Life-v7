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
