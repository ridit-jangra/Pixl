import { redirect } from "next/navigation";
import { getAccess } from "@/lib/guard";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function RemovedPage() {
  const access = await getAccess();
  if (access) redirect("/");
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="p-8 w-full max-w-md gap-0">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand text-white font-bold">
            P
          </span>
          <div>
            <div className="font-semibold text-lg tracking-tight leading-none">Pixl</div>
            <div className="text-xs text-muted-foreground mt-1">Team HQ</div>
          </div>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          You&apos;ve been removed from the team
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Hey {session.name || "there"} , your access to the Pixl dashboard has been
          removed, so there&apos;s nothing for you here anymore.
        </p>
        <p className="text-sm text-muted-foreground mt-3 mb-6">
          If you think this was a mistake, reach out to the Pixl team and they&apos;ll sort
          you out.
        </p>
        <form action="/api/auth/logout" method="post">
          <Button className="bg-ink text-white hover:bg-ink/90 w-full">
            Sign out
          </Button>
        </form>
      </Card>
    </div>
  );
}
