"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const isNew = searchParams.get("new") === "1";

    if (token) {
      localStorage.setItem("pixl_token", token);
      if (name) {
        localStorage.setItem("pixl_name", name);
      }
      localStorage.setItem("pixl_is_new", isNew ? "1" : "0");
      router.replace("/");
    } else {
      router.replace("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">Signing you in...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
