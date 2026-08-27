"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Layers3, ShieldCheck } from "lucide-react";

import { usePredictionV6 } from "@/components/prediction-v6-store";
import { titleCase, IMAGES } from "@/components/prediction-v6/cheese-search-step";
import { Badge } from "@/components/ui/badge";
import type { PhysicalFormOption } from "@/lib/api";

const EASE = [0.16, 1, 0.3, 1] as const;

const CATEGORY_LABEL: Record<string, string> = { soft: "Soft", semi_hard: "Semi-hard", hard: "Hard" };
const CATEGORY_BLURB: Record<string, string> = {
  soft: "Soft cheeses generally have higher moisture and shorter shelf lives, with storage temperature, packaging and presentation playing important roles.",
  semi_hard: "Semi-hard cheeses sit between soft and hard in moisture and typical shelf life, with behavior shaped strongly by ripening and packaging.",
  hard: "Hard cheeses are typically lower-moisture and longer-lived, with physical presentation and ripening playing an outsized role.",
};

const SUPPORT_BADGE_VARIANT: Record<string, "success" | "info" | "warning" | "destructive"> = {
  strong: "success",
  moderate: "info",
  limited: "warning",
  experimental: "destructive",
  unsupported: "destructive",
};

function formLabel(form: string): string {
  return form.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

const FORM_DESCRIPTIONS: Record<string, string> = {
  block: "Whole piece, uncut",
  shredded: "High exposed surface area",
  sliced: "Portioned presentation",
  grated: "Finely divided",
  spread: "Soft, spreadable consistency",
  crumbled: "Broken into small pieces",
  cubed: "Cut into cubes",
  wheel: "Traditional whole wheel",
  whole_wheel: "Whole, unopened wheel",
  wheel_or_block: "Whole or block form",
  wheel_or_wedge: "Whole wheel or cut wedge",
  brined_block: "Stored and sold in brine",
  fresh_ball: "Fresh, ball-shaped portion",
  fresh_mass: "Unshaped fresh curd mass",
  fresh_whole: "Whole fresh piece",
  curd: "Fresh curd form",
  log: "Log-shaped format",
  whole_log_or_wheel: "Whole log or wheel format",
  whole_soft: "Whole soft-ripened piece",
  whole_unspecified_shape: "Whole piece, shape unspecified",
  processed_block_or_slice: "Processed block or pre-sliced",
  ripened_whole: "Whole, fully ripened piece",
};

export function PhysicalFormStep() {
  const { state, dispatch } = usePredictionV6();
  const reduce = useReducedMotion();
  const { baseCheeseName, entry } = state;

  if (!baseCheeseName || !entry) return null;

  const image = IMAGES[baseCheeseName];
  const displayName = titleCase(baseCheeseName);

  return (
    <div className="mx-auto max-w-[920px] pb-24 pt-7 sm:pt-9">
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: EASE }}
        className="overflow-hidden rounded-[28px] border border-[#eadde1] bg-white/88 shadow-[0_30px_75px_-55px_rgba(82,27,44,.48)] backdrop-blur-xl"
      >
        <div className="p-5 sm:p-7 lg:p-9">
          <button
            type="button"
            onClick={() => dispatch({ type: "changeCheese" })}
            className="inline-flex items-center gap-1.5 text-[0.58rem] font-medium text-[#9b7f89] transition-colors hover:text-[#7d1d3b]"
          >
            <ArrowLeft className="size-3.5" /> Change cheese
          </button>

          <div className="mt-7 grid gap-6 lg:grid-cols-[170px_1fr] lg:items-center">
            <div className="mx-auto size-[150px] overflow-hidden rounded-full border-4 border-white bg-[#f8f1f3] shadow-[0_22px_52px_-34px_rgba(75,24,41,.48)] lg:mx-0">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.imageUrl || image.thumbUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[3rem] text-[#d3bdc5]" style={{ fontFamily: "var(--font-display)" }}>{displayName.charAt(0)}</div>
              )}
            </div>

            <div>
              <p className="text-[0.54rem] font-semibold uppercase tracking-[0.16em] text-[#ac7888]">Selected cheese</p>
              <h1 className="mt-1 text-[clamp(2.6rem,5vw,4.45rem)] font-medium leading-none tracking-[-0.05em] text-[#43101d]" style={{ fontFamily: "var(--font-display)" }}>
                {displayName}
              </h1>
              <p className="mt-2 text-[0.84rem] text-[#74656b]">
                We classify {displayName} as a <span className="font-semibold text-[#3c2d33]">{CATEGORY_LABEL[entry.cheeseCategory].toLowerCase()}</span> cheese.
              </p>
              <p className="mt-4 max-w-[66ch] text-[0.76rem] leading-6 text-[#817078]">
                {CATEGORY_BLURB[entry.cheeseCategory]} The backend catalog determines which physical presentations are supported for this cheese.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <ProfileChip label="Cheese" value={displayName} />
                <ProfileChip label="Category" value={CATEGORY_LABEL[entry.cheeseCategory]} />
                <ProfileChip label="Specialist model" value={`${CATEGORY_LABEL[entry.cheeseCategory]} cheese model`} icon={<ShieldCheck className="size-3 text-[#982244]" />} />
              </div>
            </div>
          </div>

          <div className="my-8 h-px bg-[#f0e6e9]" />

          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#fae9ee] text-[#982244]">
                <Layers3 className="size-4" />
              </span>
              <div>
                <h2 className="text-[1.18rem] font-medium tracking-[-0.03em] text-[#3e1825]" style={{ fontFamily: "var(--font-display)" }}>
                  How is your {displayName.toLowerCase()} presented?
                </h2>
                <p className="mt-0.5 text-[0.58rem] text-[#9a858d]">Choose one of the physical forms returned by the backend catalog.</p>
              </div>
            </div>

            <div className={`mt-5 grid gap-3 ${entry.physicalForms.length === 1 ? "max-w-[520px] grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {entry.physicalForms.map((option, index) => (
                <FormCard
                  key={option.physicalForm}
                  option={option}
                  index={index}
                  image={image?.thumbUrl ?? null}
                  onSelect={() => dispatch({ type: "selectPhysicalForm", option })}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function ProfileChip({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#e9dde1] bg-[#fffafb] px-3 py-1.5 shadow-sm">
      {icon}
      <span className="text-[0.48rem] text-[#99858d]">{label}</span>
      <span className="text-[0.5rem] font-semibold text-[#5f4650]">{value}</span>
    </div>
  );
}

function FormCard({
  option,
  index,
  image,
  onSelect,
}: {
  option: PhysicalFormOption;
  index: number;
  image: string | null;
  onSelect: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE, delay: 0.05 * index }}
      whileHover={reduce ? undefined : { y: -3 }}
      onClick={onSelect}
      className="group overflow-hidden rounded-[18px] border border-[#e9dde1] bg-[linear-gradient(145deg,#fff,#fffafb)] text-left shadow-[0_14px_36px_-31px_rgba(78,27,43,.5)] transition-all hover:border-[#d9b5c0] hover:shadow-[0_20px_42px_-28px_rgba(111,31,56,.38)]"
    >
      {image && (
        <div className="h-28 overflow-hidden bg-[#f8f1f3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[0.78rem] font-semibold text-[#3c2f34]">{formLabel(option.physicalForm)}</span>
          <Badge variant={SUPPORT_BADGE_VARIANT[option.support.level] ?? "outline"} size="sm">
            {option.support.label}
          </Badge>
        </div>
        <p className="mt-1.5 text-[0.56rem] leading-4 text-[#948088]">
          {FORM_DESCRIPTIONS[option.physicalForm] ?? "Physical presentation"}
        </p>
        <p className="mt-3 line-clamp-2 text-[0.5rem] leading-4 text-[#aa959c]">{option.support.explanation}</p>
      </div>
    </motion.button>
  );
}
