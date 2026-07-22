"use client";

import { Button } from "@pixl/ui/button";

const SERVER_URL = "https://server.pixl.rsvp";

export default function Login() {
  function handleLogin() {
    const callbackUrl = window.location.origin + "/auth/callback";
    window.location.href =
      SERVER_URL +
      "/auth/hackclub?web_redirect=" +
      encodeURIComponent(callbackUrl);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight">PIXL</h1>
        <p className="text-muted-foreground max-w-sm text-center">
          Log in with your Hack Club account to access the player dashboard.
        </p>
        <Button size="lg" onClick={handleLogin}>
          Log in with Hack Club
        </Button>
      </div>
    </div>
  );
}
