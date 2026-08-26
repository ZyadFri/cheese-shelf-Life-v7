"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { FlaskConical, Menu, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useSession } from "@/components/session-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#platform", label: "Platform" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#research", label: "Research" },
  { href: "#validation", label: "Validation" },
];

export function SiteHeader() {
  const { user, loading } = useSession();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();

  // Border + blur only appear once content is behind the bar, so the hero
  // meets the top of the page cleanly.
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 8));

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-md"
          : "border-b border-border/60 bg-background/70 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-[52px] w-full max-w-[1180px] items-center gap-7 px-5 sm:px-7">
        {/* Brand lockup. The mark slot is deliberately kept generic: McGill's
            visual identity guide prohibits third-party use of the crest
            without written authorization from logo.communications@mcgill.ca,
            so the affiliation is stated typographically instead. Swap this
            span for the crest asset once that authorization is in hand. */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary">
            <FlaskConical className="size-4 text-primary-foreground" strokeWidth={1.75} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="type-label font-semibold tracking-[-0.01em] text-foreground">
              Shelf-Life Studio
            </span>
            <span className="type-caption mt-0.5 text-subtle-foreground">McGill University</span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* Render nothing until the session resolves — flashing "Log in" at a
              signed-in user then swapping it is worse than a brief gap. */}
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
                    variant: "ghost",
                    size: "sm",
                    className: "hidden sm:inline-flex",
                  })}
                >
                  Log in
                </Link>
                <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                  Get started
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
        <div className="border-t border-border bg-canvas px-5 py-3 md:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2 text-[0.875rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2 text-[0.875rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
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
