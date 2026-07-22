import { Bar, CardSkeleton } from "@/app/_components/Loading";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// The review detail page is the slowest (GitHub commits, Hackatime spans, YSWS
// archive). This skeleton mirrors its layout so a reviewer sees the shape of
// the page immediately while the analysis loads.
export default function Loading() {
  return (
    <div>
      <div className="text-sm text-muted-foreground">← Needs review</div>
      <div className="flex flex-col lg:flex-row gap-6 pb-24 mt-4">
        <div className="flex-1 min-w-0 space-y-5">
          <div className="space-y-3">
            <Bar w="180px" />
            <Skeleton className="h-9 w-2/3" />
            <Bar w="90%" />
          </div>
          <Skeleton className="h-56 w-full rounded-xl" />
          <Card className="p-1.5 flex-row gap-1">
            {["Commits", "Journals", "Past reviews", "Other YSWS"].map((t) => (
              <span key={t} className="px-3 py-1.5 text-sm text-muted-foreground">{t}</span>
            ))}
          </Card>
          <CardSkeleton lines={4} />
        </div>
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <CardSkeleton lines={3} />
          <CardSkeleton lines={5} />
        </div>
      </div>
    </div>
  );
}
