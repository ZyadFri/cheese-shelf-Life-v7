"use client";

import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { CHART_AXIS_TICK, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE } from "./chart-theme";

export function ActualVsPredictedChart({
  points,
  color = "var(--primary)",
  height = 280,
}: {
  points: { y_true: number; y_pred: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(1, ...points.map((p) => Math.max(p.y_true, p.y_pred))) * 1.05;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 8, right: 12, left: 16, bottom: 16 }}>
        <CartesianGrid stroke="var(--chart-grid)" />
        {/* Predicted values for this model can run into the hundreds of days,
            so the tick labels are 3-4 digits wide -- a tight/negative left
            margin here previously made the rotated axis title overlap them.
            Recharts derives tick *values* from the domain without rounding
            them for display, so without a formatter these render as raw
            floats like "396.7978614869703" instead of "400". */}
        <XAxis type="number" dataKey="y_true" name="Actual" domain={[0, max]} tickFormatter={(v: number) => Math.round(v).toLocaleString()} tick={CHART_AXIS_TICK} tickLine={false} axisLine={{ stroke: "var(--chart-grid)" }} label={{ value: "Actual (days)", position: "bottom", offset: 0, fontSize: 10, fill: "var(--chart-axis)" }} />
        <YAxis type="number" dataKey="y_pred" name="Predicted" domain={[0, max]} width={48} tickFormatter={(v: number) => Math.round(v).toLocaleString()} tick={CHART_AXIS_TICK} tickLine={false} axisLine={false} label={{ value: "Predicted (days)", angle: -90, position: "left", offset: 0, fontSize: 10, fill: "var(--chart-axis)" }} />
        <ReferenceLine segment={[{ x: 0, y: 0 }, { x: max, y: max }]} stroke="var(--destructive)" strokeDasharray="4 4" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} formatter={(v) => (typeof v === "number" ? v.toFixed(1) : v)} />
        <Scatter data={points} fill={color} fillOpacity={0.58} isAnimationActive animationDuration={500} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
