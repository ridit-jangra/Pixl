// Shared loading UI. Rendered by Next.js loading.tsx boundaries the instant a
// navigation starts, so slow server components (the review page fetches
// GitHub / Hackatime / YSWS) show feedback immediately instead of a frozen tab.

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[70vh] text-muted-foreground">
      <div className="w-56 max-w-[70vw] h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 rounded-full bg-primary animate-[indeterminate_1.15s_ease-in-out_infinite]" />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Bar({ w = "100%" }: { w?: string }) {
  return <Skeleton className="block h-4" style={{ width: w }} />;
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Bar key={i} w={`${90 - i * 15}%`} />
        ))}
      </CardContent>
    </Card>
  );
}
