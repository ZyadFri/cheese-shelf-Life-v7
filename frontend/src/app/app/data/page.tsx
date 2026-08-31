import Link from "next/link";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  Database,
  FlaskConical,
  Layers3,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
} from "lucide-react";

import { api } from "@/lib/api";
import { PageBody, Reveal } from "@/components/page-shell";
import { FancyHistogram, FancyHorizontalBars } from "@/components/data-workspace-visuals";

export default async function DataPage() {
  const [data, provenance, schema] = await Promise.all([
    api.datasetSynthetic(),
    api.datasetReal(),
    api.schema(),
  ]);

  const familyData = Object.entries(data.ingredient_families)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label: humanize(label), value }));

  const qualityEntries = Object.entries(provenance.quality_flags).sort((a, b) => b[1] - a[1]);
  const qualityTotal = qualityEntries.reduce((sum, [, value]) => sum + value, 0);
  const provenanceTotal = Object.values(provenance.generation_rules).reduce((sum, value) => sum + value, 0);
  const qualityCoverage = percentage(qualityTotal, data.total_rows);
  const provenanceCoverage = percentage(provenanceTotal, data.total_rows);
  const featureCount = schema.all_feature_columns.length;
  const topQuality = qualityEntries[0]?.[0] ? humanize(qualityEntries[0][0]) : "No quality flag";
  const topFamily = familyData[0];
  const shelfPeak = peakRange(data.shelf_life_histogram, data.shelf_life_bin_edges, "days");
  const temperaturePeak = peakRange(
    data.storage_temperature_histogram,
    data.storage_temperature_bin_edges,
    "°C",
  );

  const schemaRows = schema.all_feature_columns.map((column) => {
    if (schema.numeric_columns.includes(column)) {
      return {
        column,
        role: "numeric",
        dtype: "number",
        example: schema.numeric_ranges[column]?.median ?? "—",
      };
    }

    if (schema.binary_columns.includes(column)) {
      return {
        column,
        role: "binary",
        dtype: "binary",
        example: schema.control_template[column] ?? 0,
      };
    }

    return {
      column,
      role: "categorical",
      dtype: "category",
      example: schema.categorical_modes[column] ?? schema.categorical_options[column]?.[0] ?? "—",
    };
  });

  return (
    <PageBody className="relative isolate max-w-[1480px] overflow-hidden pb-16 pt-5 sm:px-5 lg:px-7">
      <DataBackdrop />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          <section className="relative overflow-hidden rounded-[28px] border border-[#efe2e6] bg-[linear-gradient(135deg,rgba(255,255,255,.96),rgba(255,247,250,.92))] px-5 py-6 shadow-[0_28px_76px_-58px_rgba(97,31,53,.48)] sm:px-7 lg:px-9">
            <div className="absolute inset-y-0 right-0 hidden w-[44%] overflow-hidden lg:block">
              <img
                src="/images/food-lab.jpg"
                alt=""
                className="h-full w-full object-cover opacity-[.16] mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_0%,rgba(255,249,251,.64)_44%,rgba(255,245,248,.30)_100%)]" />
              <div className="absolute -right-8 top-4 size-44 rounded-full bg-[#f3cbd6]/55 blur-3xl" />
              <div className="absolute bottom-2 right-8 h-28 w-44 overflow-hidden rounded-[24px] opacity-90 shadow-[0_22px_48px_-28px_rgba(88,32,49,.45)]">
                <img src="/marketing/cheeses.jpg" alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-white/28 mix-blend-screen" />
              </div>
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 h-[3px] w-10 rounded-full bg-[#9d1e42]" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1
                    className="text-[clamp(3.1rem,6vw,5.6rem)] leading-[.9] font-medium tracking-[-0.06em] text-[#161214]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Data
                  </h1>
                  <p className="mt-4 max-w-xl text-[0.88rem] leading-6 text-[#6f6569]">
                    A unified view of the training dataset that powers the cheese shelf-life workspace. One source of truth, one consistent pipeline.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:hidden">
                  <StatusPill>scientifically constrained</StatusPill>
                  <StatusPill muted>training-ready</StatusPill>
                </div>
              </div>
            </div>
          </section>

          <Reveal delay={0.02}>
            <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total rows" value={data.total_rows.toLocaleString()} sub="All records in dataset">
                <Database className="size-4" />
              </MetricCard>
              <MetricCard label="Contexts" value={data.contexts.toLocaleString()} sub="Environmental / processing settings">
                <FlaskConical className="size-4" />
              </MetricCard>
              <MetricCard label="Controls" value={data.controls.toLocaleString()} sub="Process control variables">
                <SlidersHorizontal className="size-4" />
              </MetricCard>
              <MetricCard label="Treatments" value={data.treatments.toLocaleString()} sub="Treatment rows">
                <Layers3 className="size-4" />
              </MetricCard>
            </section>
          </Reveal>

          <Reveal delay={0.04}>
            <section className="mt-4 grid gap-4 lg:grid-cols-2">
              <FancyPanel tone="burgundy" title="Shelf-life distribution (days)" description={`Target range ${data.target_min.toFixed(2)}–${data.target_max.toFixed(2)} days.`}>
                <FancyHistogram
                  counts={data.shelf_life_histogram}
                  edges={data.shelf_life_bin_edges}
                  tone="burgundy"
                  xLabel="Shelf life (days)"
                />
              </FancyPanel>

              <FancyPanel tone="blue" title="Storage-temperature distribution (°C)" description="Observed storage-temperature space across the current dataset.">
                <FancyHistogram
                  counts={data.storage_temperature_histogram}
                  edges={data.storage_temperature_bin_edges}
                  tone="blue"
                  xLabel="Temperature (°C)"
                />
              </FancyPanel>
            </section>
          </Reveal>

          <Reveal delay={0.06}>
            <section className="mt-4">
              <FancyPanel tone="amber" title="Ingredient family distribution" description="Distribution across non-control treatment rows.">
                <FancyHorizontalBars data={familyData} tone="burgundy" height={260} />
              </FancyPanel>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <section className="mt-4 overflow-hidden rounded-[22px] border border-[#eadfe2] bg-white/92 shadow-[0_22px_54px_-44px_rgba(78,27,44,.42)]">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#efe5e8] bg-[linear-gradient(100deg,#fff,#fff8fa)] px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-[10px] border border-[#ead7dd] bg-[#fff3f6] text-[#9c2446]">
                      <Table2 className="size-4" />
                    </span>
                    <h2 className="text-[0.9rem] font-semibold text-[#4d2634]">Schema preview</h2>
                  </div>
                  <p className="mt-2 text-[0.58rem] text-[#927f86]">
                    Generation method: {cleanGenerationMethod(data.generation_method)} · all {featureCount.toLocaleString()} model features shown below.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto px-4 pb-4 pt-2">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead>
                    <tr className="text-[0.52rem] font-semibold uppercase tracking-[0.08em] text-[#a08d94]">
                      <th className="border-b border-[#eee4e7] px-3 py-3">Column</th>
                      <th className="border-b border-[#eee4e7] px-3 py-3">Role</th>
                      <th className="border-b border-[#eee4e7] px-3 py-3">Type</th>
                      <th className="border-b border-[#eee4e7] px-3 py-3">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemaRows.map((row) => (
                      <tr key={row.column} className="group text-[0.65rem] transition-colors hover:bg-[#fff7f9]">
                        <td className="border-b border-[#f2e9ec] px-3 py-3 font-mono text-[#49383f]">{row.column}</td>
                        <td className="border-b border-[#f2e9ec] px-3 py-3 capitalize text-[#67565d]">{row.role}</td>
                        <td className="border-b border-[#f2e9ec] px-3 py-3 text-[#8a7880]">{row.dtype}</td>
                        <td className="max-w-[260px] truncate border-b border-[#f2e9ec] px-3 py-3 text-[#8a7880]">{formatSchemaExample(row.example)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </Reveal>

          <p className="mt-4 px-1 text-[0.52rem] leading-5 text-[#9b8990]">
            Provenance metadata is tracked by the backend and kept separate from model features to reduce leakage risk.
          </p>
        </main>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
          <section className="rounded-[22px] border border-[#eadfe2] bg-[linear-gradient(145deg,#fff,#fff8fa)] p-4.5 shadow-[0_22px_56px_-44px_rgba(83,31,48,.45)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.59rem] font-semibold uppercase tracking-[0.14em] text-[#9b3654]">Data quality at a glance</p>
              <ShieldCheck className="size-4 text-[#9b2446]" />
            </div>

            <div className="mt-4 space-y-4">
              <QualityRow
                label="Data quality"
                detail={topQuality}
                value={`${qualityCoverage.toFixed(0)}%`}
                progress={qualityCoverage}
                tone="green"
              />
              <QualityRow
                label="Provenance coverage"
                detail={`${Object.keys(provenance.generation_rules).length.toLocaleString()} generation rules`}
                value={`${provenanceCoverage.toFixed(0)}%`}
                progress={provenanceCoverage}
                tone="burgundy"
              />
              <QualityRow
                label="Feature space"
                detail={`${featureCount.toLocaleString()} model features`}
                value={featureCount.toLocaleString()}
                progress={100}
                tone="amber"
                numericOnly
              />
            </div>

            <div className="mt-5 rounded-[16px] border border-[#f0dde3] bg-[#fff1f5] p-3.5">
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.11em] text-[#922645]">About this dataset</p>
              <p className="mt-2 text-[0.57rem] leading-5 text-[#735e66]">
                Rows are generated under controlled rules within the same training pipeline. Quality and provenance information are read directly from the backend dataset endpoints.
              </p>
              <Link href="/app/how-it-works" className="mt-3 inline-flex text-[0.55rem] font-semibold text-[#9b2143] hover:underline">
                Learn how this works&nbsp;&nbsp;→
              </Link>
            </div>
          </section>

          <section className="rounded-[22px] border border-[#eadfe2] bg-white/92 p-4.5 shadow-[0_22px_56px_-44px_rgba(83,31,48,.42)]">
            <p className="text-[0.59rem] font-semibold uppercase tracking-[0.14em] text-[#9b3654]">Key insights</p>
            <div className="mt-4 space-y-3.5">
              <InsightRow title="Shelf-life concentration" text={`Highest row density: ${shelfPeak}.`} />
              <InsightRow title="Storage-temperature concentration" text={`Highest row density: ${temperaturePeak}.`} blue />
              <InsightRow
                title="Treatment space"
                text={topFamily ? `${topFamily.label} is the most represented ingredient family (${topFamily.value.toLocaleString()} rows).` : "No ingredient-family rows reported."}
                amber
              />
            </div>
            <Link
              href="/app/results"
              className="mt-5 flex min-h-10 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,#a61f46,#861735)] px-4 text-[0.62rem] font-semibold text-white shadow-[0_14px_30px_-18px_rgba(128,20,49,.68)] transition-all hover:-translate-y-0.5"
            >
              Explore results&nbsp;&nbsp;→
            </Link>
          </section>
        </aside>
      </div>
    </PageBody>
  );
}

function MetricCard({ label, value, sub, children }: { label: string; value: string; sub: string; children: ReactNode }) {
  return (
    <article className="group rounded-[18px] border border-[#eadfe2] bg-white/92 p-4 shadow-[0_16px_40px_-34px_rgba(81,29,45,.44)] transition-all duration-300 hover:-translate-y-1 hover:border-[#dcbcc6] hover:shadow-[0_24px_48px_-31px_rgba(81,29,45,.50)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.54rem] font-semibold uppercase tracking-[0.08em] text-[#9a858d]">{label}</p>
          <strong className="mt-2 block text-[1.45rem] font-semibold tracking-[-0.045em] text-[#20191c]">{value}</strong>
          <p className="mt-1 text-[0.5rem] leading-4 text-[#9a858d]">{sub}</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-[12px] border border-[#f0dfe4] bg-[#fff0f4] text-[#a32449] transition-transform group-hover:scale-105">
          {children}
        </span>
      </div>
    </article>
  );
}

function FancyPanel({
  tone,
  title,
  description,
  children,
}: {
  tone: "burgundy" | "blue" | "amber" | "neutral";
  title: string;
  description: string;
  children: ReactNode;
}) {
  const toneClass = {
    burgundy: "border-[#e3bdc8] bg-[linear-gradient(145deg,#fff8fa_0%,#fff1f5_55%,#fbe1e9_100%)]",
    blue: "border-[#c8d9ea] bg-[linear-gradient(145deg,#f9fcff_0%,#edf5fc_56%,#e4f0fa_100%)]",
    amber: "border-[#eedbc7] bg-[linear-gradient(145deg,#fffdf9_0%,#fff7ed_58%,#fbecdb_100%)]",
    neutral: "border-[#dce6ee] bg-[linear-gradient(145deg,#fff_0%,#f7fbfd_56%,#eef5f9_100%)]",
  }[tone];

  return (
    <article className={`group relative overflow-hidden rounded-[22px] border p-4 shadow-[0_24px_60px_-42px_rgba(79,29,45,.5)] ${toneClass}`}>
      <PanelDecoration tone={tone} />
      <div className="relative z-10">
        <h2 className={`text-[0.82rem] font-semibold ${tone === "blue" ? "text-[#254f79]" : "text-[#852341]"}`}>{title}</h2>
        <p className="mt-1 text-[0.54rem] leading-4 text-[#7f7076]">{description}</p>
        <div className="mt-2">{children}</div>
      </div>
    </article>
  );
}

function PanelDecoration({ tone }: { tone: "burgundy" | "blue" | "amber" | "neutral" }) {
  const stroke = tone === "blue" ? "#8eb6dd" : tone === "amber" ? "#e6b66e" : tone === "neutral" ? "#a8c5d8" : "#d9889e";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-65">
      <div className="absolute -right-14 -top-14 size-40 rounded-full bg-white/70 blur-2xl" />
      <svg className="absolute inset-x-0 bottom-[-6px] h-[58%] w-full" viewBox="0 0 700 220" preserveAspectRatio="none">
        <path d="M0 180 C120 120 170 205 290 136 S495 92 700 158" fill="none" stroke={stroke} strokeOpacity=".28" strokeWidth="2" />
        <path d="M0 205 C135 145 202 224 330 155 S520 118 700 184" fill="none" stroke={stroke} strokeOpacity=".18" strokeWidth="1.4" />
        <path d="M0 155 C120 96 210 188 340 117 S540 84 700 142" fill="none" stroke={stroke} strokeOpacity=".12" strokeWidth="1.1" />
      </svg>
    </div>
  );
}

function QualityRow({
  label,
  detail,
  value,
  progress,
  tone,
  numericOnly = false,
}: {
  label: string;
  detail: string;
  value: string;
  progress: number;
  tone: "green" | "burgundy" | "amber";
  numericOnly?: boolean;
}) {
  const colors = {
    green: "bg-[#178247]",
    burgundy: "bg-[#a61f46]",
    amber: "bg-[#ce8500]",
  } as const;
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-semibold text-[#4e343e]">{label}</p>
          <p className="mt-0.5 text-[0.5rem] leading-4 text-[#9a858d]">{detail}</p>
        </div>
        <strong className="text-[0.64rem] font-semibold tabular-nums text-[#49313a]">{value}</strong>
      </div>
      {!numericOnly && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f1e8eb]">
          <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      )}
    </div>
  );
}

function InsightRow({ title, text, blue = false, amber = false }: { title: string; text: string; blue?: boolean; amber?: boolean }) {
  const dot = blue ? "bg-[#4e7ead]" : amber ? "bg-[#c98314]" : "bg-[#a52649]";
  return (
    <div className="flex gap-3">
      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${dot}`} />
      <div>
        <p className="text-[0.58rem] font-semibold text-[#5a434c]">{title}</p>
        <p className="mt-1 text-[0.54rem] leading-4 text-[#8f7c83]">{text}</p>
      </div>
    </div>
  );
}

function StatusPill({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[0.48rem] font-semibold ${muted ? "border-[#e6dfe2] bg-white/76 text-[#88777d]" : "border-[#e1bec8] bg-[#fff5f8] text-[#982b49]"}`}>
      {children}
    </span>
  );
}

function DataBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <div className="absolute -left-36 top-[-10rem] size-[34rem] rounded-full bg-[#faedf1]/78 blur-[115px]" />
      <div className="absolute right-[-10rem] top-[8rem] size-[30rem] rounded-full bg-[#eef6fb]/74 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[38%] size-[34rem] rounded-full bg-[#fff2e7]/68 blur-[120px]" />
    </div>
  );
}

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function cleanGenerationMethod(value: string | null | undefined) {
  if (!value) return "backend-defined";
  return humanize(value.replace(/^synthetic_/, ""));
}

function percentage(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 0;
  return Math.max(0, Math.min(100, (numerator / denominator) * 100));
}

function peakRange(counts: number[], edges: number[], unit: string) {
  if (!counts.length || edges.length < 2) return "not available";
  let bestIndex = 0;
  for (let index = 1; index < counts.length; index += 1) {
    if ((counts[index] ?? 0) > (counts[bestIndex] ?? 0)) bestIndex = index;
  }
  const left = edges[bestIndex];
  const right = edges[bestIndex + 1];
  if (!Number.isFinite(left) || !Number.isFinite(right)) return "not available";
  return `${formatRangeValue(left)}–${formatRangeValue(right)} ${unit}`;
}

function formatRangeValue(value: number) {
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatSchemaExample(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : formatRangeValue(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  return String(value);
}
