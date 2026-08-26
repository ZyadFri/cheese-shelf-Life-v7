"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

import { cn } from "@/lib/utils";

const SPRING = { stiffness: 180, damping: 22, mass: 0.55 };

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 190,
    damping: 28,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-primary"
      style={{ scaleX }}
    />
  );
}

export function TiltSurface({
  children,
  className,
  intensity = 5,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const reduce = useReducedMotion();
  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  const rotateX = useSpring(rotateXValue, SPRING);
  const rotateY = useSpring(rotateYValue, SPRING);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateYValue.set((px - 0.5) * intensity * 2);
    rotateXValue.set((0.5 - py) * intensity * 2);
    event.currentTarget.style.setProperty("--glow-x", `${px * 100}%`);
    event.currentTarget.style.setProperty("--glow-y", `${py * 100}%`);
  }

  function reset() {
    rotateXValue.set(0);
    rotateYValue.set(0);
  }

  return (
    <motion.div
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      whileHover={reduce ? undefined : { scale: 1.008 }}
      whileTap={reduce ? undefined : { scale: 0.997 }}
      transition={{ duration: 0.2 }}
      style={
        reduce
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1200,
              transformStyle: "preserve-3d",
            }
      }
      className={cn("group/tilt relative", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(122, 27, 46, 0.10), transparent 56%)",
        }}
      />
      {children}
    </motion.div>
  );
}

export function HoverSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    event.currentTarget.style.setProperty("--spot-x", `${x}%`);
    event.currentTarget.style.setProperty("--spot-y", `${y}%`);
  }

  return (
    <div
      onPointerMove={onPointerMove}
      className={cn(
        "group/surface relative overflow-hidden transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_50px_-32px_rgba(13,14,16,0.45)] active:translate-y-0 active:scale-[0.995]",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/surface:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(122, 27, 46, 0.075), transparent 60%)",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
