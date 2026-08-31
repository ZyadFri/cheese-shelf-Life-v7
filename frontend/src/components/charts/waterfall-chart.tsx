"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS_TICK, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE, truncateTick } from "./chart-theme";

export interface WaterfallBar {
  name: string;
  /** Bottom of the visible segment (the smaller of start/end running total). */
  base: number;
  /** Height of the visible segment (the |contribution|, or the full value for a total bar). */
  size: number;
  kind: "total" | "positive" | "negative";
  /** Original contribution, shown in the tooltip with a sign; undefined for total bars. */
  contribution?: number;
  displayValue?: string | null;
}

const COLORS: Record<WaterfallBar["kind"], string> = {
  total: "#7a1b2e",
  positive: "#1f8a5a",
  negative: "#c73b3b",
};

export function WaterfallChart({ bars, height = 280 }: { bars: WaterfallBar[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={bars} margin={{ top: 8, right: 12, left: -4, bottom: 34 }} barCategoryGap="18%">
        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ ...CHART_AXIS_TICK, fontSize: 9.5 }}
          tickLine={false}
          axisLine={{ stroke: "var(--chart-grid)" }}
          interval={0}
          angle={-32}
          textAnchor="end"
          height={56}
          tickFormatter={(value: string) => truncateTick(value, 16)}
        />
        <YAxis tick={CHART_AXIS_TICK} tickLine={false} axisLine={false} width={38} unit="d" />
        <Tooltip
          cursor={{ fill: "color-mix(in srgb, var(--primary) 5%, transparent)" }}
          contentStyle={CHART_TOOLTIP_STYLE}
          labelStyle={CHART_TOOLTIP_LABEL_STYLE}
          formatter={(_value, _n, item) => {
            const bar = item.payload as WaterfallBar;
            if (bar.kind === "total") return [`${(bar.base + bar.size).toFixed(1)} d`, "Value"];
            const sign = (bar.contribution ?? 0) >= 0 ? "+" : "";
            return [`${sign}${(bar.contribution ?? 0).toFixed(1)} d${bar.displayValue ? ` · ${bar.displayValue}` : ""}`, "Contribution"];
          }}
        />
        <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="size" stackId="wf" radius={[3, 3, 3, 3]} isAnimationActive animationDuration={550}>
          {bars.map((bar, index) => (
            <Cell key={index} fill={COLORS[bar.kind]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
