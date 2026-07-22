import Link from "next/link";
import { requirePagePerm } from "@/lib/guard";
import { listBans, listBanLog, banIsActive } from "@/lib/db";
import { LiftBanForm } from "@/app/_components/Moderate";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function BansPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requirePagePerm(["warn", "ban"]);
  const { tab } = await searchParams;
  const active = tab === "logs" ? "logs" : "bans";
  const bans = active === "bans" ? await listBans() : [];
  const log = active === "logs" ? await listBanLog() : [];

  const tabs = [
    { key: "bans", label: "Bans", href: "/bans" },
    { key: "logs", label: "Ban log", href: "/bans?tab=logs" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Bans</h1>
      <p className="text-sm text-muted-foreground mb-5">
        {active === "bans"
          ? "Every ban ever issued, newest first. Lifting removes all active bans for that player."
          : "Every ban and lift action with who did it, newest first."}
      </p>

      <div className="flex gap-1 rounded-md border border-border p-1 w-fit mb-6">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`px-3.5 py-1.5 text-sm rounded transition-colors ${
              active === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {active === "bans" ? (
        <Card className="overflow-hidden py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="p-3">Player</TableHead>
                  <TableHead className="p-3">Reason</TableHead>
                  <TableHead className="p-3">Banned by</TableHead>
                  <TableHead className="p-3">Expires</TableHead>
                  <TableHead className="p-3">Status</TableHead>
                  <TableHead className="p-3">Issued</TableHead>
                  <TableHead className="p-3"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bans.map((b) => {
                  const isActive = banIsActive(b);
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="p-3">
                        <Link href={`/players/${b.user_id}`} className="font-bold hover:text-brand">
                          {b.users?.display_name ?? b.user_id}
                        </Link>
                      </TableCell>
                      <TableCell className="p-3 max-w-64">
                        <div className="truncate">{b.reason || ","}</div>
                      </TableCell>
                      <TableCell className="p-3 text-foreground/70">{b.banned_by}</TableCell>
                      <TableCell className="p-3 text-muted-foreground">
                        {b.expires_at ? new Date(b.expires_at).toLocaleString() : "never"}
                      </TableCell>
                      <TableCell className="p-3">
                        {isActive ? (
                          <Badge className="bg-brand text-white">active</Badge>
                        ) : b.lifted_at ? (
                          <Badge variant="success">lifted</Badge>
                        ) : (
                          <Badge variant="secondary">expired</Badge>
                        )}
                      </TableCell>
                      <TableCell className="p-3 text-muted-foreground">
                        {new Date(b.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="p-3">{isActive && <LiftBanForm userId={b.user_id} />}</TableCell>
                    </TableRow>
                  );
                })}
                {bans.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="p-5 text-muted-foreground" colSpan={7}>
                      No bans issued yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <Card className="divide-y divide-border py-0">
          {log.length === 0 && (
            <div className="p-5 text-muted-foreground text-sm">No ban actions yet.</div>
          )}
          {log.map((r) => (
            <div key={r.id} className="p-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <Badge variant={r.action === "ban" ? "destructive" : "success"} className="shrink-0">
                {r.action === "ban" ? "banned" : "lifted"}
              </Badge>
              <div className="flex-1 min-w-48">
                <span className="font-bold">{r.actor}</span>
                {" → "}
                <Link href={`/players/${r.user_id}`} className="font-bold hover:text-brand">
                  {r.player_name}
                </Link>
                <div className="text-foreground/70 break-words">{r.detail}</div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {new Date(r.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
