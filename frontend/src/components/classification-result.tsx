"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus, ShieldAlert, ArrowUp, ArrowDown, Info,
} from "lucide-react";

import {
  api,
  type ClassificationResult,
  type ClassDefinitions,
  type ClassificationExplanation,
  type ClassificationFactor,
  type ClassificationSupportLevel,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const EASE = [0.16, 1, 0.3, 1] as const;

export const CLASS_BADGE_VARIANT: Record<string, "destructive" | "warning" | "success"> = {
  Low: "destructive",
  Medium: "warning",
  High: "success",
};
export const CLASS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Low: TrendingDown,
  Medium: Minus,
  High: TrendingUp,
};

const CLASS_TONE_TEXT: Record<string, string> = {
  Low: "text-destructive",
  Medium: "text-warning",
  High: "text-success",
};
const CLASS_TONE_BAR: Record<string, string> = {
  Low: "bg-destructive",
  Medium: "bg-warning",
  High: "bg-success",
};

const CLASS_INTERPRETATION: Record<string, string> = {
  High: "Most similar to combinations with the strongest improvements in the training data.",
  Medium: "Most similar to combinations with a moderate improvement in the training data.",
  Low: "Most similar to combinations with the smallest improvements in the training data.",
};

const SUPPORT_LEVEL_META: Record<ClassificationSupportLevel, { label: string; tone: "warning" | "destructive" }> = {
  supported: { label: "Supported", tone: "warning" },
  extrapolation: { label: "Limited training support", tone: "warning" },
  unsupported_categorical: { label: "Limited training support", tone: "destructive" },
};

function formatPct(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}

const STRENGTH_DOTS: Record<string, number> = { strong: 3, moderate: 2, slight: 1 };

/** Compact factor row: icon = direction, filled dots = strength, no written
 * sentence per row. Full sentence per factor read as far too much text for
 * up to 10 factors shown at once -- this keeps the same information legible
 * at a glance instead. */
function FactorRow({ factor, direction }: { factor: ClassificationFactor; direction: "supports" | "opposes" }) {
  const Icon = direction === "supports" ? ArrowUp : ArrowDown;
  const tone = direction === "supports" ? "text-success" : "text-destructive";
  const filled = STRENGTH_DOTS[factor.strength] ?? 1;
  return (
    <div className="flex items-center gap-2.5 py-1">
      <Icon className={`size-3.5 shrink-0 ${tone}`} />
      <p className="min-w-0 flex-1 truncate type-caption text-foreground">
        {factor.label}
        {factor.value !== null && factor.value !== undefined && (
          <span className="text-muted-foreground"> · {String(factor.value)}</span>
        )}
      </p>
      <div className="flex shrink-0 items-center gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`size-1.5 rounded-full ${i < filled ? tone.replace("text-", "bg-") : "bg-border"}`} />
        ))}
      </div>
    </div>
  );
}

function ClassExplanationBlock({ block }: { block: { supporting: ClassificationFactor[]; opposing: ClassificationFactor[] } }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <p className="type-caption mb-1.5 font-semibold text-foreground">For</p>
        {block.supporting.length > 0 ? (
          block.supporting.map((f) => <FactorRow key={f.feature} factor={f} direction="supports" />)
        ) : (
          <p className="type-caption text-muted-foreground">No meaningful factor.</p>
        )}
      </div>
      <div>
        <p className="type-caption mb-1.5 font-semibold text-foreground">Against</p>
        {block.opposing.length > 0 ? (
          block.opposing.map((f) => <FactorRow key={f.feature} factor={f} direction="opposes" />)
        ) : (
          <p className="type-caption text-muted-foreground">No meaningful factor.</p>
        )}
      </div>
    </div>
  );
}

function classThresholdLabel(cls: string, classDefinitions: ClassDefinitions): string {
  const { low_max, medium_max } = classDefinitions.thresholds_pct;
  if (cls === "Low") return `Below ${low_max.toFixed(0)}% improvement over control`;
  if (cls === "Medium") return `${low_max.toFixed(0)}%–${medium_max.toFixed(0)}% improvement over control`;
  return `${medium_max.toFixed(0)}%+ improvement over control`;
}

