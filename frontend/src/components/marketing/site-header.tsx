"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/components/session-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#platform", label: "Platform" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#research", label: "Research" },
  { href: "#validation", label: "Validation" },
];

const MCGILL_LOGO =
  "https://www.mcgill.ca/visual-identity/files/visual-identity/red_on_white.png";

const LANDING_POLISH = `
@keyframes shelfNavShine {
  0% { transform: translateX(-180%) skewX(-18deg); opacity: 0; }
  24% { opacity: .85; }
  100% { transform: translateX(620%) skewX(-18deg); opacity: 0; }
}
.shelf-nav-link:hover .shelf-nav-shine,
.shelf-nav-cta:hover .shelf-nav-shine { animation: shelfNavShine .82s cubic-bezier(.16,1,.3,1); }
main > section:first-of-type {
  background:
    radial-gradient(circle at 84% 24%, rgba(155, 28, 60, .11), transparent 30rem),
    radial-gradient(circle at 2% 68%, rgba(244, 207, 218, .52), transparent 25rem),
    linear-gradient(180deg, #fff8fa 0%, #fffefe 58%, #fff9fb 100%) !important;
}
main > section:first-of-type::before {
  top: -11rem !important;
  right: -2rem !important;
  width: 50rem !important;
  height: 42rem !important;
  background:
    radial-gradient(circle at 55% 48%, rgba(155,28,60,.12), transparent 53%),
    radial-gradient(circle at 72% 28%, rgba(229,181,194,.32), transparent 35%) !important;
  filter: blur(18px) !important;
  opacity: .78 !important;
}
main > section:first-of-type::after {
  left: -11rem !important;
  bottom: auto !important;
  top: 5.7rem !important;
  width: 38rem !important;
  height: 35rem !important;
  background-image:
    repeating-radial-gradient(ellipse at 48% 50%, transparent 0 22px, rgba(155,28,60,.055) 23px 24px, transparent 25px 42px),
    radial-gradient(circle at 5px 5px, rgba(155,28,60,.11) 0 1.25px, transparent 1.5px) !important;
  background-size: auto, 43px 43px !important;
  opacity: .48 !important;
  transform: rotate(-7deg) !important;
  -webkit-mask-image: linear-gradient(90deg, #000 0 58%, transparent 96%);
  mask-image: linear-gradient(90deg, #000 0 58%, transparent 96%);
}
main > section:first-of-type h1 {
  font-family: var(--font-display) !important;
  font-weight: 520 !important;
  letter-spacing: -.047em !important;
  line-height: .985 !important;
}
main > section:first-of-type > div:last-child > div {
  border-color: rgba(178, 122, 138, .25) !important;
  background: linear-gradient(108deg, rgba(255,255,255,.93), rgba(252,235,241,.9), rgba(255,252,253,.94)) !important;
  box-shadow: 0 20px 48px -34px rgba(79, 32, 47, .36) !important;
  backdrop-filter: blur(18px);
}
main #research {
  background:
    radial-gradient(circle at 86% 22%, rgba(155,28,60,.055), transparent 25rem),
    radial-gradient(circle at 4% 82%, rgba(238,207,216,.34), transparent 21rem),
    linear-gradient(180deg, #fffefe 0%, #fff9fb 100%) !important;
}
main #platform h2,
main #pipeline h2,
main #validation h2 {
  font-family: var(--font-display) !important;
  font-weight: 520 !important;
  letter-spacing: -.045em !important;
}

/* Landing pipeline — intentionally mirrors the clean five-card reference. */
main #pipeline [class*="pipelineStory"] {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 2.7rem !important;
  align-items: stretch !important;
  padding-bottom: 4.3rem !important;
}
main #pipeline [class*="pipelineIntro"] {
  position: static !important;
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, .78fr) !important;
  column-gap: clamp(2rem, 6vw, 6rem) !important;
  row-gap: .45rem !important;
  min-height: 0 !important;
  padding: 0 !important;
  align-items: end !important;
}
main #pipeline [class*="pipelineIntro"] > div:first-of-type {
  grid-column: 1 !important;
  grid-row: 1 !important;
}
main #pipeline [class*="pipelineIntro"] > h2 {
  grid-column: 1 !important;
  grid-row: 2 !important;
  max-width: 12ch !important;
  margin-bottom: 0 !important;
}
main #pipeline [class*="pipelineIntro"] > div:nth-of-type(2) {
  grid-column: 2 !important;
  grid-row: 2 !important;
  align-self: end !important;
  padding-bottom: .55rem !important;
}
main #pipeline [class*="pipelineIntro"] [class*="pipelineCopy"] {
  max-width: 31rem !important;
  margin: 0 !important;
}
main #pipeline [class*="pipelineIntro"] > div:nth-of-type(3) {
  position: absolute !important;
  left: 0 !important;
  bottom: .2rem !important;
  z-index: 3 !important;
}
main #pipeline [class*="pipelineBenchPhoto"] {
  display: none !important;
}
main #pipeline [class*="pipelineCanvas"] {
  min-height: 0 !important;
  padding: 0 !important;
  isolation: auto !important;
}
main #pipeline [class*="pipelineTexture"],
main #pipeline [class*="pipelineCurve"],
main #pipeline [class*="pipelineAxis"] {
  display: none !important;
}
main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) {
  position: relative !important;
  z-index: 2 !important;
  display: grid !important;
  grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  gap: 1.45rem !important;
  padding: 0 !important;
}
main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div {
  position: relative !important;
  min-width: 0 !important;
}
main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:not(:last-child)::after {
  content: "→";
  position: absolute;
  right: -1.18rem;
  top: 48%;
  z-index: 8;
  transform: translateY(-50%);
  color: #aa2144;
  font-size: 1.45rem;
  font-weight: 400;
  line-height: 1;
}
main #pipeline [class*="pipelineCanvas"] article {
  position: relative !important;
  display: flex !important;
  min-height: 27.5rem !important;
  height: 100% !important;
  flex-direction: column !important;
  padding: 1.15rem !important;
  overflow: hidden !important;
  border: 1px solid rgba(220, 216, 218, .96) !important;
  border-radius: 12px !important;
  background: rgba(255,255,255,.96) !important;
  box-shadow: 0 18px 42px -34px rgba(61, 37, 44, .34) !important;
}
main #pipeline [class*="pipelineStepBadge"] {
  display: block !important;
  width: auto !important;
  height: auto !important;
  margin: 0 0 1rem !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #a82043 !important;
  box-shadow: none !important;
  font-size: 1.08rem !important;
  font-weight: 760 !important;
  line-height: 1 !important;
}
main #pipeline [class*="pipelineCanvas"] article > div {
  width: 100% !important;
  height: 12.1rem !important;
  min-height: 12.1rem !important;
  margin: 0 0 1.25rem !important;
  padding: 0 !important;
  overflow: hidden !important;
  border: 0 !important;
  border-radius: 4px !important;
  background-position: center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  box-shadow: none !important;
}
main #pipeline [class*="pipelineCanvas"] article > div > * {
  display: none !important;
}
main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(1) article > div {
  background-image: linear-gradient(rgba(255,255,255,.04), rgba(255,255,255,.04)), url('/marketing/lab.jpg') !important;
}
main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(2) article > div {
  background-image: url('https://upload.wikimedia.org/wikipedia/commons/e/e8/Sterilization_effects_of_negative_air_ionization.jpg') !important;
}
main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(3) article > div {
  background-image: url('https://res.cloudinary.com/moreworks/image/upload/v1723518881/guide/%E3%82%B3%E3%83%BC%E3%83%80%E3%83%BC%E3%81%A8%E3%81%AF/pixta_51347154_XL.jpg') !important;
}
main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(4) article > div {
  background-image: url('https://images.unsplash.com/photo-1584169417032-d34e8d805e8b?auto=format&fit=crop&w=1200&q=82') !important;
}
main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(5) article > div {
  background-image: url('https://images.unsplash.com/photo-1580983559367-0dc2f8934365?auto=format&fit=crop&w=1200&q=82') !important;
}
main #pipeline [class*="pipelineCanvas"] article h3 {
  margin: 0 !important;
  color: #242326 !important;
  font-size: .98rem !important;
  font-weight: 720 !important;
  line-height: 1.25 !important;
  letter-spacing: -.018em !important;
}
main #pipeline [class*="pipelineCanvas"] article p {
  min-height: 0 !important;
  margin: .65rem 0 0 !important;
  color: #707077 !important;
  font-size: .78rem !important;
  line-height: 1.55 !important;
}
@media (max-width: 1080px) {
  main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) {
    grid-template-columns: repeat(5, minmax(12rem, 1fr)) !important;
    overflow-x: auto !important;
    padding: 0 0 1rem !important;
    scroll-snap-type: x proximity;
  }
  main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div {
    scroll-snap-align: start;
  }
}
@media (max-width: 760px) {
  main #pipeline [class*="pipelineIntro"] {
    grid-template-columns: 1fr !important;
  }
  main #pipeline [class*="pipelineIntro"] > div:first-of-type,
  main #pipeline [class*="pipelineIntro"] > h2,
  main #pipeline [class*="pipelineIntro"] > div:nth-of-type(2) {
    grid-column: 1 !important;
    grid-row: auto !important;
  }
  main #pipeline [class*="pipelineStory"] {
    padding-bottom: 4.8rem !important;
  }
}

/* Full-width research collaborator showcase. */
main #research [class*="teamHeadingWrap"] {
  position: relative !important;
  left: 50% !important;
  width: min(96vw, 1540px) !important;
  min-height: 15rem !important;
  margin-top: 5.2rem !important;
  padding: 2.7rem 3.4rem !important;
  overflow: hidden !important;
  transform: translateX(-50%) !important;
  border: 1px solid rgba(224,191,200,.72) !important;
  border-radius: 30px !important;
  background:
    linear-gradient(90deg, rgba(255,252,253,.99) 0%, rgba(255,249,251,.96) 52%, rgba(255,251,252,.45) 74%, rgba(255,255,255,.08) 100%),
    url('/marketing/cheeses.jpg') right 32% / 46% auto no-repeat !important;
  box-shadow: 0 30px 80px -58px rgba(91,29,47,.36) !important;
  isolation: isolate;
}
main #research [class*="teamHeadingWrap"]::before {
  content: "";
  position: absolute;
  z-index: -1;
  right: 26%;
  top: -44%;
  width: 28rem;
  height: 28rem;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, transparent 0 24%, rgba(174,47,78,.08) 25% 25.6%, transparent 26% 38%, rgba(174,47,78,.055) 39% 39.6%, transparent 40%),
    radial-gradient(circle at 5px 5px, rgba(174,47,78,.13) 0 1.15px, transparent 1.4px);
  background-size: auto, 24px 24px;
  opacity: .72;
  transform: rotate(-12deg);
}
main #research [class*="teamHeadingWrap"]::after {
  content: "Experts in food science and machine learning working together on cheese shelf-life research, modelling and interpretation.";
  position: relative;
  display: block;
  max-width: 49rem;
  margin-top: 1.05rem;
  color: #5f6065;
  font-size: clamp(.86rem, 1.15vw, 1.05rem);
  line-height: 1.58;
}
main #research [class*="teamHeadingWrap"] h3 {
  position: relative !important;
  z-index: 2 !important;
  max-width: 13ch !important;
  margin: .85rem 0 0 !important;
  font-family: var(--font-display) !important;
  color: #1f2023 !important;
  font-size: clamp(3rem, 5.6vw, 5.3rem) !important;
  font-weight: 520 !important;
  letter-spacing: -.055em !important;
  line-height: .94 !important;
}
main #research [class*="teamGrid"] {
  position: relative !important;
  left: 50% !important;
  width: min(96vw, 1540px) !important;
  transform: translateX(-50%) !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 1.25rem !important;
  margin-top: 1.35rem !important;
}
main #research [class*="teamGrid"] > div {
  min-width: 0;
}
main #research [class*="personCard"] {
  position: relative !important;
  display: block !important;
  min-height: 34rem !important;
  height: 100% !important;
  padding: 0 !important;
  overflow: hidden !important;
  isolation: isolate;
  border: 1px solid rgba(215,180,190,.88) !important;
  border-radius: 28px !important;
  background: #f8eef1 !important;
  box-shadow: 0 30px 70px -48px rgba(70,29,42,.48) !important;
  transition: transform .38s cubic-bezier(.2,.8,.2,1), box-shadow .38s ease, border-color .38s ease !important;
}
main #research [class*="personCard"]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(42,12,22,.02) 0%, rgba(42,12,22,.03) 36%, rgba(35,11,19,.20) 62%, rgba(30,9,16,.62) 100%),
    radial-gradient(circle at 90% 10%, rgba(255,255,255,.35), transparent 28%);
}
main #research [class*="personCard"]::after {
  content: "";
  position: absolute;
  z-index: 3;
  inset: -35% -65% 45% 35%;
  pointer-events: none;
  background: linear-gradient(112deg, transparent 30%, rgba(255,255,255,.40) 49%, transparent 68%);
  opacity: 0;
  transform: translateX(-28%);
  transition: opacity .35s ease, transform .72s cubic-bezier(.2,.8,.2,1);
}
main #research [class*="personCard"]:hover {
  transform: translateY(-10px) scale(1.006) !important;
  border-color: rgba(181,88,111,.78) !important;
  box-shadow: 0 38px 86px -48px rgba(92,29,49,.58) !important;
}
main #research [class*="personCard"]:hover::after {
  opacity: 1;
  transform: translateX(62%);
}
main #research [class*="personPhoto"] {
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
  border-radius: 0 !important;
  background: #eee7e9 !important;
}
main #research [class*="personPhoto"] img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center top !important;
  filter: saturate(.92) contrast(1.02) !important;
  transform: scale(1.005);
  transition: transform .72s cubic-bezier(.2,.8,.2,1), filter .45s ease !important;
}
main #research [class*="personCard"]:hover [class*="personPhoto"] img {
  transform: scale(1.055) !important;
  filter: saturate(1.02) contrast(1.03) !important;
}
main #research [class*="personCard"] > div:last-child {
  position: absolute !important;
  z-index: 5 !important;
  left: 1.25rem !important;
  right: 1.25rem !important;
  bottom: 1.25rem !important;
  padding: 1.25rem 1.3rem 1.2rem !important;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.72) !important;
  border-radius: 21px !important;
  background: linear-gradient(135deg, rgba(255,255,255,.90), rgba(255,247,250,.79)) !important;
  box-shadow: 0 18px 44px -28px rgba(36,10,20,.55) !important;
  backdrop-filter: blur(18px) saturate(135%) !important;
  transition: transform .38s cubic-bezier(.2,.8,.2,1), background .38s ease !important;
}
main #research [class*="personCard"]:hover > div:last-child {
  transform: translateY(-4px);
  background: linear-gradient(135deg, rgba(255,255,255,.95), rgba(255,244,248,.86)) !important;
}
main #research [class*="personRole"] {
  display: inline-flex !important;
  align-items: center !important;
  margin: 0 !important;
  padding: .46rem .72rem !important;
  border: 1px solid rgba(197,119,139,.44) !important;
  border-radius: 999px !important;
  background: rgba(255,250,252,.84) !important;
  color: #9c2342 !important;
  font-size: .62rem !important;
  font-weight: 780 !important;
  letter-spacing: .09em !important;
  text-transform: uppercase !important;
}
main #research [class*="personName"] {
  margin: .78rem 0 0 !important;
  font-family: var(--font-display) !important;
  color: #241f21 !important;
  font-size: clamp(1.9rem, 2.55vw, 2.8rem) !important;
  font-weight: 520 !important;
  letter-spacing: -.045em !important;
  line-height: .96 !important;
}
main #research [class*="personAffiliation"] {
  margin: .62rem 0 0 !important;
  color: #9a2443 !important;
  font-size: .74rem !important;
  font-weight: 650 !important;
  line-height: 1.4 !important;
}
main #research [class*="personBio"] {
  max-width: 36rem !important;
  margin: .72rem 0 0 !important;
  color: #5e5d62 !important;
  font-size: .78rem !important;
  line-height: 1.58 !important;
}
main #research [class*="teamGrid"] > div:nth-child(1) [class*="personCard"] {
  border-color: rgba(190,70,99,.70) !important;
  background: #f6d8df !important;
}
main #research [class*="teamGrid"] > div:nth-child(2) [class*="personCard"] {
  border-color: rgba(222,181,164,.86) !important;
  background: #fbf0e9 !important;
}
main #research [class*="teamGrid"] > div:nth-child(3) [class*="personCard"] {
  border-color: rgba(164,128,177,.72) !important;
  background: #eee4f0 !important;
}
main #research [class*="teamGrid"] > div:nth-child(1) [class*="personCard"]::before {
  background: linear-gradient(180deg, rgba(118,18,46,.03) 0%, rgba(93,13,36,.06) 38%, rgba(80,13,34,.30) 67%, rgba(63,9,27,.69) 100%) !important;
}
main #research [class*="teamGrid"] > div:nth-child(2) [class*="personCard"]::before {
  background: linear-gradient(180deg, rgba(156,87,48,.01) 0%, rgba(132,72,37,.04) 40%, rgba(80,38,18,.20) 69%, rgba(55,27,17,.62) 100%) !important;
}
main #research [class*="teamGrid"] > div:nth-child(3) [class*="personCard"]::before {
  background: linear-gradient(180deg, rgba(90,48,99,.02) 0%, rgba(77,39,87,.06) 38%, rgba(65,31,75,.27) 67%, rgba(42,21,49,.65) 100%) !important;
}
@media (max-width: 1080px) {
  main #research [class*="teamGrid"] {
    grid-template-columns: repeat(3, minmax(20rem, 1fr)) !important;
    overflow-x: auto !important;
    padding-bottom: 1rem !important;
    scroll-snap-type: x proximity;
  }
  main #research [class*="teamGrid"] > div {
    scroll-snap-align: start;
  }
}
@media (max-width: 700px) {
  main #research [class*="teamHeadingWrap"] {
    width: calc(100vw - 1.4rem) !important;
    min-height: 18rem !important;
    padding: 2rem 1.35rem !important;
    background:
      linear-gradient(180deg, rgba(255,252,253,.97), rgba(255,248,250,.88)),
      url('/marketing/cheeses.jpg') center bottom / cover no-repeat !important;
  }
  main #research [class*="teamGrid"] {
    width: calc(100vw - 1.4rem) !important;
    grid-template-columns: 1fr !important;
    overflow: visible !important;
  }
  main #research [class*="personCard"] {
    min-height: 31rem !important;
  }
}
`;

