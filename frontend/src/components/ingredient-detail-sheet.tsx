"use client";

import { TrendingUp, Minus, TrendingDown } from "lucide-react";

import type { IngredientRanking } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";

const CLASS_BADGE_VARIANT: Record<string, "destructive" | "warning" | "success"> = {
  Low: "destructive",
  Medium: "warning",
  High: "success",
};
const CLASS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Low: TrendingDown,
  Medium: Minus,
  High: TrendingUp,
};

function pct(v: number | null, decimals = 1): string {
  if (v === null) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;
}

/** Plain-language read of whether the adjusted (regression) effect held up
 * on data it never influenced -- compares the same three numbers already
 * saved per ingredient (adjusted_effect_pct vs. validation/test means), no
 * new computation needed. */
function stabilityRead(r: IngredientRanking): { label: string; tone: "success" | "warning" } {
  const refs = [r.validation_mean_pct, r.test_mean_pct].filter((v): v is number => v !== null);
  if (refs.length === 0) return { label: "Not enough held-out data to check", tone: "warning" };
  const sameSign = refs.every((v) => Math.sign(v) === Math.sign(r.adjusted_effect_pct) || Math.abs(r.adjusted_effect_pct) < 1);
  return sameSign
    ? { label: "Consistent with held-out data", tone: "success" }
    : { label: "Direction shifts on held-out data", tone: "warning" };
}

export function IngredientDetailSheet({
  ingredient, open, onOpenChange,
}: {
  ingredient: IngredientRanking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!ingredient) return null;
  const r = ingredient;
  const Icon = CLASS_ICON[r.efficacy_class] ?? Minus;
  const stability = stabilityRead(r);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">#{r.rank}</span>
            <Badge variant={CLASS_BADGE_VARIANT[r.efficacy_class] ?? "secondary"} className="h-5 gap-1 px-1.5 text-[10px]">
              <Icon className="size-2.5" />
              {r.efficacy_class}
            </Badge>
          </div>
          <SheetTitle className="text-lg capitalize">{r.ingredient_name}</SheetTitle>
          <SheetDescription className="capitalize">{r.ingredient_family.replace(/_/g, " ")}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto px-4 pb-6">
          <div className="rounded-lg border p-4 text-center">
            <p className="type-eyebrow text-subtle-foreground">Context-adjusted effect</p>
            <p className="numeral mt-1 text-3xl font-semibold text-foreground">{pct(r.adjusted_effect_pct)}</p>
            <p className="type-caption mt-1 text-muted-foreground">shelf-life change vs. a matched control, after controlling for cheese, storage, packaging and concentration</p>
          </div>

          <div>
            <p className="type-caption mb-2 font-semibold text-foreground">Observed (unadjusted)</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border p-2.5">
                <p className="numeral text-base font-semibold text-foreground">{pct(r.descriptive_mean_pct)}</p>
                <p className="type-caption text-muted-foreground">Mean</p>
              </div>
              <div className="rounded-lg border p-2.5">
                <p className="numeral text-base font-semibold text-foreground">{pct(r.descriptive_median_pct)}</p>
                <p className="type-caption text-muted-foreground">Median</p>
              </div>
              <div className="rounded-lg border p-2.5">
                <p className="numeral text-base font-semibold text-foreground">±{r.descriptive_std_pct.toFixed(1)}</p>
                <p className="type-caption text-muted-foreground">Std dev</p>
              </div>
            </div>
          </div>

          <div>
            <p className="type-caption mb-2 font-semibold text-foreground">Observations</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border p-2.5">
                <p className="numeral text-base font-semibold text-foreground">{r.n_train}</p>
                <p className="type-caption text-muted-foreground">Train</p>
              </div>
              <div className="rounded-lg border p-2.5">
                <p className="numeral text-base font-semibold text-foreground">{r.n_validation}</p>
                <p className="type-caption text-muted-foreground">Validation</p>
              </div>
              <div className="rounded-lg border p-2.5">
                <p className="numeral text-base font-semibold text-foreground">{r.n_test}</p>
                <p className="type-caption text-muted-foreground">Test</p>
              </div>
            </div>
            {r.low_confidence && (
              <p className="type-caption mt-2 text-warning">Fewer than 20 training examples -- treat this ranking with extra caution.</p>
            )}
          </div>

          <div>
            <p className="type-caption mb-2 font-semibold text-foreground">Stability check</p>
            <div className={`rounded-lg border p-3 ${stability.tone === "warning" ? "border-warning/30 bg-warning/8" : "border-success/30 bg-success/8"}`}>
              <p className={`type-caption font-medium ${stability.tone === "warning" ? "text-warning" : "text-success"}`}>{stability.label}</p>
              <p className="type-caption mt-1 text-muted-foreground">
                Validation mean {pct(r.validation_mean_pct, 0)} · Test mean {pct(r.test_mean_pct, 0)}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
