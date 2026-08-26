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
          ? "border-border bg-background/94 shadow-[0_8px_28px_-24px_rgba(13,14,16,0.35)] backdrop-blur-xl"
          : "border-transparent bg-background/84 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-[58px] w-full max-w-[1180px] items-center gap-7 px-5 sm:px-7">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <img
            src={MCGILL_LOGO}
            alt="McGill University"
            className="h-[25px] w-auto shrink-0 object-contain"
          />
          <span className="h-5 w-px bg-border" aria-hidden />
          <span className="text-[0.8125rem] font-semibold tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary">
            Shelf-Life Studio
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-0.5 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group/nav relative rounded-md px-2.5 py-2 text-[0.775rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
              <span className="absolute inset-x-2.5 bottom-1 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover/nav:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
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
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-18px_rgba(122,27,46,0.75)] active:translate-y-0",
                  })}
                >
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
        <div className="border-t border-border bg-background/96 px-5 py-3 backdrop-blur-xl md:hidden">
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
