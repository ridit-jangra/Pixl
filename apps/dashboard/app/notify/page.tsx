import { redirect } from "next/navigation";
import { requirePagePerm } from "@/lib/guard";
import { NotifyForm } from "@/app/_components/NotifyForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

export default async function NotifyPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const access = await requirePagePerm(["notify"]);
  if (!access.isSuper && !access.perms.has("notify")) redirect("/");
  const { sent, error } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Notify</h1>
      <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
        Drop a message into players&apos; in-game inbox (the [N] menu). Choose everyone or a
        single player.
      </p>

      {sent && (
        <Alert className="mb-4">
          <AlertDescription className="font-medium text-emerald-600 dark:text-emerald-400">
            Sent to {sent === "1" ? "1 player" : `${sent} players`}.
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="font-medium text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <NotifyForm />
    </div>
  );
}
