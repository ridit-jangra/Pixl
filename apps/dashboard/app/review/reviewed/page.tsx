import { requirePagePerm } from "@/lib/guard";
import { listReviewedProjects, countPendingReviews } from "@/lib/db";
import { slackHandles } from "@/lib/slack";
import { ReviewTabs } from "@/app/_components/ReviewTabs";
import { ReviewTable } from "@/app/_components/ReviewTable";

export const dynamic = "force-dynamic";

export default async function ReviewedPage() {
  const access = await requirePagePerm(["review"]);
  const [rows, pending] = await Promise.all([listReviewedProjects(), countPendingReviews()]);
  const handles = await slackHandles(rows.map((p) => p.users?.slack_id));

  return (
    <div>
      <ReviewTabs isSuper={access.isSuper} pending={pending} />
      <div className="text-sm text-muted-foreground mb-4">{rows.length} reviewed</div>
      <ReviewTable rows={rows} handles={handles} emptyLabel="No projects reviewed yet." />
    </div>
  );
}