export function ClassificationResultCard({
  result, classDefinitions,
}: {
  result: ClassificationResult;
  classDefinitions: ClassDefinitions;
}) {
  const [explanation, setExplanation] = React.useState<ClassificationExplanation | null>(null);
  const [explanationError, setExplanationError] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(result.predicted_class);

  React.useEffect(() => {
    setExplanation(null);
    setExplanationError(false);
    setActiveTab(result.predicted_class);
    api.classificationExplain({ model: result.model, row: result.row, top_k: 4 })
      .then(setExplanation)
      .catch(() => setExplanationError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.candidate_name, result.model]);

  const predictedClass = result.predicted_class;
  const Icon = CLASS_ICON[predictedClass] ?? Minus;
  const support = result.support;
  const isSupported = !support || support.level === "supported";
  const meta = support ? SUPPORT_LEVEL_META[support.level] : null;

  const supportReasons: string[] = [];
  if (support) {
    for (const u of support.unseen_categoricals) supportReasons.push(`${u.feature} = ${u.value}`);
    for (const e of support.extrapolations) supportReasons.push(e.detail);
  }

  return (
    <Card className="surface overflow-hidden">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm text-foreground">{result.candidate_name}</CardTitle>
          <span className="type-caption text-muted-foreground">{result.model_label}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {!isSupported && meta && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className={`rounded-xl border px-4 py-3 ${meta.tone === "destructive" ? "border-destructive/30 bg-destructive/8" : "border-warning/30 bg-warning/8"}`}
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert className={`mt-0.5 size-4 shrink-0 ${meta.tone === "destructive" ? "text-destructive" : "text-warning"}`} />
              <div className="min-w-0">
                <p className={`type-ui font-semibold ${meta.tone === "destructive" ? "text-destructive" : "text-warning"}`}>{meta.label}</p>
                {supportReasons.length > 0 && (
                  <p className="type-caption mt-0.5 text-foreground/70">{supportReasons.join(" · ")}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Hero: predicted class */}
        <div className="text-center">
          <div className={`numeral flex items-center justify-center gap-2.5 text-4xl font-semibold tracking-tight sm:text-5xl ${isSupported ? CLASS_TONE_TEXT[predictedClass] : "text-muted-foreground"}`}>
            <Icon className="size-8" />
            {predictedClass.toUpperCase()}
          </div>
          <p className="type-caption mx-auto mt-2 max-w-sm text-muted-foreground">{CLASS_INTERPRETATION[predictedClass]}</p>
        </div>

        {/* Model scores */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <p className="type-caption font-semibold text-foreground">Model scores</p>
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                How strongly the model favored this class relative to the alternatives -- not a calibrated probability.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-1.5">
            {classDefinitions.class_names.map((cls) => (
              <div key={cls} className="flex items-center gap-2.5">
                <span className="w-14 shrink-0 type-caption text-foreground">{cls}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${CLASS_TONE_BAR[cls]}`} style={{ width: formatPct(result.probabilities[cls] ?? 0) }} />
                </div>
                <span className="w-9 shrink-0 text-right font-mono type-caption tabular-nums text-foreground">
                  {formatPct(result.probabilities[cls] ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Why -- one tabbed section, no duplication between "this result" and "other classes" */}
        <div className="border-t pt-4">
          {explanationError ? (
            <p className="type-caption text-muted-foreground">Explanation unavailable for this prediction.</p>
          ) : !explanation ? (
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
              <TabsList variant="solid">
                {classDefinitions.class_names.map((cls) => (
                  <TabsTrigger key={cls} value={cls}>
                    {cls} {formatPct(result.probabilities[cls] ?? 0)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {classDefinitions.class_names.map((cls) => (
                <TabsContent key={cls} value={cls} className="pt-3">
                  <p className="type-caption mb-2 text-muted-foreground">{classThresholdLabel(cls, classDefinitions)}</p>
                  {explanation.classes[cls] && <ClassExplanationBlock block={explanation.classes[cls]} />}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ClassificationResults({
  results, classDefinitions,
}: {
  results: ClassificationResult[];
  classDefinitions: ClassDefinitions;
}) {
  return (
    <div className="space-y-4">
      {results.map((r) => (
        <ClassificationResultCard key={r.candidate_name} result={r} classDefinitions={classDefinitions} />
      ))}
    </div>
  );
}
