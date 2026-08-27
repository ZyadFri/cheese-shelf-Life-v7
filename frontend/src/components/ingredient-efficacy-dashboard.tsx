"use client";

import * as React from "react";
import {
  Database,
  Download,
  FlaskConical,
  Gauge,
  GitCompareArrows,
  Info,
  Search,
  ShieldCheck,
} from "lucide-react";

import type { IngredientRanking } from "@/lib/api";
import { IngredientDetailSheet } from "@/components/ingredient-detail-sheet";

const TIER_ORDER = ["High", "Medium", "Low"] as const;
type Tier = (typeof TIER_ORDER)[number];

const TIER_STYLE: Record<Tier, { dot: string; text: string; border: string; pill: string }> = {
  High: {
    dot: "#149060",
    text: "text-[#137a52]",
    border: "border-[#cce9db]",
    pill: "bg-[#e0f3e9] text-[#137a52]",
  },
  Medium: {
    dot: "#e2a21e",
    text: "text-[#b67508]",
    border: "border-[#f2dfb8]",
    pill: "bg-[#fbefd8] text-[#a86c07]",
  },
  Low: {
    dot: "#e15151",
    text: "text-[#c43e43]",
    border: "border-[#f1d1d3]",
    pill: "bg-[#fde5e5] text-[#c63e43]",
  },
};

