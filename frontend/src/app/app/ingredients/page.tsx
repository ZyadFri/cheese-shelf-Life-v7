import { Database, Layers, Target, Sparkles, FlaskConical, GitCompareArrows, Gauge } from "lucide-react";
import { api } from "@/lib/api";
import { PageBody, PageHeader, Stagger, Reveal, SectionLabel } from "@/components/page-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarHChart } from "@/components/charts/bar-h-chart";
import { IngredientTable } from "@/components/ingredient-table";

const METHOD_STEPS = [
  { icon: Database, title: "Match to control" },
  { icon: GitCompareArrows, title: "Compute improvement %" },
  { icon: FlaskConical, title: "Adjust for context (regression)" },
  { icon: Gauge, title: "Check it holds up out-of-sample" },
];

const CLASS_BADGE_VARIANT: Record<string, "destructive" | "warning" | "success"> = {
  Low: "destructive",
  Medium: "warning",
  High: "success",
};

export default async function IngredientsPage() {
  const health = await api.ingredientRankingHealth();

  if (!health.available) {
    return (
      <PageBody>
        <PageHeader title="Ingredients" description="Ingredient efficacy ranking is not available yet." />
        <Card className="surface">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="type-title text-foreground">Ranking artifacts not found</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Run <code className="font-mono">python train_ingredient_ranking.py</code> to build the ranking, then reload this page.
            </p>
          </CardContent>
        </Card>
      </PageBody>
    );
  }

  const [manifest, { rankings, families, class_definitions }] = await Promise.all([
    api.ingredientRankingManifest(),
    api.ingredientRankings(),
  ]);

  const top10 = [...rankings].sort((a, b) => b.adjusted_effect_pct - a.adjusted_effect_pct).slice(0, 10)
    .map((r) => ({ label: r.ingredient_name, value: Number(r.adjusted_effect_pct.toFixed(1)) }));
  const bottom10 = [...rankings].sort((a, b) => a.adjusted_effect_pct - b.adjusted_effect_pct).slice(0, 10)
    .map((r) => ({ label: r.ingredient_name, value: Number(r.adjusted_effect_pct.toFixed(1)) }))
    .reverse();

  const classCounts = class_definitions.class_names.map((cls) => ({
    cls, count: rankings.filter((r) => r.efficacy_class === cls).length,
  }));

  return (
    <PageBody>
      <PageHeader
        title="Ingredient Efficacy"
        description="Ranks individual ingredients on their own -- complements the formulation-level Classification page."
      />

      <Stagger className="mb-8 grid-cols-2 md:grid-cols-4">
        <KpiCard label="Ingredients ranked" numericValue={manifest.n_ingredients} icon={<Database className="h-4 w-4" />} tone="primary" animateIn />
        <KpiCard label="Classes" numericValue={class_definitions.class_names.length} icon={<Layers className="h-4 w-4" />} animateIn sub={class_definitions.class_names.join(" / ")} />
        <KpiCard label="Regression fit (R²)" numericValue={manifest.regression_in_sample_r2 * 100} decimals={1} suffix="%" icon={<Target className="h-4 w-4" />} tone="primary" />
        <KpiCard
          label="Out-of-sample stability"
          value={manifest.rank_stability_spearman_vs_test_split !== null ? manifest.rank_stability_spearman_vs_test_split.toFixed(2) : "n/a"}
          icon={<Gauge className="h-4 w-4" />}
          tone="success"
        />
      </Stagger>

      <Reveal>
        <SectionLabel>Method</SectionLabel>
        <Card className="surface mb-6">
          <CardContent className="py-5">
            <p className="type-body mb-5 text-foreground">
              A raw average can be misleading if an ingredient happened to be tested mostly in favourable conditions --
              the adjusted ranking below controls for context. The two methods agree {manifest.descriptive_vs_adjusted_agreement_pct.toFixed(0)}% of the time.
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
              {METHOD_STEPS.map((step) => (
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

      <Reveal delay={0.04}>
        <SectionLabel>Class definitions</SectionLabel>
        <Card className="surface mb-6">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Adjusted effect over matched control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {classCounts.map(({ cls, count }) => (
                <div key={cls} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant={CLASS_BADGE_VARIANT[cls] ?? "secondary"} className="h-6 px-2 text-[11px]">{cls}</Badge>
                    <span className="font-mono text-[11px] text-muted-foreground">{((count / rankings.length) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="numeral text-lg font-semibold text-foreground">{count} ingredients</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.06}>
        <SectionLabel>Extremes</SectionLabel>
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <Card className="surface">
            <CardHeader>
              <CardTitle className="text-sm">Highest adjusted effect</CardTitle>
              <CardDescription>Top 10 ingredients, controlling for the context they were tested in.</CardDescription>
            </CardHeader>
            <CardContent><BarHChart data={top10} height={280} color="var(--success)" /></CardContent>
          </Card>
          <Card className="surface">
            <CardHeader>
              <CardTitle className="text-sm">Lowest adjusted effect</CardTitle>
              <CardDescription>Bottom 10 -- some may reduce shelf life relative to a matched control.</CardDescription>
            </CardHeader>
            <CardContent><BarHChart data={bottom10} height={280} color="var(--destructive)" /></CardContent>
          </Card>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <SectionLabel>Full ranking</SectionLabel>
        <Card className="surface">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div>
                <CardTitle className="text-sm">All {rankings.length} ingredients</CardTitle>
                <CardDescription className="mt-0.5">Sortable by any column; search by name or family.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <IngredientTable rankings={rankings} families={families} />
          </CardContent>
        </Card>
      </Reveal>
    </PageBody>
  );
}
