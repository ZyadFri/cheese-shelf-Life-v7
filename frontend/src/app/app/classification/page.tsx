import Link from "next/link";
import {
  Database, Layers, Trophy, Target, FlaskConical, Scale, ListTree, ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageBody, PageHeader, Stagger, Reveal, SectionLabel } from "@/components/page-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BarHChart } from "@/components/charts/bar-h-chart";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@/components/ui/collapsible";
import { ClassificationExplorer } from "@/components/classification-explorer";
import { humanizeFeature, humanizeValue } from "@/lib/classification-labels";

const CLASS_BADGE_VARIANT: Record<string, "destructive" | "warning" | "success"> = {
  Low: "destructive",
  Medium: "warning",
  High: "success",
};

const METHOD_STEPS = [
  { icon: Database, title: "Match to control" },
  { icon: Scale, title: "Compute improvement %" },
  { icon: ListTree, title: "Bucket into tertiles" },
  { icon: FlaskConical, title: "Train on the full combination" },
  { icon: Target, title: "Classify directly, no control needed" },
];

const RUN_HREF = "/app/classification/run";

function ClassifyCta({ label = "Classify a formulation" }: { label?: string }) {
  return (
    <Link href={RUN_HREF} className={buttonVariants()}>
      {label}<ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export default async function ClassificationPage() {
  const health = await api.classificationHealth();

  if (!health.available) {
    return (
      <PageBody>
        <PageHeader title="Classification" description="Formulation efficacy classification is not available yet." />
        <Card className="surface">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="type-title text-foreground">Classifier artifacts not found</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Run <code className="font-mono">python train_classifier.py</code> to build the classification artifacts, then reload this page.
            </p>
          </CardContent>
        </Card>
      </PageBody>
    );
  }

  const [manifest, { models, best_model, class_definitions }, distribution] = await Promise.all([
    api.classificationManifest(),
    api.classificationModels(),
    api.classificationDistribution(),
  ]);
  const bestDetails = await api.classificationModelDetails(best_model);

  const bestSummary = models.find((m) => m.is_best);
  const overallData = class_definitions.class_names.map((cls) => ({ label: cls, value: distribution.overall[cls] ?? 0 }));
  const totalRows = Object.values(distribution.overall).reduce((a, b) => a + b, 0);

  const familyRows = Object.entries(distribution.by_ingredient_family)
    .filter(([fam]) => fam !== "none")
    .map(([fam, counts]) => {
      const total = class_definitions.class_names.reduce((s, c) => s + (counts[c] ?? 0), 0);
      const highPct = total > 0 ? ((counts["High"] ?? 0) / total) * 100 : 0;
      return { fam, counts, total, highPct };
    })
    .sort((a, b) => b.highPct - a.highPct)
    .slice(0, 10);

  const testPerClass = bestDetails.metrics.test.per_class;
  const hardestClass = class_definitions.class_names.reduce((worst, cls) =>
    (testPerClass[cls]?.f1 ?? 1) < (testPerClass[worst]?.f1 ?? 1) ? cls : worst, class_definitions.class_names[0]);

  const permImportance = bestDetails.feature_importance.permutation ?? {};
  const topFactors = Object.entries(permImportance)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <PageBody>
      <PageHeader
        title="Formulation Efficacy Classification"
        description="Predicts whether a formulation resembles Low-, Medium-, or High-improvement treatments, from the full combination -- not one ingredient."
        actions={<ClassifyCta />}
      />

      <Stagger className="mb-8 grid-cols-2 md:grid-cols-4">
        <KpiCard label="Treated formulations" numericValue={manifest.n_total_treated_rows} icon={<Database className="h-4 w-4" />} tone="primary" animateIn />
        <KpiCard label="Classes" numericValue={class_definitions.class_names.length} icon={<Layers className="h-4 w-4" />} animateIn sub={class_definitions.class_names.join(" / ")} />
        <KpiCard label="Best classifier" value={bestSummary?.label ?? best_model} icon={<Trophy className="h-4 w-4" />} tone="success" />
        <KpiCard label="Correctly classified" numericValue={(bestSummary?.test_accuracy ?? 0) * 100} decimals={1} suffix="%" icon={<Target className="h-4 w-4" />} tone="primary" animateIn />
      </Stagger>

      {/* ── What & how ────────────────────────────────────────────────────── */}
      <Reveal>
        <SectionLabel>What is being classified</SectionLabel>
        <Card className="surface mb-6">
          <CardContent className="py-5">
            <p className="type-body mb-5 text-foreground">
              The same ingredient produces very different results depending on the cheese, concentration, and application method --
              so every classification uses the full formulation, never an ingredient alone.
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-5">
              {METHOD_STEPS.map((step, i) => (
                <div key={step.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-primary">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="text-[12.5px] font-medium leading-snug text-foreground">{step.title}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Class definitions ────────────────────────────────────────────── */}
      <Reveal delay={0.04}>
        <SectionLabel>How Low / Medium / High are defined</SectionLabel>
        <Card className="surface mb-6">
          <CardContent className="py-5">
            <p className="type-body mb-4 text-foreground">
              A relative tier within this training dataset, not a universal or regulatory threshold -- based on shelf-life
              improvement over a matched control.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <ClassRangeCard cls="Low" range={`< ${class_definitions.thresholds_pct.low_max.toFixed(0)}%`} count={distribution.overall["Low"] ?? 0} total={totalRows} />
              <ClassRangeCard cls="Medium" range={`${class_definitions.thresholds_pct.low_max.toFixed(0)}–${class_definitions.thresholds_pct.medium_max.toFixed(0)}%`} count={distribution.overall["Medium"] ?? 0} total={totalRows} />
              <ClassRangeCard cls="High" range={`≥ ${class_definitions.thresholds_pct.medium_max.toFixed(0)}%`} count={distribution.overall["High"] ?? 0} total={totalRows} />
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Dataset patterns ──────────────────────────────────────────────── */}
      <Reveal delay={0.04}>
        <SectionLabel>What the training data shows</SectionLabel>
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <Card className="surface">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Distribution across tiers</CardTitle>
            </CardHeader>
            <CardContent><BarHChart data={overallData} height={160} /></CardContent>
          </Card>
          <Card className="surface">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">By cheese category</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    {class_definitions.class_names.map((c) => <TableHead key={c} className="text-right">{c}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(distribution.by_cheese_category).map(([cat, counts]) => (
                    <TableRow key={cat} className="row-interactive">
                      <TableCell className="capitalize text-foreground">{humanizeValue(cat)}</TableCell>
                      {class_definitions.class_names.map((c) => (
                        <TableCell key={c} className="text-right tabular-nums text-foreground">{counts[c] ?? 0}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card className="surface mb-8">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Treatment families most often landing in High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient family</TableHead>
                    <TableHead className="text-right">Low</TableHead>
                    <TableHead className="text-right">Medium</TableHead>
                    <TableHead className="text-right">High</TableHead>
                    <TableHead className="text-right">% High</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyRows.map((r) => (
                    <TableRow key={r.fam} className="row-interactive">
                      <TableCell className="capitalize text-foreground">{humanizeValue(r.fam)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{r.counts["Low"] ?? 0}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{r.counts["Medium"] ?? 0}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{r.counts["High"] ?? 0}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold text-foreground">{r.highPct.toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 type-caption text-muted-foreground">Descriptive only -- the same family still spans all three tiers depending on the rest of the formulation.</p>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Reliability ───────────────────────────────────────────────────── */}
      <Reveal delay={0.04}>
        <SectionLabel>How reliable is the classifier</SectionLabel>
        <Card className="surface mb-6">
          <CardContent className="py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="numeral text-3xl font-semibold text-foreground">{((bestSummary?.test_accuracy ?? 0) * 100).toFixed(1)}%</div>
                <p className="mt-1 type-caption text-muted-foreground">correctly classified, on formulations never seen in training</p>
              </div>
              <div className="rounded-lg border p-4">
                <Badge variant={CLASS_BADGE_VARIANT[hardestClass] ?? "secondary"} className="h-7 px-2.5 text-sm">{hardestClass}</Badge>
                <p className="mt-2 type-caption text-muted-foreground">hardest tier to distinguish -- it sits between the other two</p>
              </div>
            </div>

            <Collapsible className="mt-4">
              <CollapsibleTrigger>Technical model details</CollapsibleTrigger>
              <CollapsiblePanel keepMounted>
                <div className="space-y-4 pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Classifier</TableHead>
                        <TableHead className="text-right">Val accuracy</TableHead>
                        <TableHead className="text-right">Test accuracy</TableHead>
                        <TableHead className="text-right">Val macro F1</TableHead>
                        <TableHead className="text-right">Test macro F1</TableHead>
                        <TableHead className="text-right">Train time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {models.map((m) => (
                        <TableRow key={m.id} className={m.is_best ? "bg-accent/60" : "row-interactive"}>
                          <TableCell className={m.is_best ? "font-semibold text-primary" : "font-medium text-foreground"}>
                            <div className="flex items-center gap-1.5">
                              {m.is_best && <Trophy className="h-3.5 w-3.5 text-warning" />}
                              {m.label}
                              {m.is_best && <Badge className="ml-1 h-5 px-1.5 text-[10px]">best</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{m.validation_accuracy.toFixed(3)}</TableCell>
                          <TableCell className="text-right tabular-nums">{m.test_accuracy.toFixed(3)}</TableCell>
                          <TableCell className="text-right tabular-nums">{m.validation_macro_f1.toFixed(3)}</TableCell>
                          <TableCell className="text-right tabular-nums">{m.test_macro_f1.toFixed(3)}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{m.training_duration_sec.toFixed(1)}s</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ClassificationExplorer models={models} />
                </div>
              </CollapsiblePanel>
            </Collapsible>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── What matters most ─────────────────────────────────────────────── */}
      <Reveal delay={0.04}>
        <SectionLabel>What characteristics matter most</SectionLabel>
        <Card className="surface mb-6">
          <CardContent className="py-5">
            <div className="grid gap-2 sm:grid-cols-2">
              {topFactors.map(([raw, value], i) => (
                <div key={raw} className="flex items-center gap-3 rounded-lg border px-3.5 py-2.5">
                  <span className="font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-[13px] font-medium text-foreground">{humanizeFeature(raw)}</span>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{(value * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <p className="mt-3 type-caption text-muted-foreground">Describes the model overall, not one prediction -- each result gets its own explanation.</p>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Limitations ───────────────────────────────────────────────────── */}
      <Reveal delay={0.04}>
        <SectionLabel>Limitations</SectionLabel>
        <Card className="surface mb-8">
          <CardContent className="grid gap-3 py-5 sm:grid-cols-2">
            <p className="type-caption text-foreground">A prediction is not a shelf-life estimate -- it only describes similarity to training patterns.</p>
            <p className="type-caption text-foreground">Tiers are relative to this dataset, not a food-safety or regulatory standard.</p>
            <p className="type-caption text-foreground"><span className="font-semibold">{hardestClass}</span> predictions near the tier boundary deserve extra scrutiny.</p>
            <p className="type-caption text-foreground">Formulations with rarely-seen value combinations are flagged automatically on the results page.</p>
          </CardContent>
        </Card>
      </Reveal>

      <Card className="surface mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
          <p className="text-sm font-semibold text-foreground">Ready to classify a formulation?</p>
          <ClassifyCta label="Classify a formulation" />
        </CardContent>
      </Card>
    </PageBody>
  );
}

function ClassRangeCard({ cls, range, count, total }: { cls: string; range: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between">
        <Badge variant={CLASS_BADGE_VARIANT[cls] ?? "secondary"} className="h-6 px-2 text-[11px]">{cls}</Badge>
        <span className="font-mono text-[11px] text-muted-foreground">{pct.toFixed(0)}%</span>
      </div>
      <div className="numeral text-lg font-semibold text-foreground">{range}</div>
      <div className="mt-0.5 type-caption text-muted-foreground">{count.toLocaleString()} formulations</div>
    </div>
  );
}
