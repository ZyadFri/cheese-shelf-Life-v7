"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS_TICK, CHART_CATEGORY_TICK, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE, truncateTick } from "./chart-theme";

export function BarHChart({
  data,
  color = "var(--primary)",
  height = 240,
  labelWidth = 140,
  colorOf,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  /** Width reserved for the category axis. Widen it when labels are long
   * (e.g. raw feature names) so they aren't cut mid-word. */
  labelWidth?: number;
  /** Optional per-bar color (e.g. positive/negative attribution, or a
   * category's semantic tone) -- when omitted every bar uses `color`,
   * unchanged from before. */
  colorOf?: (value: number, index: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
        <XAxis type="number" tick={CHART_AXIS_TICK} tickLine={false} axisLine={{ stroke: "var(--chart-grid)" }} />
        <YAxis
          dataKey="label"
          type="category"
          width={labelWidth}
          tick={CHART_CATEGORY_TICK}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => truncateTick(v, Math.floor(labelWidth / 7))}
        />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
        <Bar dataKey="value" fill={color} radius={[0, 3, 3, 0]} isAnimationActive animationDuration={500}>
          {colorOf && data.map((d, i) => <Cell key={i} fill={colorOf(d.value, i)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
