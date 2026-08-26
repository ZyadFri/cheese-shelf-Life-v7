"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
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

export function SiteHeader() {
  const { user, loading } = useSession();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 8));

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300",
        scrolled
          ? "border-border bg-background/96 shadow-[0_9px_28px_-24px_rgba(13,14,16,0.28)] backdrop-blur-xl"
          : "border-transparent bg-background/92 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-[66px] w-full max-w-[1180px] items-center px-5 sm:px-7">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <img
            src={MCGILL_LOGO}
            alt="McGill University"
            className="h-[30px] w-auto shrink-0 object-contain"
          />
          <span className="h-7 w-px bg-border-strong" aria-hidden />
          <span className="text-[0.9rem] font-semibold tracking-[-0.022em] text-foreground transition-colors group-hover:text-primary">
            Shelf-Life Studio
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
          {NAV.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "group/nav relative px-1 py-6 text-[0.74rem] font-medium transition-colors",
                index === 0 ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute inset-x-0 bottom-[16px] h-[2px] origin-left bg-primary transition-transform duration-300",
                  index === 0 ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100",
                )}
              />
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          {!loading &&
            (user ? (
              <Link href="/app" className={buttonVariants({ size: "sm" })}>
                Open workspace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className:
                      "hidden min-w-[72px] bg-white sm:inline-flex transition-transform duration-200 hover:-translate-y-0.5",
                  })}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "min-w-[104px] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-18px_rgba(122,27,46,0.75)] active:translate-y-0",
                  })}
                >
                  Get started
                  <span aria-hidden>→</span>
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
        <div className="border-t border-border bg-background/98 px-5 py-3 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[0.875rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-primary/10"
              >
                {item.label}
              </a>
            ))}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[0.875rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      )}
    </motion.header>
  );
}
