import Link from "next/link";
import {
  Database, Layers, Trophy, Target, FlaskConical, Scale, ListTree, ArrowRight,
  ShieldQuestion,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageBody, PageHeader, Stagger, Reveal, SectionLabel } from "@/components/page-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  { icon: Database, title: "Match to control", desc: "Every treated row is paired with its untreated control -- same matrix, storage, packaging." },
  { icon: Scale, title: "Compute improvement", desc: "Relative shelf-life change vs. that matched control, as a percentage." },
  { icon: ListTree, title: "Bucket into tertiles", desc: "Improvement % is split into 3 balanced classes using train-split-only cutoffs." },
  { icon: FlaskConical, title: "Train on the combination", desc: "Matrix + storage + packaging + treatment -- never the ingredient in isolation." },
  { icon: Target, title: "Classify directly", desc: "At inference, one filled-in formulation goes in, one class comes out -- no control is asked for." },
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
    .sort((a, b) => b.highPct - a.highPct);

  // Plain-language reliability facts, derived once here so the headline
  // numbers on the page and the "technical details" underneath never
  // disagree -- both read from the same bestDetails response.
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
        description="Estimates whether a complete formulation resembles the Low-, Medium-, or High-improvement treatments learned from the training experiments -- classifying the full combination, not a single ingredient."
        actions={<ClassifyCta />}
      />

      <Stagger className="mb-8 grid-cols-2 md:grid-cols-4">
        <KpiCard label="Treated formulations" numericValue={manifest.n_total_treated_rows} icon={<Database className="h-4 w-4" />} tone="primary" animateIn sub="Matched to a control row" />
        <KpiCard label="Classes" numericValue={class_definitions.class_names.length} icon={<Layers className="h-4 w-4" />} animateIn sub={class_definitions.class_names.join(" / ")} />
        <KpiCard label="Best classifier" value={bestSummary?.label ?? best_model} icon={<Trophy className="h-4 w-4" />} tone="success" sub="Highest test macro F1" />
        <KpiCard label="Correctly classified" numericValue={(bestSummary?.test_accuracy ?? 0) * 100} decimals={1} suffix="%" icon={<Target className="h-4 w-4" />} tone="primary" animateIn sub={`vs. ${(100 / class_definitions.class_names.length).toFixed(0)}% random baseline`} />
      </Stagger>

      {/* ── Section 1: What is being classified? ─────────────────────────── */}
      <Reveal>
        <SectionLabel>What is being classified?</SectionLabel>
        <Card className="surface mb-8">
          <CardHeader>
            <CardTitle className="text-sm">A full formulation, not an ingredient in isolation</CardTitle>
            <CardDescription>
              The same ingredient produces very different shelf-life gains depending on the cheese matrix, concentration, and application method it is paired with --
              training data shows within-ingredient outcomes varying by as much as 20 percentage points across contexts. A single fixed label per ingredient would
              erase that variation, so every classification is made on the full formulation (cheese + storage + packaging + treatment), exactly as it will be used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
              <div className="pointer-events-none absolute left-[8%] right-[8%] top-[18px] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
              {METHOD_STEPS.map((step, i) => (
                <div key={step.title} className="group relative">
                  <div className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary shadow-xs transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-sm">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="absolute right-0 top-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="text-[13px] font-medium text-foreground">{step.title}</div>
                  <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{step.desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Section 2: How are Low/Medium/High defined? ──────────────────── */}
      <Reveal delay={0.04}>
        <SectionLabel>How are Low / Medium / High defined?</SectionLabel>
        <Card className="surface mb-8">
          <CardHeader>
            <CardTitle className="text-sm">A relative efficacy tier within the training dataset -- not a universal threshold</CardTitle>
            <CardDescription>{class_definitions.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <ClassRangeCard cls="Low" range={`< ${class_definitions.thresholds_pct.low_max.toFixed(1)}%`} count={distribution.overall["Low"] ?? 0} total={totalRows} />
              <ClassRangeCard cls="Medium" range={`${class_definitions.thresholds_pct.low_max.toFixed(1)}% – ${class_definitions.thresholds_pct.medium_max.toFixed(1)}%`} count={distribution.overall["Medium"] ?? 0} total={totalRows} />
              <ClassRangeCard cls="High" range={`≥ ${class_definitions.thresholds_pct.medium_max.toFixed(1)}%`} count={distribution.overall["High"] ?? 0} total={totalRows} />
            </div>
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldQuestion className="mt-0.5 size-3.5 shrink-0" />
              These boundaries split this training dataset into three equal-sized groups (tertiles) -- they are not a food-safety
              standard, a regulatory threshold, or a claim that a &ldquo;Low&rdquo; formulation is scientifically ineffective. A different
              dataset would draw the lines in different places.
            </p>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Section 3: What does the training dataset show? ──────────────── */}
      <Reveal delay={0.04}>
        <SectionLabel>What does the training dataset show?</SectionLabel>
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <Card className="surface">
            <CardHeader>
              <CardTitle className="text-sm">How are formulations distributed across the three tiers?</CardTitle>
              <CardDescription>{totalRows.toLocaleString()} treated formulations, balanced by design (tertile cutoffs put roughly a third of formulations in each tier).</CardDescription>
            </CardHeader>
            <CardContent><BarHChart data={overallData} height={180} /></CardContent>
          </Card>
          <Card className="surface">
            <CardHeader>
              <CardTitle className="text-sm">Which cheese categories skew toward higher-efficacy treatments?</CardTitle>
              <CardDescription>Counts of formulations in each tier, split by cheese category. A category with more High-tier rows saw larger relative improvements more often in these experiments.</CardDescription>
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
                      <TableCell className="capitalize">{humanizeValue(cat)}</TableCell>
                      {class_definitions.class_names.map((c) => (
                        <TableCell key={c} className="text-right tabular-nums">{counts[c] ?? 0}</TableCell>
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
            <CardTitle className="text-sm">Which treatment families most often produced strong improvements?</CardTitle>
            <CardDescription>
              This chart summarizes what happened in the training experiments. It does not mean that an ingredient family is
              always highly effective; the result still depends on the complete formulation and storage conditions.
            </CardDescription>
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
                      <TableCell className="capitalize">{humanizeValue(r.fam)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{r.counts["Low"] ?? 0}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{r.counts["Medium"] ?? 0}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{r.counts["High"] ?? 0}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-foreground">{r.highPct.toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Section 4: How reliable is the classifier? ───────────────────── */}
      <Reveal delay={0.04}>
        <SectionLabel>How reliable is the classifier?</SectionLabel>
        <Card className="surface mb-8">
          <CardHeader>
            <CardTitle className="text-sm">Overall classification performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="numeral text-3xl font-semibold text-foreground">{((bestSummary?.test_accuracy ?? 0) * 100).toFixed(1)}%</div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  of formulations the {bestSummary?.label ?? best_model} had never seen were classified into the correct tier.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="numeral text-3xl font-semibold text-foreground">
                  <Badge variant={CLASS_BADGE_VARIANT[hardestClass] ?? "secondary"} className="h-7 px-2.5 text-sm">{hardestClass}</Badge>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  is the hardest tier to distinguish -- it sits between the other two, so borderline formulations are the most likely to be misclassified.
                </p>
              </div>
            </div>
            <p className="type-caption text-muted-foreground">
              <span className="font-medium text-foreground">Macro F1</span> (the metric used to rank classifiers) measures how well a model
              distinguishes Low, Medium, and High while giving equal importance to all three groups, so a model can&rsquo;t score well just by
              favoring the easiest class.
            </p>

            <Collapsible>
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
                          <TableCell className={m.is_best ? "font-semibold text-primary" : "font-medium"}>
                            <div className="flex items-center gap-1.5">
                              {m.is_best && <Trophy className="h-3.5 w-3.5 text-warning" />}
                              {m.label}
                              {m.is_best && <Badge className="ml-1 h-5 px-1.5 text-[10px]">best</Badge>}
                            </div>
                            <div className="mt-0.5 text-[11px] font-normal text-muted-foreground">{m.blurb}</div>
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

      {/* ── Section 5: What characteristics matter most? ─────────────────── */}
      <Reveal delay={0.04}>
        <SectionLabel>What characteristics matter most?</SectionLabel>
        <Card className="surface mb-8">
          <CardHeader>
            <CardTitle className="text-sm">Which formulation characteristics most influence the classification?</CardTitle>
            <CardDescription>
              Ranked by how much test accuracy drops when that characteristic is scrambled, for the {bestSummary?.label ?? best_model}.
              This describes the model in general, across every formulation it was trained on -- it is not the explanation for any one
              formulation. Each individual prediction gets its own explanation on the results page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {topFactors.map(([raw, value], i) => (
                <div key={raw} className="flex items-center gap-3 rounded-lg border px-3.5 py-2.5">
                  <span className="font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-[13px] font-medium text-foreground">{humanizeFeature(raw)}</span>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{(value * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Section 6: Limitations ────────────────────────────────────────── */}
      <Reveal delay={0.04}>
        <SectionLabel>Limitations</SectionLabel>
        <Card className="surface mb-8">
          <CardContent className="space-y-2.5 py-5 text-xs leading-relaxed text-muted-foreground">
            <p>A prediction describes how similar a formulation is to patterns the model learned from this specific training dataset -- it is not a guarantee of experimental outcome, and it does not predict or estimate an actual shelf-life value for the treated or untreated product.</p>
            <p>Low / Medium / High are relative tiers within this training distribution, not universal, regulatory, or biologically fixed efficacy thresholds -- see the definition above.</p>
            <p><span className="font-medium text-foreground">{hardestClass}</span> is the hardest tier for both classifiers to distinguish; predictions landing near a tier boundary deserve more scrutiny than ones far from it.</p>
            <p>The model may be less reliable for formulations that combine values rarely or never seen together during training -- the results page flags this explicitly for every prediction.</p>
          </CardContent>
        </Card>
      </Reveal>

      <Card className="surface mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
          <div>
            <p className="text-sm font-semibold text-foreground">Ready to classify a formulation?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Fill in a cheese profile and up to 4 candidate treatments -- the control&rsquo;s shelf life is never requested.</p>
          </div>
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
        <span className="font-mono text-[11px] text-muted-foreground">{pct.toFixed(0)}% of rows</span>
      </div>
      <div className="numeral text-lg font-semibold text-foreground">{range}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{count.toLocaleString()} formulations</div>
    </div>
  );
}
