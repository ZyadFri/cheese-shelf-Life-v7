import type { ComponentType } from "react";
import { Database, Gauge, Layers, Target } from "lucide-react";

import { api } from "@/lib/api";
import { PageBody } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { IngredientEfficacyDashboard } from "@/components/ingredient-efficacy-dashboard";

export default async function IngredientsPage() {
  const health = await api.ingredientRankingHealth();

  if (!health.available) {
    return (
      <PageBody className="!max-w-[1420px]">
        <div className="mb-7 border-b border-border pb-5">
          <span className="mb-3 block h-[2px] w-8 rounded-full bg-primary" />
          <h1 className="type-h1 text-foreground">Ingredient Efficacy</h1>
          <p className="type-body mt-2 text-muted-foreground">Ingredient efficacy ranking is not available yet.</p>
        </div>
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

  return (
    <PageBody className="!max-w-[1420px] pt-5">
      <div className="mb-4 grid items-end gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="pb-1">
          <span className="mb-3 block h-[2px] w-8 rounded-full bg-primary" />
          <h1 className="font-serif text-[36px] leading-[0.98] tracking-[-0.035em] text-[#282126]">Ingredient Efficacy</h1>
          <p className="mt-3 max-w-[34ch] text-[12px] leading-[1.5] text-[#766a6f]">Visualize how each ingredient performs in context.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Ingredients ranked"
            value={String(manifest.n_ingredients)}
            suffix={`of ${rankings.length}`}
            icon={Database}
            tone="rose"
          />
          <MetricCard
            label="Classes"
            value={String(class_definitions.class_names.length)}
            suffix={class_definitions.class_names.join(" / ")}
            icon={Layers}
            tone="neutral"
          />
          <MetricCard
            label="Regression fit (R²)"
            value={`${(manifest.regression_in_sample_r2 * 100).toFixed(1)}%`}
            icon={Target}
            tone="rose"
          />
          <MetricCard
            label="Out-of-sample stability"
            value={manifest.rank_stability_spearman_vs_test_split !== null ? manifest.rank_stability_spearman_vs_test_split.toFixed(2) : "n/a"}
            icon={Gauge}
            tone="green"
          />
        </div>
      </div>

      <IngredientEfficacyDashboard
        rankings={rankings}
        families={families}
        agreementPct={manifest.descriptive_vs_adjusted_agreement_pct}
      />
    </PageBody>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: ComponentType<{ className?: string }>;
  tone: "rose" | "neutral" | "green";
}) {
  const iconTone = tone === "green"
    ? "bg-[#e5f3eb] text-[#16845a]"
    : tone === "neutral"
      ? "bg-[#f3f3f4] text-[#7d7f86]"
      : "bg-[#f7e6eb] text-[#9b2949]";

  return (
    <div className="relative min-h-[92px] overflow-hidden rounded-[16px] border border-[#e7dde0] bg-white px-4 py-3.5 shadow-[0_16px_38px_-34px_rgba(72,24,39,.42)]">
      <div className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-[10px] ${iconTone}`}>
        <Icon className="size-3.5" />
      </div>
      <p className="pr-10 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#8a7f84]">{label}</p>
      <div className="mt-2 flex items-end gap-1.5">
        <span className="font-serif text-[26px] leading-none tracking-[-0.025em] text-[#252025]">{value}</span>
        {suffix && <span className="mb-0.5 text-[9px] text-[#8a7f84]">{suffix}</span>}
      </div>
    </div>
  );
}
