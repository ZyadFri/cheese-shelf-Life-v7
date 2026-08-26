"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS_TICK, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE } from "./chart-theme";

export function HistogramChart({ counts, edges, color = "var(--primary)" }: { counts: number[]; edges: number[]; color?: string }) {
  const data = counts.map((c, i) => ({
    bin: `${edges[i].toFixed(1)}`,
    count: c,
  }));
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
        <XAxis
          dataKey="bin"
          tick={CHART_AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: "var(--chart-grid)" }}
          interval={3}
        />
        <YAxis
          tick={CHART_AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={44}
          allowDecimals={false}
          tickFormatter={compact}
        />
        <Tooltip
          cursor={{ fill: "color-mix(in srgb, var(--primary) 5%, transparent)" }}
          contentStyle={CHART_TOOLTIP_STYLE}
          labelStyle={CHART_TOOLTIP_LABEL_STYLE}
          labelFormatter={(v) => `≥ ${v}`}
          formatter={(v) => [Number(v).toLocaleString(), "rows"]}
        />
        <Bar dataKey="count" fill={color} radius={[2, 2, 0, 0]} isAnimationActive animationDuration={600} animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** 1200 -> "1.2k". Keeps the y-axis narrow without truncating to a bare "0". */
function compact(v: number) {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return String(v);
}
