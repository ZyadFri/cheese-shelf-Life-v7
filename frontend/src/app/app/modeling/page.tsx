import { CalendarClock } from "lucide-react";

import { PageBody, Reveal } from "@/components/page-shell";
import { ModelingV6Workspace } from "@/components/modeling-v6-workspace";

export default function ModelingPage() {
  return (
    <PageBody className="relative isolate max-w-[1480px] overflow-hidden pb-12 pt-0 sm:px-5 lg:px-7">
      <ModelingBackdrop />

      <section className="relative -mx-4 overflow-hidden border-b border-[#eee5e8] sm:-mx-5 lg:-mx-7">
        <div className="relative min-h-[170px] overflow-hidden px-4 py-7 sm:px-7 lg:min-h-[182px] lg:px-9">
          <div className="absolute inset-y-0 right-0 hidden w-[68%] overflow-hidden lg:block">
            <img
              src="/marketing/lab.jpg"
              alt="Food-science laboratory bench"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_0%,rgba(255,255,255,.96)_14%,rgba(255,255,255,.58)_40%,rgba(255,255,255,.05)_72%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,.14))]" />
          </div>

          <div className="relative z-10 max-w-[520px]">
            <div className="mb-3 h-[3px] w-10 rounded-full bg-[#921d3f]" />
            <h1
              className="text-[clamp(2.8rem,5vw,4.6rem)] leading-[.92] font-medium tracking-[-0.055em] text-[#171214]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Modeling
            </h1>
            <p className="mt-3 max-w-[48ch] text-[0.72rem] leading-5 text-[#74666c] sm:text-[0.78rem]">
              Training and validation results for the six category × task specialists that actually serve predictions, read from each specialist&apos;s own saved artifacts. Retraining is CLI-only.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[0.54rem] text-[#9a878f]">
              <CalendarClock className="size-3" strokeWidth={1.7} />
              Pick a cheese category and task below to see that specialist&apos;s own training run.
            </p>
          </div>
        </div>
      </section>

      <ModelingV6Workspace />
    </PageBody>
  );
}

function ModelingBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 top-32 size-72 rounded-full bg-[#fbeff3] blur-3xl" />
      <div className="absolute right-0 top-[420px] size-80 rounded-full bg-[#eef5fb] blur-3xl" />
    </div>
  );
}
