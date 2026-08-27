"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { usePredictionV6, type FlowStep } from "@/components/prediction-v6-store";
import { CheeseSearchStep } from "@/components/prediction-v6/cheese-search-step";
import { PhysicalFormStep } from "@/components/prediction-v6/physical-form-step";
import { ProfileConfirmationStep } from "@/components/prediction-v6/profile-confirmation-step";
import { PredictionConditionsStep } from "@/components/prediction-v6/prediction-conditions-step";
import { PredictionV6Result } from "@/components/prediction-v6/prediction-v6-result";
import type { CheeseCatalog } from "@/lib/api";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS: { key: FlowStep; label: string }[] = [
  { key: "cheese", label: "Select cheese" },
  { key: "form", label: "Presentation" },
  { key: "profile", label: "Review profile" },
  { key: "conditions", label: "Configure model" },
  { key: "results", label: "Complete" },
];

function ProgressIndicator({ current }: { current: FlowStep }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <div className="relative z-20 mx-auto flex w-full max-w-[760px] items-start justify-center px-3 pt-7 sm:pt-8">
      {STEPS.map((step, index) => {
        const complete = index < currentIndex;
        const active = index === currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="flex min-w-[72px] flex-col items-center text-center sm:min-w-[104px]">
              <motion.span
                initial={false}
                animate={{
                  scale: active ? 1.05 : 1,
                  backgroundColor: complete || active ? "#8f193a" : "#ffffff",
                  borderColor: complete || active ? "#8f193a" : "#e6dce0",
                }}
                transition={{ duration: 0.28, ease: EASE }}
                className="flex size-8 items-center justify-center rounded-full border text-[0.68rem] font-semibold shadow-[0_5px_16px_-10px_rgba(83,26,45,.48)]"
              >
                {complete ? <Check className="size-3.5 text-white" strokeWidth={2.2} /> : (
                  <span className={active ? "text-white" : "text-[#8f7d84]"}>{index + 1}</span>
                )}
              </motion.span>
              <span className={`mt-2 hidden text-[0.52rem] font-medium sm:block ${active ? "text-[#7f1735]" : complete ? "text-[#6f5c64]" : "text-[#a8959c]"}`}>
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div className="relative mt-[15px] h-px flex-1 max-w-[72px] bg-[#eadfe3] sm:max-w-[104px]">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#9a2344]"
                  initial={false}
                  animate={{ width: index < currentIndex ? "100%" : "0%" }}
                  transition={{ duration: 0.32, ease: EASE }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const stepVariants = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
};

export function PredictionV6Flow({ catalog }: { catalog: CheeseCatalog }) {
  const { state } = usePredictionV6();
  const reduce = useReducedMotion();

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <PredictionBackdrop />
      <ProgressIndicator current={state.step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={reduce ? false : stepVariants.initial}
          animate={stepVariants.animate}
          exit={reduce ? undefined : stepVariants.exit}
          transition={{ duration: 0.3, ease: EASE }}
          className="relative z-10"
        >
          {state.step === "cheese" && <CheeseSearchStep catalog={catalog} />}
          {state.step === "form" && <PhysicalFormStep />}
          {state.step === "profile" && <ProfileConfirmationStep />}
          {state.step === "conditions" && <PredictionConditionsStep />}
          {state.step === "results" && <PredictionV6Result />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PredictionBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-44 top-28 size-[420px] rounded-full bg-[#fff0f4] blur-3xl" />
      <div className="absolute right-[-120px] top-0 size-[360px] rounded-full bg-[#fff7f0] blur-3xl" />
      <div className="absolute bottom-[-140px] left-[12%] size-[420px] rounded-full bg-[#fff6f7] blur-3xl" />
      <svg className="absolute right-[-44px] top-10 h-[270px] w-[360px] opacity-[.17]" viewBox="0 0 360 270" fill="none">
        <g stroke="#b74463" strokeWidth="1.2">
          <circle cx="246" cy="70" r="9" /><circle cx="302" cy="100" r="7" /><circle cx="278" cy="160" r="10" /><circle cx="205" cy="130" r="8" /><circle cx="222" cy="205" r="6" />
          <path d="M254 75 296 96M241 79 209 124M211 137 274 158M277 170 226 201M302 107 283 151" />
        </g>
      </svg>
      <svg className="absolute -bottom-10 left-[-42px] h-[280px] w-[330px] opacity-[.11]" viewBox="0 0 330 280" fill="none">
        <path d="M31 205c36-51 52-107 95-133 34-21 98-21 149 6 28 15 42 42 18 73-34 45-73 89-129 105-52 14-106-9-133-51Z" stroke="#b45a70" strokeWidth="1.4" />
        <circle cx="117" cy="142" r="22" stroke="#b45a70"/><circle cx="197" cy="104" r="14" stroke="#b45a70"/><circle cx="217" cy="180" r="18" stroke="#b45a70"/><path d="m92 205 51-87 83 91" stroke="#b45a70" />
      </svg>
    </div>
  );
}
