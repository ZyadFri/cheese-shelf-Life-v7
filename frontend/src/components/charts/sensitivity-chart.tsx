"use client";

import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS_TICK, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE } from "./chart-theme";

/** A real what-if curve: every (x, y) is a genuine prediction from the same
 * specialist/model with only this one feature varied, never an
 * interpolation or surrogate. The reference dot marks this formulation's
 * actual input, which is always a real point on the curve (inserted into
 * the sweep itself), not an approximation of it. */
export function SensitivityChart({
  points,
  actualX,
  actualY,
  unit,
  height = 200,
}: {
  points: { x: number; y: number }[];
  actualX: number;
  actualY: number | null;
  unit?: string | null;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={points} margin={{ top: 8, right: 14, left: -8, bottom: 4 }}>
        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
        <XAxis
          dataKey="x"
          type="number"
          domain={["dataMin", "dataMax"]}
          tick={CHART_AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: "var(--chart-grid)" }}
          unit={unit ? ` ${unit}` : undefined}
          tickFormatter={(value: number) => Number(value.toFixed(1)).toString()}
        />
        <YAxis tick={CHART_AXIS_TICK} tickLine={false} axisLine={false} width={36} unit="d" />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          labelStyle={CHART_TOOLTIP_LABEL_STYLE}
          formatter={(value) => [`${Number(value).toFixed(1)} d`, "Predicted"]}
          labelFormatter={(label) => `${Number(Number(label).toFixed(2))}${unit ? ` ${unit}` : ""}`}
        />
        <Line type="monotone" dataKey="y" stroke="#a32348" strokeWidth={1.75} dot={false} isAnimationActive animationDuration={550} />
        {actualY !== null && (
          <ReferenceDot x={actualX} y={actualY} r={4.5} fill="#a32348" stroke="#fff" strokeWidth={1.5} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
