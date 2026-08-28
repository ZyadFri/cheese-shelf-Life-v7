import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level Suspense fallback for every /app/* page. Without this, a
 * navigation shows nothing at all until the destination route's chunk has
 * loaded and mounted -- the UI just sits frozen for a beat, which reads as
 * unresponsive even when the underlying work is fast. This paints instantly
 * so a click always gets immediate feedback.
 */
export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pt-6 pb-20 sm:px-7">
      <div className="mb-7 flex items-end justify-between gap-3 border-b border-border pb-5">
        <div className="min-w-0">
          <Skeleton className="mb-3 h-[2px] w-8" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="mt-2.5 h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28 shrink-0" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <Skeleton className="mt-6 h-72 w-full" />
    </div>
  );
}
