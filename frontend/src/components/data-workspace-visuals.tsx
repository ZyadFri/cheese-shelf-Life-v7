"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HistogramTone = "burgundy" | "blue";
type BarTone = "burgundy" | "amber";

const HISTOGRAM_TONES = {
  burgundy: {
    start: "#7e1634",
    end: "#d35d7c",
    line: "#9f2749",
    grid: "rgba(128, 52, 73, 0.13)",
    text: "#8c6672",
  },
  blue: {
    start: "#2f6196",
    end: "#77a9dc",
    line: "#3f73aa",
    grid: "rgba(56, 100, 147, 0.13)",
    text: "#677f96",
  },
} as const;

const BAR_TONES = {
  burgundy: { start: "#8a1737", end: "#db6c88", text: "#745b64" },
  amber: { start: "#a96500", end: "#dea54a", text: "#755f4a" },
} as const;

export function FancyHistogram({
  counts,
  edges,
  tone,
  xLabel,
}: {
  counts: number[];
  edges: number[];
  tone: HistogramTone;
  xLabel: string;
}) {
  const palette = HISTOGRAM_TONES[tone];
  const gradientId = `histogram-${tone}`;
  const data = counts.map((count, index) => {
    const left = edges[index] ?? index;
    const right = edges[index + 1] ?? left;
    return {
      count,
      x: (left + right) / 2,
    };
  });
  const interval = Math.max(0, Math.ceil(data.length / 7) - 1);

  return (
    <div className="h-[236px] w-full sm:h-[252px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 8, left: -8 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.start} stopOpacity={0.98} />
              <stop offset="100%" stopColor={palette.end} stopOpacity={0.74} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={palette.grid} strokeDasharray="3 5" />
          <XAxis
            dataKey="x"
            interval={interval}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: palette.text }}
            tickFormatter={(value) => compactNumber(Number(value))}
            label={{ value: xLabel, position: "insideBottom", offset: -4, fontSize: 10, fill: palette.text }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={42}
            tick={{ fontSize: 10, fill: palette.text }}
            tickFormatter={(value) => compactNumber(Number(value))}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,.28)" }}
            formatter={(value) => [Number(value).toLocaleString(), "Rows"]}
            labelFormatter={(value) => `${Number(value).toFixed(1)} ${xLabel}`}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(121, 71, 87, .14)",
              background: "rgba(255,255,255,.96)",
              boxShadow: "0 16px 40px -24px rgba(77, 27, 44, .48)",
              fontSize: 11,
            }}
          />
          <Bar dataKey="count" fill={`url(#${gradientId})`} radius={[7, 7, 2, 2]} maxBarSize={28} />
          <Line
            type="monotone"
            dataKey="count"
            stroke={palette.line}
            strokeWidth={1.8}
            dot={false}
            activeDot={false}
            opacity={0.58}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FancyHorizontalBars({
  data,
  tone,
  height = 230,
}: {
  data: { label: string; value: number }[];
  tone: BarTone;
  height?: number;
}) {
  const palette = BAR_TONES[tone];
  const gradientId = `bars-${tone}`;
  const visible = data.slice(0, 10);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={visible} layout="vertical" margin={{ top: 4, right: 34, bottom: 4, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={palette.start} stopOpacity={0.98} />
              <stop offset="100%" stopColor={palette.end} stopOpacity={0.82} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal={false} stroke="rgba(115, 78, 88, .10)" strokeDasharray="3 5" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: palette.text }}
            tickFormatter={(value) => compactNumber(Number(value))}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={118}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9.5, fill: palette.text }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,.24)" }}
            formatter={(value) => [Number(value).toLocaleString(), "Rows"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(121, 71, 87, .14)",
              background: "rgba(255,255,255,.96)",
              boxShadow: "0 16px 40px -24px rgba(77, 27, 44, .48)",
              fontSize: 11,
            }}
          />
          <Bar dataKey="value" fill={`url(#${gradientId})`} radius={[0, 7, 7, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function compactNumber(value: number) {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) >= 1000) {
    const decimals = Math.abs(value) >= 10000 ? 0 : 1;
    return `${(value / 1000).toFixed(decimals).replace(/\.0$/, "")}k`;
  }
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(1).replace(/\.0$/, "");
}
