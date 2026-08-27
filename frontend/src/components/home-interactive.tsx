"use client";

import * as React from "react";
import Link from "next/link";

export type PredictionExample = {
  title: string;
  subtitle: string;
  image: string;
  predictedDays: number;
  condition: string;
  sourceLabel: string;
};

export function DemoVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div
      id="app-demo"
      className="group relative aspect-[16/9] min-h-[280px] overflow-hidden rounded-[24px] border border-[#eadde1] bg-[#f5ecef] shadow-[0_24px_70px_-44px_rgba(86,24,45,.55)]"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        controls={playing}
        className="absolute inset-0 h-full w-full object-cover"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      >
        Your browser does not support HTML video.
      </video>

      {!playing && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(48,12,25,.02)_30%,rgba(48,12,25,.56)_100%)]" />
          <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/88 px-3 py-1.5 text-[0.64rem] font-semibold text-[#6d2a40] shadow-sm backdrop-blur-md">
            App demo{duration > 0 ? ` · ${formatDuration(duration)}` : ""}
          </div>
          <button
            type="button"
            onClick={togglePlayback}
            className="absolute left-1/2 top-1/2 grid size-[76px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/92 shadow-[0_20px_50px_-22px_rgba(73,18,38,.72)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a51d42]"
            aria-label="Play Shelf-Life Studio demo"
          >
            <span className="ml-1 block h-0 w-0 border-y-[11px] border-y-transparent border-l-[17px] border-l-[#a51d42]" />
          </button>
          <button
            type="button"
            onClick={togglePlayback}
            className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-4 text-left text-white"
            aria-label="Play Shelf-Life Studio demo"
          >
            <span>
              <strong className="block text-[0.82rem] font-semibold">See Shelf-Life Studio in action</strong>
              <span className="mt-0.5 block text-[0.62rem] text-white/78">Prediction, comparison and explainability workflow</span>
            </span>
            <span className="shrink-0 text-[0.62rem] font-medium text-white/78">Play demo</span>
          </button>
        </>
      )}
    </div>
  );
}

export function PredictionCarousel({ items }: { items: PredictionExample[] }) {
  const railRef = React.useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    railRef.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="Previous prediction examples"
        className="absolute -left-2 top-[38%] z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-[#ead9df] bg-white/96 text-xl leading-none text-[#8d2a48] shadow-[0_10px_26px_-18px_rgba(90,31,49,.55)] transition-all hover:-translate-x-0.5 hover:border-[#d9b4c0] sm:grid"
      >
        ‹
      </button>

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <Link
            key={`${item.title}-${item.condition}`}
            href="/app/results"
            className="group min-w-[255px] max-w-[310px] flex-1 snap-start overflow-hidden rounded-[18px] border border-[#eadfe3] bg-white shadow-[0_16px_40px_-34px_rgba(79,28,45,.48)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d7b3bf] hover:shadow-[0_24px_48px_-30px_rgba(79,28,45,.5)]"
          >
            <div className="relative h-[148px] overflow-hidden bg-[#f5eff1]">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.045]"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#3c1220]/32 to-transparent" />
            </div>
            <div className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[0.74rem] font-semibold text-[#582238]">{item.title}</h3>
                  <p className="mt-0.5 truncate text-[0.56rem] text-[#98858c]">{item.subtitle}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#fff0f4] px-2 py-1 text-[0.49rem] font-semibold text-[#9a3653]">
                  Model output
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3 border-t border-[#f1e8eb] pt-3">
                <div>
                  <span className="block text-[0.5rem] text-[#a08a92]">Predicted shelf life</span>
                  <strong className="mt-0.5 block text-[1.16rem] font-semibold tracking-[-0.04em] text-[#8d1d3d]">
                    {item.predictedDays.toFixed(1)} days
                  </strong>
                </div>
                <span className="max-w-[42%] text-right text-[0.5rem] leading-4 text-[#8f7a82]">{item.condition}</span>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-3 text-[0.49rem] text-[#a08b93]">
                <span>{item.sourceLabel}</span>
                <span className="font-semibold text-[#8c2947]">Open results →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => move(1)}
        aria-label="Next prediction examples"
        className="absolute -right-2 top-[38%] z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-[#ead9df] bg-white/96 text-xl leading-none text-[#8d2a48] shadow-[0_10px_26px_-18px_rgba(90,31,49,.55)] transition-all hover:translate-x-0.5 hover:border-[#d9b4c0] sm:grid"
      >
        ›
      </button>
    </div>
  );
}

function formatDuration(seconds: number) {
  const rounded = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