export function SiteHeader() {
  const { user, loading } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <style>{LANDING_POLISH}</style>
      <header className="relative z-40 px-3 pt-3 sm:px-5">
        <div className="relative mx-auto flex h-[64px] w-full max-w-[1180px] items-center overflow-hidden rounded-[18px] border border-[#d8bcc5]/70 bg-[linear-gradient(112deg,rgba(255,249,251,.97),rgba(247,224,231,.94)_52%,rgba(255,251,252,.97))] px-4 shadow-[0_18px_46px_-28px_rgba(82,24,41,0.46)] backdrop-blur-2xl backdrop-saturate-150 sm:px-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[18%] -top-10 h-20 rotate-[-8deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.8),transparent)] opacity-55 blur-xl"
          />

          <Link
            href="/"
            className="group relative z-10 flex shrink-0 items-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            aria-label="McGill University home"
          >
            <span className="rounded-md bg-white/72 px-1.5 py-1 shadow-[0_5px_18px_-14px_rgba(74,16,34,.5)] transition-transform duration-200 group-hover:scale-[1.02]">
              <img
                src={MCGILL_LOGO}
                alt="McGill University"
                className="h-[31px] w-auto shrink-0 object-contain"
              />
            </span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1.5 md:flex">
            {NAV.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "shelf-nav-link group/nav relative overflow-hidden rounded-full px-3.5 py-2 text-[0.73rem] font-medium transition-[color,background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-white/66 hover:text-primary hover:shadow-[0_12px_28px_-22px_rgba(122,27,46,.82)]",
                  index === 0 ? "bg-white/56 text-primary" : "text-[#665b60]",
                )}
              >
                <span className="shelf-nav-shine pointer-events-none absolute inset-y-0 -left-8 w-5 -skew-x-[18deg] bg-white/90 opacity-0 blur-[1px]" />
                <span className="relative z-10">{item.label}</span>
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-[3px] h-[2px] origin-left rounded-full bg-primary transition-transform duration-300",
                    index === 0 ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100",
                  )}
                />
              </a>
            ))}
          </nav>

          <div className="relative z-10 ml-auto flex items-center gap-2.5">
            {!loading &&
              (user ? (
                <Link
                  href="/app"
                  className="shelf-nav-cta group relative inline-flex min-h-9 items-center justify-center overflow-hidden rounded-[10px] border border-[#8a1835] bg-[linear-gradient(135deg,#a82247,#76172d)] px-3.5 text-[0.75rem] font-semibold text-white shadow-[0_14px_30px_-17px_rgba(122,27,46,.78)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-13px_rgba(122,27,46,.86)]"
                >
                  <span className="shelf-nav-shine pointer-events-none absolute inset-y-0 -left-8 w-5 -skew-x-[18deg] bg-white/70 opacity-0 blur-[1px]" />
                  <span className="relative z-10">Open workspace</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden min-h-9 min-w-[72px] items-center justify-center rounded-[10px] border border-transparent bg-white/42 px-3 text-[0.75rem] font-medium text-[#755461] transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/72 hover:text-primary hover:shadow-[0_12px_26px_-20px_rgba(122,27,46,.62)] sm:inline-flex"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="shelf-nav-cta group relative inline-flex min-h-9 min-w-[108px] items-center justify-center gap-1.5 overflow-hidden rounded-[10px] border border-[#8a1835] bg-[linear-gradient(135deg,#aa2449,#78172f)] px-3.5 text-[0.75rem] font-semibold text-white shadow-[0_14px_30px_-17px_rgba(122,27,46,.82)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-12px_rgba(122,27,46,.9)] active:translate-y-0"
                  >
                    <span className="shelf-nav-shine pointer-events-none absolute inset-y-0 -left-8 w-5 -skew-x-[18deg] bg-white/72 opacity-0 blur-[1px]" />
                    <span className="relative z-10">Get started</span>
                    <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>→</span>
                  </Link>
                </>
              ))}

            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="mx-auto mt-2 w-full max-w-[1180px] overflow-hidden rounded-[16px] border border-[#ddc6cd]/70 bg-[#fff8fa]/96 px-3 py-3 shadow-[0_18px_44px_-28px_rgba(83,25,42,.45)] backdrop-blur-2xl md:hidden">
            <nav className="flex flex-col">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-[0.875rem] font-medium text-[#6d5960] transition-colors hover:bg-white/72 hover:text-primary active:bg-primary/10"
                >
                  {item.label}
                </a>
              ))}
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-[0.875rem] font-medium text-[#6d5960] transition-colors hover:bg-white/72 hover:text-primary sm:hidden"
                >
                  Log in
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
