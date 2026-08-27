"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, GraduationCap, Route, Sparkles } from "lucide-react";

import { usePredictionV6 } from "@/components/prediction-v6-store";
import { titleCase, IMAGES } from "@/components/prediction-v6/cheese-search-step";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const EASE = [0.16, 1, 0.3, 1] as const;

const CATEGORY_LABEL: Record<string, string> = { soft: "Soft", semi_hard: "Semi-hard", hard: "Hard" };

const FORM_EFFECT_NOTES: Record<string, string> = {
  shredded: "Shredding increases exposed surface area and may influence oxygen exposure, moisture loss and microbial behavior.",
  grated: "Fine division increases exposed surface area, which can accelerate moisture loss and oxidation.",
  sliced: "Slicing increases exposed surface relative to a whole piece, moderately affecting moisture loss.",
  spread: "A spreadable format has a very different moisture and surface profile from a solid block.",
  crumbled: "Crumbling substantially increases surface area and typically shortens practical shelf life.",
  cubed: "Cubing increases exposed surface area relative to a whole block.",
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

export function ProfileConfirmationStep() {
  const { state, dispatch } = usePredictionV6();
  const reduce = useReducedMotion();
  const [loading, setLoading] = React.useState(false);
  const { baseCheeseName, entry, physicalForm, physicalFormOption } = state;

  if (!baseCheeseName || !entry || !physicalForm || !physicalFormOption) return null;

  const displayName = titleCase(baseCheeseName);
  const image = IMAGES[baseCheeseName];
  const effectNote = FORM_EFFECT_NOTES[physicalForm];

  async function handleContinue() {
    if (!entry) return;
    setLoading(true);
    try {
      const [general, safety] = await Promise.all([
        api.schemaV6(entry.cheeseCategory, "general_shelf_life"),
        api.schemaV6(entry.cheeseCategory, "safety_endpoint").catch(() => null),
      ]);
      dispatch({ type: "setSchemas", general, safety });
      dispatch({ type: "goto", step: "conditions" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[860px] pb-24 pt-7 sm:pt-9">
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: EASE }}
        className="overflow-hidden rounded-[28px] border border-[#eadde1] bg-white/90 shadow-[0_30px_75px_-54px_rgba(83,27,44,.48)] backdrop-blur-xl"
      >
        <div className="p-5 sm:p-7 lg:p-9">
          <div className="grid gap-6 sm:grid-cols-[132px_1fr] sm:items-center">
            <div className="mx-auto size-[118px] overflow-hidden rounded-full border-4 border-white bg-[#f7f0f2] shadow-[0_18px_42px_-30px_rgba(78,26,43,.46)] sm:mx-0">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.imageUrl || image.thumbUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[2.5rem] text-[#d2bdc4]" style={{ fontFamily: "var(--font-display)" }}>{displayName.charAt(0)}</div>
              )}
            </div>

            <div>
              <p className="text-[0.53rem] font-semibold uppercase tracking-[0.16em] text-[#ad7788]">Review product profile</p>
              <h1 className="mt-1 text-[clamp(2.35rem,4.8vw,4rem)] font-medium leading-none tracking-[-0.05em] text-[#43101d]" style={{ fontFamily: "var(--font-display)" }}>
                {displayName} <span className="text-[#a1848e]">—</span> {formLabel(physicalForm)}
              </h1>
              <p className="mt-3 max-w-[64ch] text-[0.76rem] leading-6 text-[#7d6d73]">
                We identify this product as a <span className="font-semibold text-[#403137]">{CATEGORY_LABEL[entry.cheeseCategory].toLowerCase()}</span> cheese in <span className="font-semibold text-[#403137]">{formLabel(physicalForm).toLowerCase()}</span> form.
                {effectNote ? ` ${effectNote}` : " Its physical presentation is one of several factors considered by the specialist model."}
              </p>
            </div>
          </div>

          <div className="my-7 h-px bg-[#f0e6e9]" />

          <div className="grid gap-3 sm:grid-cols-3">
            <ProfileTile label="Base cheese" value={displayName} />
            <ProfileTile label="Category" value={CATEGORY_LABEL[entry.cheeseCategory]} />
            <ProfileTile label="Physical form" value={formLabel(physicalForm)} />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ProfileTile label="Prediction route" value={`${CATEGORY_LABEL[entry.cheeseCategory]} specialist`} icon={<Route className="size-4" />} />
            <div className="rounded-[16px] border border-[#e9dde1] bg-[linear-gradient(145deg,#fff,#fffafb)] p-4">
              <div className="flex items-center gap-2 text-[#a77b89]">
                <GraduationCap className="size-4" />
                <span className="text-[0.48rem] font-semibold uppercase tracking-[0.08em]">Training support</span>
              </div>
              <div className="mt-2">
                <Badge variant={SUPPORT_BADGE_VARIANT[physicalFormOption.support.level] ?? "outline"}>{physicalFormOption.support.label}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2.5 rounded-[15px] border border-[#f0e3e7] bg-[#fff8fa] px-4 py-3.5">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-[#a5294b]" />
            <p className="text-[0.58rem] leading-5 text-[#806d74]">{physicalFormOption.support.explanation}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#eee4e7] bg-[#fffbfc] px-5 py-4 sm:px-7 lg:px-9">
          <div className="flex flex-wrap gap-4 text-[0.56rem] font-medium text-[#917b84]">
            <button type="button" onClick={() => dispatch({ type: "changeCheese" })} className="transition-colors hover:text-[#7f1d3d]">Change cheese</button>
            <button type="button" onClick={() => dispatch({ type: "changePresentation" })} className="transition-colors hover:text-[#7f1d3d]">Change presentation</button>
          </div>
          <Button onClick={handleContinue} disabled={loading} className="rounded-[11px] bg-[#8e1738] px-5 hover:bg-[#78132f]">
            {loading ? "Loading…" : "Continue"} <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </motion.section>
    </div>
  );
}

function ProfileTile({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-[#e9dde1] bg-[linear-gradient(145deg,#fff,#fffafb)] p-4 shadow-[0_10px_28px_-28px_rgba(76,26,42,.45)]">
      <div className="flex items-center gap-2 text-[#a87c8a]">
        {icon ?? <CheckCircle2 className="size-4" />}
        <span className="text-[0.47rem] font-semibold uppercase tracking-[0.08em]">{label}</span>
      </div>
      <p className="mt-2 text-[0.83rem] font-semibold tracking-[-0.02em] text-[#3d3035]">{value}</p>
    </div>
  );
}
