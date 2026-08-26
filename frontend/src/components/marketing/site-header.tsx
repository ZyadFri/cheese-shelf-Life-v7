"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
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
`;

export function SiteHeader() {
  const { user, loading } = useSession();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 8));

  return (
    <>
      <style>{LANDING_POLISH}</style>
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      >
        <div
          className={cn(
            "pointer-events-auto relative mx-auto flex h-[64px] w-full max-w-[1180px] items-center overflow-hidden rounded-[18px] border px-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 sm:px-5",
            scrolled
              ? "border-[#d8bcc5]/65 bg-[linear-gradient(112deg,rgba(255,249,251,.97),rgba(247,224,231,.94)_52%,rgba(255,251,252,.97))] shadow-[0_18px_46px_-28px_rgba(82,24,41,0.46)] backdrop-blur-2xl"
              : "border-[#e3cfd5]/62 bg-[linear-gradient(112deg,rgba(255,251,252,.93),rgba(249,230,235,.86)_52%,rgba(255,252,253,.94))] shadow-[0_14px_38px_-30px_rgba(82,24,41,0.38)] backdrop-blur-xl",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[18%] -top-10 h-20 rotate-[-8deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.8),transparent)] opacity-55 blur-xl"
          />

          <Link
            href="/"
            className="group relative z-10 flex shrink-0 items-center gap-3 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span className="rounded-md bg-white/72 px-1.5 py-1 shadow-[0_5px_18px_-14px_rgba(74,16,34,.5)]">
              <img
                src={MCGILL_LOGO}
                alt="McGill University"
                className="h-[29px] w-auto shrink-0 object-contain"
              />
            </span>
            <span className="h-7 w-px bg-[#cdb8be]" aria-hidden />
            <span className="text-[0.9rem] font-semibold tracking-[-0.022em] text-[#242326] transition-colors group-hover:text-primary">
              Shelf-Life Studio
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
          <div className="pointer-events-auto mx-auto mt-2 w-full max-w-[1180px] overflow-hidden rounded-[16px] border border-[#ddc6cd]/70 bg-[#fff8fa]/96 px-3 py-3 shadow-[0_18px_44px_-28px_rgba(83,25,42,.45)] backdrop-blur-2xl md:hidden">
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
      </motion.header>
    </>
  );
}
