"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ModelSummary } from "@/lib/api";
import { CHART_AXIS_TICK, CHART_LEGEND_STYLE, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE, truncateTick } from "./chart-theme";

export function ModelCompareChart({ models }: { models: ModelSummary[] }) {
  // Full label kept in the data so the tooltip always shows the complete
  // model name; only the axis tick below is shortened for space.
  const data = models.map((m) => ({
    name: m.label,
    "Validation RMSE": Number(m.validation_rmse.toFixed(3)),
    "Test RMSE": Number(m.test_rmse.toFixed(3)),
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={CHART_AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: "var(--chart-grid)" }}
          tickFormatter={(v: string) => truncateTick(v)}
        />
        <YAxis tick={CHART_AXIS_TICK} tickLine={false} axisLine={false} width={36} />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
        <Legend wrapperStyle={CHART_LEGEND_STYLE} />
        <Bar dataKey="Validation RMSE" fill="var(--primary)" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={550} />
        <Bar dataKey="Test RMSE" fill="var(--chart-2)" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={550} />
      </BarChart>
    </ResponsiveContainer>
  );
}
