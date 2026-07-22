import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/guard";
import { listSidequests } from "@/lib/db";
import { addSidequest, toggleSidequest, deleteSidequest } from "@/app/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function SidequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const access = await requireAdmin();
  if (!access.isSuper) redirect("/");
  const { error, created } = await searchParams;
  const quests = await listSidequests();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Sidequests</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          The quest log every player sees in-game (J key). Players will unlock quests by
          talking to the NPC you name here , the unlock wiring comes with the NPC work;
          for now this is the master list.
        </p>
      </div>

      {created && (
        <Alert>
          <AlertDescription className="font-medium text-emerald-600 dark:text-emerald-400">
            Sidequest added.
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="font-medium text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-5 md:p-6 gap-0">
        <div className="text-base font-semibold mb-4">Add a sidequest</div>
        <form action={addSidequest} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Label className="block font-normal">
              <span className="block text-sm font-medium mb-1.5">Name</span>
              <Input
                name="name"
                required
                maxLength={80}
                placeholder="e.g. Secure the Cyberpunk City network"
                className="w-full text-sm"
              />
            </Label>
            <Label className="block font-normal">
              <span className="block text-sm font-medium mb-1.5">Region</span>
              <Input
                name="region"
                maxLength={40}
                placeholder="e.g. Cyberpunk City"
                className="w-full text-sm"
              />
            </Label>
            <Label className="block font-normal">
              <span className="block text-sm font-medium mb-1.5">NPC who gives it</span>
              <Input
                name="npc"
                maxLength={40}
                placeholder="e.g. The Netrunner"
                className="w-full text-sm"
              />
            </Label>
          </div>
          <Label className="block font-normal">
            <span className="block text-sm font-medium mb-1.5">Description (what to build)</span>
            <Input
              name="description"
              maxLength={500}
              placeholder="Build a security tool or CTF-style challenge…"
              className="w-full text-sm"
            />
          </Label>
          <Label className="block font-normal">
            <span className="block text-sm font-medium mb-1.5">Reward (shown to players)</span>
            <Input
              name="reward"
              maxLength={120}
              placeholder="e.g. Flipper Zero"
              className="w-full text-sm"
            />
          </Label>
          <PendingButton className="bg-brand text-white border-transparent" pendingText="Adding…">
            Add sidequest
          </PendingButton>
        </form>
      </Card>

      <div className="space-y-3">
        {quests.map((q) => (
          <Card
            key={q.id}
            className={`p-4 gap-0 flex-row items-start justify-between flex-wrap ${
              q.active ? "" : "opacity-60"
            }`}
          >
            <div className="min-w-0">
              <div className="font-bold flex items-center gap-2 flex-wrap">
                {q.name}
                {q.region && <Badge variant="secondary">{q.region}</Badge>}
                {!q.active && <Badge variant="secondary">hidden</Badge>}
              </div>
              {q.description && <div className="text-sm text-muted-foreground mt-1">{q.description}</div>}
              <div className="text-xs text-muted-foreground mt-1">
                {q.npc ? `given by ${q.npc}` : "no NPC set"}
                {q.reward ? ` · reward: ${q.reward}` : ""}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <form action={toggleSidequest}>
                <input type="hidden" name="id" value={q.id} />
                <input type="hidden" name="active" value={q.active ? "0" : "1"} />
                <PendingButton
                  variant="outline"
                  size="sm"
                  pendingText={q.active ? "Hiding…" : "Showing…"}
                >
                  {q.active ? "Hide" : "Show"}
                </PendingButton>
              </form>
              <form action={deleteSidequest}>
                <input type="hidden" name="id" value={q.id} />
                <PendingButton
                  variant="outline"
                  size="sm"
                  pendingText="Deleting…"
                  confirm={`Delete sidequest "${q.name}"? This can't be undone.`}
                  className="text-rose-600 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600"
                >
                  Delete
                </PendingButton>
              </form>
            </div>
          </Card>
        ))}
        {quests.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            No sidequests yet , the landing page&apos;s sidequest rewards are good seeds.
          </Card>
        )}
      </div>
    </div>
  );
}
