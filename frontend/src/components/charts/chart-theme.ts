/** Shared Recharts styling so every chart in the app reads as one visual
 * system instead of five independently-tuned ones. Values only -- no chart
 * logic lives here. */

export const CHART_TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  boxShadow: "var(--shadow-md)",
} as const;

export const CHART_TOOLTIP_LABEL_STYLE = {
  color: "var(--foreground)",
  fontWeight: 500,
  marginBottom: 2,
} as const;

export const CHART_AXIS_TICK = { fontSize: 10, fill: "var(--chart-axis)" } as const;
export const CHART_CATEGORY_TICK = { fontSize: 11, fill: "var(--foreground)" } as const;
export const CHART_LEGEND_STYLE = { fontSize: 11, color: "var(--muted-foreground)" } as const;

/** Truncates a label for axis-tick display only -- never for the value a
 * tooltip reads, so a shortened name on the axis still shows in full when
 * hovered. */
export function truncateTick(value: string, max = 14): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
