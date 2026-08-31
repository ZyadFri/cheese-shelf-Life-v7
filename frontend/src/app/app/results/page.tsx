"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FlaskConical, Trophy, TrendingUp } from "lucide-react";

import { getPredictionHistory, type PredictionHistoryEntry } from "@/lib/prediction-v6-history";
import { PageBody, PageHeader, Reveal, SectionLabel } from "@/components/page-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
}

function prettify(value: string): string {
  return value.replace(/_/g, " ");
}

export default function ResultsPage() {
  const [history, setHistory] = React.useState<PredictionHistoryEntry[] | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loaded = getPredictionHistory();
    setHistory(loaded);
    setSelectedId(loaded[0]?.id ?? null);
  }, []);

  // Still reading localStorage -- render nothing on the first frame so the
  // empty state never flashes before a real history is found.
  if (history === null) return null;

  if (history.length === 0) {
    return (
      <PageBody>
        <PageHeader title="Results" description="Your recent V6 predictions (up to the last 15)." />
        <Card className="surface">
          <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary/50">
              <FlaskConical className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No prediction yet</p>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">Go to the Prediction page, run through the wizard for a cheese, then it will show up here.</p>
            <Link href="/app/prediction" className={buttonVariants({ className: "mt-3" })}>Go to Prediction</Link>
          </CardContent>
        </Card>
      </PageBody>
    );
  }

  const selected = history.find((h) => h.id === selectedId) ?? history[0];
  const { control, candidates } = selected.result;
  const candidate = candidates[0];

  const comparisonData = [
    { name: "Control", value: control.prediction_days },
    { name: selected.treated ? candidate.candidate_name : "Untreated", value: candidate.predicted_candidate_shelf_life },
  ];

  return (
    <PageBody>
      <PageHeader title="Results" description="Your recent V6 predictions (up to the last 15)." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Control shelf life" numericValue={control.prediction_days} decimals={1} suffix=" d" icon={<FlaskConical className="h-4 w-4" />} animateIn />
        <KpiCard label={selected.treated ? "Treated result" : "Predicted"} numericValue={candidate.predicted_candidate_shelf_life} decimals={1} suffix=" d" icon={<Trophy className="h-4 w-4" />} tone="success" animateIn sub={`${prettify(selected.cheeseCategory)} · ${selected.cheeseName}`} />
        <KpiCard
          label="Improvement vs. control"
          numericValue={candidate.absolute_improvement_days}
          decimals={1}
          suffix=" d"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="primary"
          animateIn
          sub={candidate.relative_improvement_pct !== null ? `${candidate.relative_improvement_pct >= 0 ? "+" : ""}${candidate.relative_improvement_pct.toFixed(1)}%` : "n/a"}
        />
      </div>

      <SectionLabel>Comparison</SectionLabel>
      <Card className="surface mb-8">
        <CardHeader>
          <CardTitle className="text-sm">{selected.cheeseName} · {prettify(selected.cheeseCategory)} · {selected.physicalForm ? prettify(selected.physicalForm) : "—"}</CardTitle>
          <CardDescription>{prettify(selected.modelTask)} · {formatTime(selected.timestamp)}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={32} />
              <Tooltip cursor={{ fill: "color-mix(in srgb, var(--primary) 5%, transparent)" }} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={650} animationEasing="ease-out">
                {comparisonData.map((d, i) => <Cell key={i} fill={i === 0 ? "var(--muted-foreground)" : "var(--primary)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {candidate.warnings.length > 0 && (
            <div className="mt-4 space-y-1 border-t border-border pt-3">
              {candidate.warnings.map((warning, index) => <p key={index} className="text-xs leading-relaxed text-muted-foreground">• {warning}</p>)}
            </div>
          )}
        </CardContent>
      </Card>

      <Reveal>
        <SectionLabel>History (last {history.length})</SectionLabel>
        <Card className="surface">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Cheese</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead className="text-right">Control (d)</TableHead>
                  <TableHead className="text-right">Predicted (d)</TableHead>
                  <TableHead className="text-right">Δ days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry, i) => {
                  const c = entry.result.candidates[0];
                  const active = entry.id === selected.id;
                  return (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      onClick={() => setSelectedId(entry.id)}
                      className={active ? "bg-accent/50 cursor-pointer" : "row-interactive cursor-pointer"}
                    >
                      <TableCell className="text-muted-foreground">{formatTime(entry.timestamp)}</TableCell>
                      <TableCell className={active ? "font-semibold text-primary" : "font-medium"}>{entry.cheeseName}</TableCell>
                      <TableCell className="text-muted-foreground">{prettify(entry.cheeseCategory)}</TableCell>
                      <TableCell className="text-muted-foreground">{prettify(entry.modelTask)}</TableCell>
                      <TableCell className="text-right tabular-nums">{entry.result.control.prediction_days.toFixed(1)}</TableCell>
                      <TableCell className="text-right tabular-nums">{c.predicted_candidate_shelf_life.toFixed(1)}</TableCell>
                      <TableCell className={"text-right tabular-nums " + (c.absolute_improvement_days >= 0 ? "text-success" : "text-destructive")}>
                        {c.absolute_improvement_days >= 0 ? "+" : ""}{c.absolute_improvement_days.toFixed(1)}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Reveal>
    </PageBody>
  );
}
