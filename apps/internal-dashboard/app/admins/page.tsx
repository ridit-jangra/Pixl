import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin, SUBADMIN_PERMISSIONS } from "@/lib/guard";
import { listAdmins } from "@/lib/db";
import { addAdmin, removeAdmin, updateAdminPerms } from "@/app/actions";
import { slackHandles } from "@/lib/slack";
import { TeamLog } from "@/app/_components/TeamLog";
import { PendingButton } from "@/app/_components/PendingButton";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

const PERM_INFO: Record<string, { label: string; desc: string }> = {
  warn: { label: "Warn", desc: "Send warnings to players" },
  ban: { label: "Ban", desc: "Ban and unban players" },
  notify: { label: "Notify", desc: "Send broadcast notifications" },
};

function PermToggles({
  name,
  checked,
}: {
  name: string;
  checked: (p: string) => boolean;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {SUBADMIN_PERMISSIONS.map((p) => (
        <Label
          key={p}
          className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 cursor-pointer transition-colors font-normal has-data-[state=checked]:border-brand/40 has-data-[state=checked]:bg-brand/5 hover:bg-muted/50"
        >
          <Checkbox
            name={name}
            value={p}
            defaultChecked={checked(p)}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium leading-none">{PERM_INFO[p].label}</span>
            <span className="block text-xs text-muted-foreground mt-1">{PERM_INFO[p].desc}</span>
          </span>
        </Label>
      ))}
    </div>
  );
}

const PER = 8;

export default async function AdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await requireAdmin();
  if (!access.isSuper) redirect("/");
  const { page } = await searchParams;
  const allAdmins = (await listAdmins()).filter((a) =>
    a.permissions.some((p) => (SUBADMIN_PERMISSIONS as readonly string[]).includes(p)),
  );
  const pages = Math.max(1, Math.ceil(allAdmins.length / PER));
  const cur = Math.min(Math.max(parseInt(page ?? "1", 10) || 1, 1), pages);
  const start = (cur - 1) * PER;
  const admins = allAdmins.slice(start, start + PER);
  const handles = await slackHandles(admins.map((a) => a.slack_id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Sub-admins</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Owners always have every permission. Sub-admins sign in with Slack and only get the
          permissions you grant here. Reviewers are managed on the{" "}
          <Link href="/reviewers" className="text-brand underline">
            Reviewers
          </Link>{" "}
          tab.
        </p>
      </div>

      <Card className="p-5 md:p-6 gap-0">
        <div className="text-base font-semibold mb-4">Add a sub-admin</div>
        <form action={addAdmin} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Label className="block font-normal">
              <span className="block text-sm font-medium mb-1.5">Name</span>
              <Input
                name="name"
                placeholder="e.g. Alex Rivera"
                className="w-full text-sm"
              />
            </Label>
            <Label className="block font-normal">
              <span className="block text-sm font-medium mb-1.5">Slack member ID</span>
              <Input
                name="slackId"
                required
                placeholder="U0XXXXXXX"
                className="w-full text-sm font-mono"
              />
              <span className="block text-xs text-muted-foreground mt-1">
                Slack → profile → ⋯ → Copy member ID
              </span>
            </Label>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Permissions</div>
            <PermToggles name="perms" checked={() => false} />
          </div>

          <div className="flex justify-end">
            <PendingButton
              className="bg-brand text-white border-transparent"
              pendingText="Adding…"
            >
              Add sub-admin
            </PendingButton>
          </div>
        </form>
      </Card>

      <div>
        <div className="text-sm font-medium text-muted-foreground mb-3">
          {allAdmins.length} sub-admin{allAdmins.length === 1 ? "" : "s"}
        </div>
        {allAdmins.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            No sub-admins yet. Add someone above to share the workload.
          </Card>
        ) : (
          <div className="space-y-4">
            {admins.map((a) => {
              const handle = (a.slack_id && handles.get(a.slack_id)) ?? a.slack_id;
              const initials =
                (a.name || handle || "?")
                  .split(/\s+/)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "?";
              return (
                <Card key={a.slack_id} className="p-5 gap-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid place-items-center w-10 h-10 rounded-full bg-brand/10 text-brand text-sm font-semibold shrink-0">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{a.name || handle}</div>
                        <div className="text-xs text-muted-foreground truncate font-mono">
                          {handle}
                          {a.added_by ? ` · added by ${a.added_by}` : ""}
                        </div>
                      </div>
                    </div>
                    <form action={removeAdmin} className="flex items-center gap-2 flex-wrap">
                      <input type="hidden" name="slackId" value={a.slack_id} />
                      <Input
                        name="reason"
                        required
                        maxLength={500}
                        placeholder="Reason (sent to them)"
                        className="text-sm w-44"
                      />
                      <PendingButton
                        variant="outline"
                        pendingText="Removing…"
                        confirm={`Remove ${a.name || handle} as a sub-admin?`}
                        className="text-rose-600 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600"
                      >
                        Remove
                      </PendingButton>
                    </form>
                  </div>

                  <form action={updateAdminPerms} className="mt-4">
                    <input type="hidden" name="slackId" value={a.slack_id} />
                    <PermToggles name="perms" checked={(p) => a.permissions.includes(p)} />
                    <div className="flex justify-end mt-3">
                      <PendingButton variant="outline" pendingText="Saving…">
                        Save permissions
                      </PendingButton>
                    </div>
                  </form>
                </Card>
              );
            })}
          </div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between gap-3 mt-4 text-sm">
            <span className="text-muted-foreground">
              Showing {start + 1}–{Math.min(start + PER, allAdmins.length)} of {allAdmins.length}
            </span>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    href={`/admins?page=${cur - 1}`}
                    aria-label="Previous page"
                    className={cur <= 1 ? "pointer-events-none opacity-40" : ""}
                  >
                    ←
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-muted-foreground tabular-nums">
                    {cur} / {pages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href={`/admins?page=${cur + 1}`}
                    aria-label="Next page"
                    className={cur >= pages ? "pointer-events-none opacity-40" : ""}
                  >
                    →
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <TeamLog />
    </div>
  );
}
