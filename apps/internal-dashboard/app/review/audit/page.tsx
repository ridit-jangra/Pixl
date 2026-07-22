import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePagePerm } from "@/lib/guard";
import { listReviewAudits, countPendingReviews } from "@/lib/db";
import { ReviewTabs } from "@/app/_components/ReviewTabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const VERDICT_VARIANT: Record<
  string,
  "success" | "secondary" | "warning" | "destructive"
> = {
  approved: "success",
  first_pass_approved: "secondary",
  needs_changes: "warning",
  reverted: "destructive",
};

export default async function AuditNotesPage() {
  const access = await requirePagePerm(["review"]);
  if (!access.isSuper) redirect("/review");
  const [audits, pending] = await Promise.all([listReviewAudits(200), countPendingReviews()]);
  const withNotes = audits.filter((a) => a.audit_note && a.audit_note.trim() !== "");

  return (
    <div>
      <ReviewTabs isSuper={access.isSuper} pending={pending} />
      <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
        Internal notes reviewers write with every verdict. Players never see these , they&apos;re
        for audits and fraud checks.
      </p>
      {withNotes.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          No audit notes yet , they&apos;ll appear as reviews come in.
        </Card>
      ) : (
        <div className="space-y-4">
          {withNotes.map((a) => (
            <Card key={a.id} className="p-5 gap-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/projects/${a.project_id}`}
                  className="font-semibold hover:text-brand"
                >
                  {a.project_name}
                </Link>
                <Badge variant={VERDICT_VARIANT[a.verdict] ?? "secondary"}>
                  {a.verdict.replaceAll("_", " ")}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  by {a.reviewer.replace(/\s*\([^)]*\)\s*$/, "")} · player{" "}
                  <Link href={`/players/${a.user_id}`} className="hover:text-brand">
                    {a.player_name}
                  </Link>
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-foreground/80 mt-3 whitespace-pre-wrap">{a.audit_note}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
