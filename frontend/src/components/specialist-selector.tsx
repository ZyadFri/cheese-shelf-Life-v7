"use client";

import type { CheeseCategory, ModelTask } from "@/lib/api";

/** Shared across every page that lets the user pick which of the six
 * specialists (cheese_category x model_task) to inspect -- Modeling,
 * Explainability, and anywhere else that follows. One selector, one set of
 * labels, so switching pages never shows a differently-worded or
 * differently-ordered version of the same six options. */
export const CATEGORIES: { value: CheeseCategory; label: string }[] = [
  { value: "soft", label: "Soft" },
  { value: "semi_hard", label: "Semi-hard" },
  { value: "hard", label: "Hard" },
];

export const TASKS: { value: ModelTask; label: string }[] = [
  { value: "general_shelf_life", label: "General shelf life" },
  { value: "safety_endpoint", label: "Safety endpoint" },
];

export const CATEGORY_LABEL: Record<CheeseCategory, string> = { soft: "Soft", semi_hard: "Semi-hard", hard: "Hard" };
export const TASK_LABEL: Record<ModelTask, string> = { general_shelf_life: "General shelf life", safety_endpoint: "Safety endpoint" };

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-[11px] border border-[#eadfe3] bg-[#fbf6f7] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-[8px] px-3 py-1.5 text-[0.62rem] font-semibold transition-colors ${
            option.value === value
              ? "bg-white text-[#8e1839] shadow-[0_4px_14px_-6px_rgba(76,27,44,.4)]"
              : "text-[#8f7c84] hover:text-[#5f4a52]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function SpecialistSelector({
  category,
  task,
  onCategoryChange,
  onTaskChange,
}: {
  category: CheeseCategory;
  task: ModelTask;
  onCategoryChange: (value: CheeseCategory) => void;
  onTaskChange: (value: ModelTask) => void;
}) {
  return (
    <section className="relative z-10 overflow-hidden rounded-[20px] border border-[#eadfe3] bg-white/94 p-4 shadow-[0_18px_48px_-40px_rgba(76,27,44,.42)] sm:p-5">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#9b838c]">Specialist</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-4">
        <SegmentedControl options={CATEGORIES} value={category} onChange={onCategoryChange} />
        <div className="h-5 w-px bg-[#eee5e8]" />
        <SegmentedControl options={TASKS} value={task} onChange={onTaskChange} />
      </div>
    </section>
  );
}