function displayName(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function signedPct(value: number, decimals = 1) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function IngredientEfficacyDashboard({
  rankings,
  families,
  agreementPct,
}: {
  rankings: IngredientRanking[];
  families: string[];
  agreementPct: number;
}) {
  const [query, setQuery] = React.useState("");
  const [family, setFamily] = React.useState("all");
  const [tier, setTier] = React.useState<"all" | Tier>("all");
  const [selected, setSelected] = React.useState<IngredientRanking | null>(null);

  const sorted = React.useMemo(
    () => [...rankings].sort((a, b) => b.adjusted_effect_pct - a.adjusted_effect_pct),
    [rankings],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((row) => {
      if (family !== "all" && row.ingredient_family !== family) return false;
      if (tier !== "all" && row.efficacy_class !== tier) return false;
      if (q && !row.ingredient_name.toLowerCase().includes(q) && !row.ingredient_family.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sorted, query, family, tier]);

  const grouped = React.useMemo(
    () => Object.fromEntries(TIER_ORDER.map((name) => [name, sorted.filter((row) => row.efficacy_class === name)])) as Record<Tier, IngredientRanking[]>,
    [sorted],
  );

  function exportCsv() {
    const headers = ["rank", "ingredient", "family", "tier", "adjusted_effect_pct", "evidence_n", "raw_effect_pct"];
    const rows = filtered.map((row) => [
      row.rank,
      row.ingredient_name,
      row.ingredient_family,
      row.efficacy_class,
      row.adjusted_effect_pct,
      row.n_train,
      row.descriptive_mean_pct,
    ]);
    const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "ingredient-efficacy-ranking.csv";
    anchor.click();
    URL.revokeObjectURL(href);
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_250px]">
        <EfficacyLandscape rankings={sorted} onSelect={setSelected} />

        <aside className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[18px] border border-[#eadfe2] bg-white p-4 shadow-[0_18px_45px_-38px_rgba(72,24,39,.36)]">
            <h3 className="text-[14px] font-semibold text-[#35272d]">About this analysis</h3>
            <p className="mt-1.5 text-[10.5px] leading-[1.55] text-[#74666b]">
              Adjusted effect estimates how an ingredient performs in context, controlling for formulation and study conditions.
            </p>
            <div className="mt-4 space-y-3">
              <MethodRow icon={Database} label="Match to control" />
              <MethodRow icon={GitCompareArrows} label="Compute improvement %" />
              <MethodRow icon={FlaskConical} label="Adjust for context (regression)" />
              <MethodRow icon={Gauge} label="Check it holds up out-of-sample" />
            </div>
          </div>

          <div className="rounded-[18px] border border-[#eadfe2] bg-white p-4 shadow-[0_18px_45px_-38px_rgba(72,24,39,.36)]">
            <h3 className="text-[14px] font-semibold text-[#35272d]">Understanding adjusted effect</h3>
            <p className="mt-1.5 text-[10.5px] leading-[1.5] text-[#74666b]">Positive values indicate better performance versus the matched control after context adjustment.</p>
            <div className="mt-4 flex justify-between text-[9px] font-semibold">
              <span className="text-[#c43e43]">Negative</span>
              <span className="text-[#8a7d82]">0</span>
              <span className="text-[#137a52]">Positive</span>
            </div>
            <div className="relative mt-2 h-2 rounded-full bg-[linear-gradient(90deg,#d94c51_0%,#f4caca_38%,#f2eee9_50%,#caead8_64%,#148d5e_100%)]">
              <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#d86f71] shadow" />
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-[#9a8d92]"><span>Worse</span><span>No change</span><span>Better</span></div>
            <div className="mt-5 flex items-center gap-2 rounded-[12px] border border-[#d8ece2] bg-[#eef8f3] px-3 py-2.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-white text-[#16845a] shadow-sm"><ShieldCheck className="size-3.5" /></span>
              <p className="text-[10px] font-medium leading-[1.35] text-[#426a58]">Two ranking methods agree <span className="font-semibold">{agreementPct.toFixed(0)}%</span> of the time.</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {TIER_ORDER.map((name) => (
          <TierSummaryCard
            key={name}
            tier={name}
            rows={grouped[name]}
            active={tier === name}
            onView={() => setTier((current) => current === name ? "all" : name)}
          />
        ))}
      </div>

      <section className="mt-4 overflow-hidden rounded-[19px] border border-[#e7dde0] bg-white shadow-[0_22px_55px_-46px_rgba(73,24,40,.38)]">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#eee5e7] px-5 py-4">
          <div>
            <h2 className="font-serif text-[21px] leading-none tracking-[-0.02em] text-[#2d2327]">All {rankings.length} ingredients</h2>
            <p className="mt-1.5 text-[10.5px] text-[#81757a]">Sorted by adjusted effect (high to low).</p>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <label className="relative min-w-[220px] max-w-[280px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#9a8c91]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ingredient or family…"
                className="h-9 w-full rounded-[10px] border border-[#e4dade] bg-white pl-9 pr-3 text-[11px] text-[#493a40] outline-none transition focus:border-[#c78498] focus:ring-2 focus:ring-[#f4e4e9]"
              />
            </label>
            <select
              value={family}
              onChange={(event) => setFamily(event.target.value)}
              className="h-9 min-w-[150px] rounded-[10px] border border-[#e4dade] bg-white px-3 text-[10.5px] text-[#59484f] outline-none"
            >
              <option value="all">All families</option>
              {families.map((item) => <option key={item} value={item}>{displayName(item)}</option>)}
            </select>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#e1d3d8] bg-white px-3 text-[10px] font-semibold text-[#6f3045] transition hover:bg-[#fff6f8]"
            >
              <Download className="size-3.5" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr className="border-b border-[#eee5e7] text-left text-[9.5px] uppercase tracking-[0.04em] text-[#8e8287]">
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-3 py-3 font-medium">Ingredient</th>
                <th className="px-3 py-3 font-medium">Family</th>
                <th className="px-3 py-3 text-center font-medium">Tier</th>
                <th className="px-3 py-3 text-right font-medium">Adjusted effect</th>
                <th className="px-3 py-3 text-right font-medium">Evidence (n)</th>
                <th className="px-5 py-3 text-right font-medium">Raw effect %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const style = TIER_STYLE[(row.efficacy_class as Tier)] ?? TIER_STYLE.Medium;
                return (
                  <tr
                    key={row.ingredient_name}
                    onClick={() => setSelected(row)}
                    className="cursor-pointer border-b border-[#f1eaec] text-[11px] transition-colors last:border-b-0 hover:bg-[#fff9fa]"
                  >
                    <td className="px-5 py-3 tabular-nums text-[#7d7176]">{row.rank}</td>
                    <td className="px-3 py-3 font-medium text-[#382b31]">{displayName(row.ingredient_name)}</td>
                    <td className="px-3 py-3 text-[#82767b]">{displayName(row.ingredient_family)}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-semibold ${style.pill}`}>↗ {row.efficacy_class}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-[#303033]">
                      <span className={`inline-flex min-w-[62px] justify-center rounded-full px-2 py-1 ${row.adjusted_effect_pct >= 0 ? "bg-[#e5f4ec] text-[#147b53]" : "bg-[#fde8e8] text-[#c43e43]"}`}>
                        {signedPct(row.adjusted_effect_pct)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-[#756970]">
                      <span className="rounded-full border border-[#e6dde0] bg-[#fbfafb] px-2 py-1">{row.n_train}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums text-[#373034]">{signedPct(row.descriptive_mean_pct)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#eee5e7] px-5 py-3 text-[10px] text-[#887a80]">
          <span>{filtered.length} of {rankings.length} ingredients</span>
          {tier !== "all" && (
            <button type="button" onClick={() => setTier("all")} className="font-semibold text-[#8d1838] hover:underline">Clear {tier} filter</button>
          )}
        </div>
      </section>

      <IngredientDetailSheet ingredient={selected} open={selected !== null} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
}

function MethodRow({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#eadde1] bg-[#fff8fa] text-[#9c2949]"><Icon className="size-3.5" /></span>
      <span className="text-[10px] font-medium text-[#594a50]">{label}</span>
    </div>
  );
}

function TierSummaryCard({ tier, rows, active, onView }: { tier: Tier; rows: IngredientRanking[]; active: boolean; onView: () => void }) {
  const style = TIER_STYLE[tier];
  return (
    <div className={`rounded-[17px] border bg-white p-4 transition-all ${active ? `${style.border} shadow-[0_14px_34px_-26px_rgba(64,24,38,.32)]` : "border-[#e8dfe2]"}`}>
      <div className="flex items-center justify-between">
        <h3 className={`flex items-center gap-2 text-[13px] font-semibold ${style.text}`}><span className="size-2 rounded-full" style={{ backgroundColor: style.dot }} />{tier.toUpperCase()} <span className="text-[10px] font-medium opacity-70">({rows.length})</span></h3>
        <button type="button" onClick={onView} className={`rounded-[8px] border px-2 py-1 text-[9px] font-semibold transition hover:bg-[#fff8fa] ${style.border} ${style.text}`}>{active ? "Show all" : "View all"}</button>
      </div>
      <div className="mt-3 space-y-2">
        {rows.slice(0, 3).map((row) => (
          <div key={row.ingredient_name} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-[10px]">
            <span className="truncate text-[#45373d]">{displayName(row.ingredient_name)}</span>
            <span className={`rounded-full px-2 py-0.5 font-semibold tabular-nums ${row.adjusted_effect_pct >= 0 ? "bg-[#e7f4ed] text-[#147b53]" : "bg-[#fde9e9] text-[#c43e43]"}`}>{signedPct(row.adjusted_effect_pct)}</span>
            <span className="w-12 text-right tabular-nums text-[#8c7f84]">n={row.n_train}</span>
          </div>
        ))}
      </div>
      {rows.length > 3 && <p className="mt-2 text-[9px] text-[#92858a]">+{rows.length - 3} more</p>}
    </div>
  );
}

function EfficacyLandscape({ rankings, onSelect }: { rankings: IngredientRanking[]; onSelect: (row: IngredientRanking) => void }) {
  const minEffect = Math.min(...rankings.map((row) => row.adjusted_effect_pct), 0);
  const maxEffect = Math.max(...rankings.map((row) => row.adjusted_effect_pct), 0);
  const spread = Math.max(maxEffect - minEffect, 1);
  const pad = spread * 0.07;
  const minX = minEffect - pad;
  const maxX = maxEffect + pad;
  const xSpread = Math.max(maxX - minX, 1);
  const maxEvidence = Math.max(...rankings.map((row) => row.n_train), 1);
  const levels = [18, 50, 78, 34, 66];

  return (
    <section className="overflow-hidden rounded-[19px] border border-[#e7dde0] bg-white shadow-[0_22px_55px_-46px_rgba(73,24,40,.38)]">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div>
          <div className="flex items-center gap-2"><h2 className="font-serif text-[20px] tracking-[-0.02em] text-[#30252a]">Ingredient efficacy landscape</h2><Info className="size-3.5 text-[#93858a]" /></div>
          <p className="mt-1 text-[10px] text-[#81757a]">Each bubble is an ingredient. Size reflects evidence count (n). Color shows tier.</p>
        </div>
        <div className="flex items-center gap-4 text-[9.5px] text-[#74686d]">
          {TIER_ORDER.map((tier) => <span key={tier} className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ backgroundColor: TIER_STYLE[tier].dot }} />{tier}</span>)}
        </div>
      </div>

      <div className="overflow-x-auto px-4 pb-4 pt-3">
        <div className="relative h-[205px] min-w-[780px]">
          <div className="absolute inset-x-0 top-2 flex justify-between text-[9px] font-semibold uppercase tracking-[0.04em]"><span className="text-[#c43e43]">Negative effect</span><span className="text-[#137a52]">Positive effect</span></div>
          <div className="absolute inset-x-0 bottom-[34px] h-3 rounded-[2px] bg-[linear-gradient(90deg,#de666b_0%,#f1c5c6_36%,#ece7df_50%,#c6e8d6_65%,#299467_100%)]" />
          {rankings.map((row, index) => {
            const x = ((row.adjusted_effect_pct - minX) / xSpread) * 100;
            const size = 22 + Math.sqrt(row.n_train / maxEvidence) * 30;
            const y = levels[index % levels.length];
            const style = TIER_STYLE[(row.efficacy_class as Tier)] ?? TIER_STYLE.Medium;
            return (
              <button
                key={row.ingredient_name}
                type="button"
                onClick={() => onSelect(row)}
                className="group absolute -translate-x-1/2 text-center focus:outline-none"
                style={{ left: `${Math.max(2.5, Math.min(97.5, x))}%`, top: `${y}px`, width: `${Math.max(size + 36, 74)}px` }}
                title={`${displayName(row.ingredient_name)} · ${signedPct(row.adjusted_effect_pct)} · n=${row.n_train}`}
              >
                <span
                  className="mx-auto block rounded-full border-2 border-white/90 transition-transform duration-200 group-hover:scale-110"
                  style={{ width: size, height: size, background: `radial-gradient(circle at 35% 30%, white 0%, ${style.dot}55 38%, ${style.dot}bb 100%)`, boxShadow: `0 0 0 1px ${style.dot}45, 0 8px 20px -12px rgba(28,20,23,.5)` }}
                />
                <span className={`mt-1 block truncate text-[8.5px] font-semibold leading-tight ${style.text}`}>{displayName(row.ingredient_name)}</span>
              </button>
            );
          })}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-[#85787d]"><span>{minX.toFixed(0)}%</span><span>Adjusted effect relative to control</span><span>+{maxX.toFixed(0)}%</span></div>
        </div>
      </div>
    </section>
  );
}
