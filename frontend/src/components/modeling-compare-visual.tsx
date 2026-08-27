"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ModelSummary } from "@/lib/api";

export function ModelingCompareVisual({ models }: { models: ModelSummary[] }) {
  const data = models.map((model) => ({
    name: shortName(model.label),
    validation: model.validation_rmse,
    test: model.test_rmse,
  }));

  return (
    <div className="h-[205px] w-full sm:h-[218px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, bottom: 2, left: -12 }} barGap={4}>
          <defs>
            <linearGradient id="modeling-val-bars" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff7fa" />
              <stop offset="100%" stopColor="#edb9c7" />
            </linearGradient>
            <linearGradient id="modeling-test-bars" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f6dde4" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,.12)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,.82)", fontSize: 9.5 }}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={38}
            tick={{ fill: "rgba(255,255,255,.72)", fontSize: 9.5 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,.05)" }}
            formatter={(value, name) => [Number(value).toFixed(2), name === "validation" ? "Validation RMSE" : "Test RMSE"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.18)",
              background: "rgba(77,10,31,.94)",
              color: "white",
              boxShadow: "0 18px 44px -24px rgba(0,0,0,.55)",
              fontSize: 11,
            }}
            labelStyle={{ color: "white", fontWeight: 600 }}
          />
          <Bar dataKey="validation" fill="url(#modeling-val-bars)" radius={[5, 5, 1, 1]} maxBarSize={28} />
          <Bar dataKey="test" fill="url(#modeling-test-bars)" radius={[5, 5, 1, 1]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function shortName(label: string) {
  if (label === "Explainable Boosting Machine") return "Explainable BM";
  if (label === "Random Forest") return "Random Forest";
  return label;
}
