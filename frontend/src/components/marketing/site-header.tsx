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

export function SiteHeader() {
  const { user, loading } = useSession();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 10));

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300",
        scrolled
          ? "border-border bg-background/92 shadow-[0_8px_30px_-24px_rgba(13,14,16,0.35)] backdrop-blur-xl"
          : "border-transparent bg-background/78 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-[58px] w-full max-w-[1220px] items-center gap-8 px-5 sm:px-7">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className="relative h-8 w-[3px] overflow-hidden rounded-full bg-primary/20">
            <span className="absolute inset-x-0 bottom-0 h-1/2 rounded-full bg-primary transition-all duration-300 group-hover:h-full" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[0.875rem] font-semibold tracking-[-0.025em] text-foreground transition-colors group-hover:text-primary">
              Shelf-Life Studio
            </span>
            <span className="mt-1 text-[0.675rem] font-medium tracking-[0.055em] text-subtle-foreground uppercase">
              McGill University
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-0.5 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group/nav relative rounded-md px-3 py-2 text-[0.8125rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
              <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover/nav:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          {!loading &&
            (user ? (
              <Link
                href="/app"
                className={buttonVariants({
                  size: "sm",
                  className:
                    "transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0",
                })}
              >
                Open workspace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className:
                      "hidden sm:inline-flex transition-transform duration-200 hover:-translate-y-0.5",
                  })}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "shadow-[0_8px_24px_-16px_rgba(122,27,46,0.8)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-15px_rgba(122,27,46,0.8)] active:translate-y-0",
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
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border bg-background/96 px-5 py-3 backdrop-blur-xl md:hidden"
        >
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
        </motion.div>
      )}
    </motion.header>
  );
}
