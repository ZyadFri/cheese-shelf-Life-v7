import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Rounds a number for display in an editable numeric field without touching
 * the underlying value logic elsewhere. Dataset-default values come from the
 * backend as raw float64 (e.g. 6.326499999999999 from a pandas mean()), which
 * renders unchanged inside a controlled <input type="number">; round it to a
 * sane number of decimals purely for what the user sees and can edit. */
export function roundForDisplay(value: number, decimals = 3): number {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Initials fallback for an avatar, e.g. "Ada Lovelace" -> "AL". Pure/plain
 * (no client-only dependency) so it can be called from server components. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
