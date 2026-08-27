"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";

import type { CheeseCatalog, CheeseCatalogEntry } from "@/lib/api";
import { usePredictionV6 } from "@/components/prediction-v6-store";
import cheeseImages from "@/data/cheese-images.json";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type CheeseImageEntry = { imageUrl: string; thumbUrl: string; title: string; pageUrl: string; license: string };
const IMAGES = cheeseImages as unknown as Record<string, CheeseImageEntry | null>;

function titleCase(name: string): string {
  return name
    .split(" ")
    .map((word) => (word.length <= 3 && word === word.toLowerCase() && !["and", "the"].includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ")
    .replace(/\bAyib\b/, "Ayib");
}

const CATEGORY_LABEL: Record<string, string> = { soft: "Soft", semi_hard: "Semi-hard", hard: "Hard" };
const CATEGORY_STYLE: Record<string, string> = {
  soft: "border-[#ecdde2] bg-[#fff5f7] text-[#8b5263]",
  semi_hard: "border-[#e7e2d3] bg-[#fffaf0] text-[#8a7040]",
  hard: "border-[#ece0ca] bg-[#fff7e8] text-[#966410]",
};

export function CheeseSearchStep({ catalog }: { catalog: CheeseCatalog }) {
  const { dispatch } = usePredictionV6();
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [disambiguating, setDisambiguating] = React.useState<{ name: string; entries: CheeseCatalogEntry[] } | null>(null);
  const reduce = useReducedMotion();

  const names = React.useMemo(() => Object.keys(catalog).sort(), [catalog]);
  const results = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return names.slice(0, 8);
    const starts = names.filter((name) => name.toLowerCase().startsWith(normalized));
    const contains = names.filter((name) => !name.toLowerCase().startsWith(normalized) && name.toLowerCase().includes(normalized));
    return [...starts, ...contains].slice(0, 8);
  }, [query, names]);

  React.useEffect(() => setActiveIndex(0), [query]);

  function selectCheese(name: string) {
    const entries = catalog[name];
    if (!entries || entries.length === 0) return;
    if (entries.length === 1) {
      dispatch({ type: "selectCheese", baseCheeseName: name, entry: entries[0] });
    } else {
      setDisambiguating({ name, entries });
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      selectCheese(results[activeIndex]);
    }
  }

  return (
    <div className="mx-auto max-w-[900px] pb-24 pt-8 text-center sm:pt-10">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#a56a7c]">Prediction workspace</p>
        <h1
          className="mx-auto mt-3 max-w-[13ch] text-[clamp(3rem,5.4vw,5.35rem)] font-medium leading-[.92] tracking-[-0.055em] text-[#4f101f]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What cheese would you like to evaluate?
        </h1>
        <p className="mx-auto mt-4 max-w-[48ch] text-[0.8rem] leading-6 text-[#7d6d73]">
          Search the live cheese catalog. The selected cheese category and physical presentation determine which specialist prediction route is used.
        </p>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="mx-auto mt-8 max-w-[760px]"
      >
        <div
          className={cn(
            "flex min-h-14 items-center gap-3 rounded-[18px] border bg-white/88 px-5 shadow-[0_18px_45px_-34px_rgba(90,26,48,.46)] backdrop-blur-xl transition-all",
            focused ? "border-[#bd6b82] shadow-[0_20px_48px_-30px_rgba(135,29,58,.5)]" : "border-[#eadce1]",
          )}
        >
          <Search className="size-5 shrink-0 text-[#9b2647]" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search cheeses by name…"
            className="w-full bg-transparent text-[1rem] font-medium text-[#33282c] outline-none placeholder:text-[#b1a4a9]"
            autoFocus
          />
          <span className="hidden rounded-full border border-[#efe4e7] bg-[#fffafb] px-2.5 py-1 text-[0.48rem] text-[#9b858d] sm:inline">
            {names.length.toLocaleString()} cheeses
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.16 }}
        className="mx-auto mt-5 max-w-[760px] rounded-[24px] border border-[#eadfe3] bg-white/82 p-3 shadow-[0_26px_64px_-48px_rgba(87,29,47,.44)] backdrop-blur-xl sm:p-4"
      >
        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {results.map((name, index) => {
              const entries = catalog[name];
              const image = IMAGES[name];
              const categories = [...new Set(entries.map((entry) => entry.cheeseCategory))];

              return (
                <motion.button
                  key={name}
                  type="button"
                  whileHover={reduce ? undefined : { y: -3 }}
                  whileTap={reduce ? undefined : { scale: 0.985 }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectCheese(name)}
                  className={cn(
                    "group overflow-hidden rounded-[17px] border bg-white text-left shadow-[0_12px_30px_-28px_rgba(77,27,43,.52)] transition-all",
                    index === activeIndex ? "border-[#d8b3bf]" : "border-[#eee4e7] hover:border-[#ddbcc6]",
                  )}
                >
                  <div className="aspect-[1.32/1] overflow-hidden bg-[#f8f1f3]">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.thumbUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,#fff_0%,#faf4f6_68%)] text-[2rem] font-medium text-[#d0bdc3]" style={{ fontFamily: "var(--font-display)" }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="px-3 pb-3 pt-2.5">
                    <div className="truncate text-[0.72rem] font-semibold text-[#30262a]">{titleCase(name)}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {categories.map((item) => (
                        <span key={item} className={`rounded-full border px-2 py-0.5 text-[0.45rem] font-medium ${CATEGORY_STYLE[item] ?? "border-[#e8e0e3] bg-[#faf7f8] text-[#817178]"}`}>
                          {CATEGORY_LABEL[item] ?? titleCase(item.replace(/_/g, " "))}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#fbf0f3] text-[#9b2647]"><Search className="size-5" /></div>
            <p className="mt-3 text-sm font-semibold text-[#3c3035]">No matching cheese in the catalog</p>
            <p className="mt-1 text-xs text-[#948188]">Try another cheese name or clear the search.</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {disambiguating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mx-auto mt-5 max-w-[760px] rounded-[20px] border border-[#e7d8dd] bg-[linear-gradient(145deg,#fff,#fff8fa)] p-5 text-left shadow-[0_18px_45px_-36px_rgba(92,31,50,.42)]"
          >
            <p className="text-sm text-[#56484e]">
              <span className="font-semibold text-[#7f1d3d]">{titleCase(disambiguating.name)}</span> appears in more than one category in the backend catalog. Choose the category that matches your product.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {disambiguating.entries.map((entry, index) => (
                <button
                  key={`${entry.cheeseCategory}-${index}`}
                  type="button"
                  onClick={() => dispatch({ type: "selectCheese", baseCheeseName: disambiguating.name, entry })}
                  className="inline-flex items-center gap-2 rounded-[11px] border border-[#e5d7dc] bg-white px-4 py-2 text-xs font-semibold text-[#6f374a] transition-all hover:-translate-y-0.5 hover:border-[#cf9fae]"
                >
                  {CATEGORY_LABEL[entry.cheeseCategory]}
                  <ArrowRight className="size-3.5" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { titleCase, IMAGES };
