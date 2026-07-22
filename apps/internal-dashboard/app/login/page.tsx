import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message =
    error === "denied"
      ? "That Slack account isn't on the Pixl team (or was removed). If you think that's a mistake, contact the Pixl team."
      : error
        ? "Sign-in failed , try again."
        : null;
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="p-8 w-full max-w-sm gap-0">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand text-white font-bold">
            P
          </span>
          <div>
            <div className="font-semibold text-lg tracking-tight leading-none">Pixl</div>
            <div className="text-xs text-muted-foreground mt-1">Team HQ</div>
          </div>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Access is limited to approved Slack accounts.
        </p>
        {message && (
          <Alert variant="destructive" className="mb-5">
            <AlertDescription className="text-destructive">{message}</AlertDescription>
          </Alert>
        )}
        <Button asChild className="bg-ink text-white hover:bg-ink/90 w-full">
          <a href="/api/auth/login">Continue with Slack</a>
        </Button>
      </Card>
    </div>
  );
}
