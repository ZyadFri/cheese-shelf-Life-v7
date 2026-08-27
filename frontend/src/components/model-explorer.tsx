"use client";

import * as React from "react";

import { api, type ModelSummary, type ModelDetails } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LineCurveChart } from "@/components/charts/line-curve-chart";
import { BarHChart } from "@/components/charts/bar-h-chart";
import { ActualVsPredictedChart } from "@/components/charts/scatter-chart";

export function ModelExplorer({ models }: { models: ModelSummary[] }) {
  const [active, setActive] = React.useState(models[0]?.id ?? "");
  const [cache, setCache] = React.useState<Record<string, ModelDetails>>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!active || cache[active]) return;
    setLoading(true);
    api.modelDetails(active)
      .then((details) => setCache((prev) => ({ ...prev, [active]: details })))
      .finally(() => setLoading(false));
  }, [active, cache]);

  const details = cache[active];

  return (
    <section className="overflow-hidden rounded-[20px] border border-[#eadfe3] bg-white/92 shadow-[0_18px_48px_-40px_rgba(79,28,45,.38)]">
      <div className="border-b border-[#eee5e8] px-4 py-3.5 sm:px-5">
        <h2 className="text-[0.86rem] font-semibold tracking-[-0.015em] text-[#241b1f]">Model diagnostics</h2>
        <p className="mt-0.5 text-[0.58rem] text-[#928087]">Complete metrics, training curve, and feature importance per model.</p>
      </div>

      <div className="p-3.5 sm:p-4">
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="mb-3 h-auto w-full justify-start gap-4 overflow-x-auto rounded-none border-b border-[#eee5e8] bg-transparent p-0">
            {models.map((model) => (
              <TabsTrigger
                key={model.id}
                value={model.id}
                className="rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2 pt-0 text-[0.55rem] font-medium text-[#7f7076] shadow-none data-[state=active]:border-[#9e1d41] data-[state=active]:bg-transparent data-[state=active]:text-[#8f1839]"
              >
                {model.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {models.map((model) => (
            <TabsContent key={model.id} value={model.id} className="mt-0">
              {active === model.id && (
                loading && !details ? <DetailsSkeleton /> : details ? <DetailsPanel details={details} /> : null
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

function DetailsSkeleton() {
  return (
    <div className="grid gap-3 xl:grid-cols-[1.18fr_.9fr_.9fr_.92fr_.92fr]">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-[250px] w-full rounded-[16px]" />
      ))}
    </div>
  );
}

function DetailsPanel({ details }: { details: ModelDetails }) {
  const metrics = details.metrics;
  const permutation = Object.entries(details.feature_importance.permutation ?? {})
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 7)
    .reverse()
    .map(([label, value]) => ({ label, value: Number(value.toFixed(4)) }));

  const native = details.feature_importance.native
    ? Object.entries(details.feature_importance.native)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 7)
        .reverse()
        .map(([label, value]) => ({ label, value: Number(value.toFixed(4)) }))
    : null;

  return (
    <div className="grid gap-3 xl:grid-cols-[1.18fr_.9fr_.9fr_.92fr_.92fr]">
      <DiagnosticCard title="Model diagnostics" className="bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[290px] border-collapse text-[0.55rem]">
            <thead>
              <tr className="border-b border-[#eee5e8] text-left uppercase tracking-[0.06em] text-[#a08f96]">
                <th className="pb-2 font-medium">Split</th>
                <th className="pb-2 text-right font-medium">R²</th>
                <th className="pb-2 text-right font-medium">RMSE</th>
                <th className="pb-2 text-right font-medium">MAE</th>
                <th className="pb-2 text-right font-medium">Median AE</th>
              </tr>
            </thead>
            <tbody>
              {(["train", "validation", "test"] as const).map((split) => (
                <tr key={split} className="border-b border-[#f2ebed] last:border-0">
                  <td className="py-2.5 capitalize text-[#3c3035]">{split}</td>
                  <MetricCell value={metrics[`${split}_r2`] as number} digits={3} />
                  <MetricCell value={metrics[`${split}_rmse`] as number} digits={2} />
                  <MetricCell value={metrics[`${split}_mae`] as number} digits={2} />
                  <MetricCell value={metrics[`${split}_median_ae`] as number} digits={2} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DiagnosticCard>

      <DiagnosticCard title="Actual vs. predicted (test)" className="bg-[linear-gradient(145deg,#fff,#fff9fa)]">
        <ActualVsPredictedChart points={details.scatter.test} height={205} color="#9d2849" />
      </DiagnosticCard>

      <DiagnosticCard title="Training diagnostic" className="bg-[linear-gradient(145deg,#fff,#f5f9ff)]">
        {details.curves ? (
          details.curves.type === "loss_curve" ? (
            <LineCurveChart
              height={205}
              series={[
                { name: "train loss", color: "#941c3f", points: details.curves.train_loss ?? [] },
                { name: "validation loss", color: "#4878b2", points: details.curves.val_loss ?? [] },
              ]}
              xLabel="Boosting round / epoch"
            />
          ) : (
            <LineCurveChart
              height={205}
              series={[
                { name: "train R²", color: "#941c3f", points: details.curves.train_r2 ?? [] },
                { name: "validation R²", color: "#4878b2", points: details.curves.val_r2 ?? [] },
              ]}
              xLabel="Training-set size step"
            />
          )
        ) : (
          <EmptyChart message="No curve stored for this model." />
        )}
      </DiagnosticCard>

      <DiagnosticCard
        title="Permutation importance"
        subtitle="cross-model consistent"
        className="overflow-hidden bg-[radial-gradient(circle_at_88%_18%,rgba(208,104,135,.18),transparent_34%),linear-gradient(145deg,#fff,#fff1f5)]"
      >
        <BarHChart data={permutation} color="#a32348" height={205} labelWidth={105} />
      </DiagnosticCard>

      <DiagnosticCard
        title="Native importance"
        className="overflow-hidden bg-[radial-gradient(circle_at_88%_18%,rgba(224,164,56,.18),transparent_35%),linear-gradient(145deg,#fff,#fff8e9)]"
      >
        {native ? (
          <BarHChart data={native} color="#b06d00" height={205} labelWidth={105} />
        ) : (
          <EmptyChart message="No native importance for this model family." />
        )}
      </DiagnosticCard>
    </div>
  );
}

function DiagnosticCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article className={`min-w-0 rounded-[16px] border border-[#eadfe3] p-3 shadow-[0_12px_32px_-28px_rgba(75,27,43,.42)] ${className ?? ""}`}>
      <h3 className="text-[0.68rem] font-semibold leading-tight text-[#251b1f]">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[0.48rem] text-[#8e7982]">{subtitle}</p>}
      <div className="mt-2">{children}</div>
    </article>
  );
}

function MetricCell({ value, digits }: { value: number | undefined; digits: number }) {
  return <td className="py-2.5 text-right tabular-nums text-[#45383d]">{Number.isFinite(value) ? value!.toFixed(digits) : "—"}</td>;
}

function EmptyChart({ message }: { message: string }) {
  return <div className="flex h-[205px] items-center justify-center px-4 text-center text-[0.54rem] text-[#97858d]">{message}</div>;
}
