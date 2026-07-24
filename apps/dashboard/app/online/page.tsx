import Link from "next/link";
import { requirePagePerm } from "@/lib/guard";
import { fetchOnlinePlayers, gameServerConfigured } from "@/lib/gameServer";
import { kickPlayer } from "@/app/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

function sceneLabel(scene: string): string {
  if (scene.startsWith("village")) return "village";
  if (scene.startsWith("lobby:")) return `lobby ${scene.slice(6)}`;
  return scene.replaceAll("_", " ");
}

export default async function OnlinePage() {
  const access = await requirePagePerm(["warn", "ban"]);
  const canKick = access.perms.has("ban");
  const players = await fetchOnlinePlayers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Online now</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live view from the game server. Kicking disconnects the player immediately; they can
          reconnect unless you ban them.
        </p>
      </div>

      {players === null ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          {gameServerConfigured()
            ? "Couldn't reach the game server. It might be restarting , try again in a minute."
            : "Not configured , set PIXL_SERVER_URL and ADMIN_API_KEY in the dashboard env."}
        </Card>
      ) : players.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          Nobody&apos;s online right now.
        </Card>
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="p-3">Player</TableHead>
                <TableHead className="p-3">Where</TableHead>
                {canKick && <TableHead className="p-3">Kick</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((p) => (
                <TableRow key={p.userId}>
                  <TableCell className="p-3">
                    <Link href={`/players/${p.userId}`} className="font-bold hover:text-brand">
                      {p.displayName || "Player"}
                    </Link>
                    <div className="text-xs text-muted-foreground font-mono">{p.userId}</div>
                  </TableCell>
                  <TableCell className="p-3">
                    <Badge variant="success">{sceneLabel(p.scene)}</Badge>
                  </TableCell>
                  {canKick && (
                    <TableCell className="p-3">
                      <form action={kickPlayer} className="flex gap-2 items-center flex-wrap">
                        <input type="hidden" name="userId" value={p.userId} />
                        <Input
                          name="reason"
                          maxLength={100}
                          placeholder="Reason (optional)"
                          className="text-sm w-44"
                        />
                        <PendingButton
                          className="bg-tang text-white hover:bg-tang/90"
                          pendingText="Kicking…"
                          confirm={`Kick ${p.displayName || "this player"}? They'll be disconnected immediately.`}
                        >
                          Kick
                        </PendingButton>
                      </form>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        {players !== null &&
          `${players.length} player${players.length === 1 ? "" : "s"} online · refresh the page to update`}
      </div>
    </div>
  );
}
