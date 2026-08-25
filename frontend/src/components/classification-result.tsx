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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  High: "The model considers this formulation more similar to combinations that produced relatively strong shelf-life improvements in the training data.",
  Medium: "The model considers this formulation more similar to combinations that produced a moderate shelf-life improvement in the training data.",
  Low: "The model considers this formulation more similar to combinations that produced a smaller shelf-life improvement in the training data.",
};

/** Mirrors prediction-v6-result.tsx's SUPPORT_LEVEL_META pattern -- "supported"
 * is the only level shown without a banner; every other level is visually
 * flagged, never silently blended into a normal-looking result. */
const SUPPORT_LEVEL_META: Record<ClassificationSupportLevel, { label: string; tone: "warning" | "destructive"; headline: string }> = {
  supported: { label: "Supported", tone: "warning", headline: "" },
  extrapolation: { label: "Limited training support", tone: "warning", headline: "One or more inputs fall outside the range this classifier was trained on." },
  unsupported_categorical: { label: "Limited training support", tone: "destructive", headline: "One or more selected values were never seen during training." },
};

function formatPct(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}

// Full sentences, not a template with a bolted-on suffix -- wording
// deliberately describes MODEL CONTRIBUTION for this one prediction, never a
// causal claim about the ingredient/condition itself (task requirement).
const FACTOR_SENTENCE: Record<"supports" | "opposes", Record<string, string>> = {
  supports: {
    strong: "Strongly pushed this prediction toward this class.",
    moderate: "Supported this class for this prediction.",
    slight: "Slightly supported this class for this prediction.",
  },
  opposes: {
    strong: "Strongly worked against this class for this prediction.",
    moderate: "Reduced the model's tendency to assign this class.",
    slight: "Slightly reduced support for this class.",
  },
};

function FactorRow({ factor, direction }: { factor: ClassificationFactor; direction: "supports" | "opposes" }) {
  const Icon = direction === "supports" ? ArrowUp : ArrowDown;
  const tone = direction === "supports" ? "text-success" : "text-destructive";
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={`mt-0.5 size-3.5 shrink-0 ${tone}`} />
      <div className="min-w-0">
        <p className="type-caption font-medium text-foreground">
          {factor.label}{factor.value !== null && factor.value !== undefined ? <>: <span className="font-normal">{String(factor.value)}</span></> : null}
        </p>
        <p className="type-caption text-muted-foreground">{FACTOR_SENTENCE[direction][factor.strength]}</p>
      </div>
    </div>
  );
}

function ClassExplanationBlock({ cls, block }: { cls: string; block: { supporting: ClassificationFactor[]; opposing: ClassificationFactor[] } }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="type-ui mb-2 font-semibold text-foreground">Main supporting factors</p>
        {block.supporting.length > 0 ? (
          <div className="space-y-2.5">
            {block.supporting.map((f) => <FactorRow key={f.feature} factor={f} direction="supports" />)}
          </div>
        ) : (
          <p className="type-caption text-muted-foreground">No factor meaningfully supported {cls} for this formulation.</p>
        )}
      </div>
      <div>
        <p className="type-ui mb-2 font-semibold text-foreground">Main opposing factors</p>
        {block.opposing.length > 0 ? (
          <div className="space-y-2.5">
            {block.opposing.map((f) => <FactorRow key={f.feature} factor={f} direction="opposes" />)}
          </div>
        ) : (
          <p className="type-caption text-muted-foreground">No factor meaningfully opposed {cls} for this formulation.</p>
        )}
      </div>
    </div>
  );
}

export function ClassificationResultCard({
  result, classDefinitions,
}: {
  result: ClassificationResult;
  classDefinitions: ClassDefinitions;
}) {
  const [explanation, setExplanation] = React.useState<ClassificationExplanation | null>(null);
  const [explanationError, setExplanationError] = React.useState(false);

  React.useEffect(() => {
    setExplanation(null);
    setExplanationError(false);
    api.classificationExplain({ model: result.model, row: result.row, top_k: 5 })
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
    for (const u of support.unseen_categoricals) {
      supportReasons.push(`'${u.feature}' = '${u.value}' was never seen during training.`);
    }
    for (const e of support.extrapolations) {
      supportReasons.push(e.detail);
    }
  }

  const predictedBlock = explanation?.classes[predictedClass];

  return (
    <Card className="surface overflow-hidden">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm">{result.candidate_name}</CardTitle>
          <span className="type-caption text-muted-foreground">{result.model_label}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
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
                <p className="type-caption mt-0.5 text-muted-foreground">{meta.headline} Interpret the classification with additional caution.</p>
                {supportReasons.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {supportReasons.map((r, i) => <li key={i} className="type-caption text-muted-foreground">&middot; {r}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Hero: predicted class */}
        <div className="text-center">
          <p className="type-eyebrow text-subtle-foreground">Predicted relative efficacy tier</p>
          <div className={`numeral mt-2 flex items-center justify-center gap-2.5 text-4xl font-semibold tracking-tight sm:text-5xl ${isSupported ? CLASS_TONE_TEXT[predictedClass] : "text-muted-foreground"}`}>
            <Icon className="size-8" />
            {predictedClass.toUpperCase()}
          </div>
          <p className="type-caption mx-auto mt-3 max-w-md text-muted-foreground">{CLASS_INTERPRETATION[predictedClass]}</p>
        </div>

        {/* Model scores */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <p className="type-ui font-semibold text-foreground">Model scores</p>
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                This value indicates how strongly the model favored this class relative to the alternatives.
                It should not be interpreted as a guaranteed probability of experimental success.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-1.5">
            {classDefinitions.class_names.map((cls) => (
              <div key={cls} className="flex items-center gap-2.5">
                <span className="w-14 shrink-0 type-caption text-muted-foreground">{cls}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${CLASS_TONE_BAR[cls]}`} style={{ width: formatPct(result.probabilities[cls] ?? 0) }} />
                </div>
                <span className="w-10 shrink-0 text-right font-mono type-caption tabular-nums text-muted-foreground">
                  {formatPct(result.probabilities[cls] ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Why this result */}
        {explanationError ? (
          <p className="type-caption text-muted-foreground">A detailed explanation isn&rsquo;t available for this prediction right now.</p>
        ) : !explanation ? (
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="space-y-4 border-t pt-5">
            <p className="type-ui font-semibold text-foreground">
              Why the model leaned toward &ldquo;{predictedClass}&rdquo;
            </p>
            {predictedBlock && <ClassExplanationBlock cls={predictedClass} block={predictedBlock} />}
          </div>
        )}

        {/* Other classes */}
        {explanation && (
          <div className="border-t pt-5">
            <p className="type-ui mb-3 font-semibold text-foreground">How the model considered each class</p>
            <Tabs defaultValue={predictedClass}>
              <TabsList variant="solid">
                {classDefinitions.class_names.map((cls) => (
                  <TabsTrigger key={cls} value={cls}>
                    {cls} &middot; {formatPct(result.probabilities[cls] ?? 0)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {classDefinitions.class_names.map((cls) => (
                <TabsContent key={cls} value={cls} className="pt-3">
                  {explanation.classes[cls] && <ClassExplanationBlock cls={cls} block={explanation.classes[cls]} />}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* What does this class mean */}
        <div className="rounded-lg border bg-secondary/30 px-4 py-3">
          <p className="type-caption font-semibold text-foreground">What does &ldquo;{predictedClass}&rdquo; mean?</p>
          <p className="type-caption mt-1 text-muted-foreground">{classDefinitions.description}</p>
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
