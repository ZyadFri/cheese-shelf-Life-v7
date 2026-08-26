"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function EditorialImage({
  src,
  caption,
  className,
  imageClassName,
  priority,
  overlay = false,
}: {
  src: string;
  caption: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  overlay?: boolean;
}) {
  const [failed, setFailed] = React.useState(false);

  return (
    <figure className={cn("group/image relative overflow-hidden bg-muted", className)}>
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-grid">
          <span className="type-caption text-subtle-foreground">Image unavailable</span>
        </div>
      ) : (
        <>
          <Image
            src={src}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1180px) 50vw, 1180px"
            onError={() => setFailed(true)}
            className={cn(
              "object-cover transition-[transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/image:scale-[1.045]",
              overlay
                ? "brightness-[0.52] saturate-[0.92] group-hover/image:brightness-[0.58]"
                : "brightness-[0.96] saturate-[0.98] group-hover/image:brightness-100 group-hover/image:saturate-100",
              imageClassName,
            )}
          />
          {overlay && (
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5"
            />
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 ring-1 ring-inset ring-white/25 transition-opacity duration-300 group-hover/image:opacity-100"
          />
        </>
      )}
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}
