import { listTeamLog, type TeamLogRow } from "@/lib/db";
import { undoTeamChange } from "@/app/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

function describe(row: TeamLogRow): string {
  const before = row.before ?? [];
  const after = row.after ?? [];
  const fmt = (p: string[]) => {
    const shown = p.filter((x) => x !== "no_review");
    const base = shown.length > 0 ? shown.join(", ") : "nothing";
    return p.includes("no_review") ? `${base} (review blocked)` : base;
  };
  switch (row.action) {
    case "added":
      return `added to the team with ${fmt(after)}`;
    case "removed":
      return after.length > 0
        ? `removed (kept ${fmt(after)})`
        : `removed from the team (had ${fmt(before)})`;
    case "updated":
      return `permissions changed: ${fmt(before)} → ${fmt(after)}`;
    case "undo":
      return `change undone: ${fmt(before)} → ${fmt(after)}`;
    default:
      return `${row.action}: ${fmt(before)} → ${fmt(after)}`;
  }
}

const ACTION_VARIANT: Record<
  string,
  "success" | "destructive" | "secondary" | "warning"
> = {
  added: "success",
  removed: "destructive",
  updated: "secondary",
  undo: "warning",
};

export async function TeamLog() {
  const rows = await listTeamLog(20);
  if (rows.length === 0) return null;
  return (
    <div>
      <div className="text-sm font-medium text-muted-foreground mb-3">Team log</div>
      <Card className="overflow-hidden py-0">
        <Table>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-transparent">
                <TableCell className="p-4 align-top whitespace-normal">
                  <div className="text-sm">
                    <span className="font-semibold">
                      {row.name || row.slack_id}
                    </span>{" "}
                    <Badge
                      variant={ACTION_VARIANT[row.action] ?? "secondary"}
                      className="text-[0.65rem] uppercase tracking-wide align-middle mx-1"
                    >
                      {row.action}
                    </Badge>
                    <span className="text-foreground/70">{describe(row)}</span>
                  </div>
                  {row.reason && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Reason: {row.reason}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    by {row.actor || "unknown"} ·{" "}
                    {new Date(row.created_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </TableCell>
                <TableCell className="p-4 align-top text-right w-px">
                  {row.action !== "undo" && (
                    <form action={undoTeamChange}>
                      <input type="hidden" name="id" value={row.id} />
                      <PendingButton
                        variant="outline"
                        size="sm"
                        pendingText="Undoing…"
                        confirm="Undo this team change?"
                      >
                        Undo
                      </PendingButton>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
