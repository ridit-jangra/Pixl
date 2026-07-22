"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    let token = "";
    try {
      token = localStorage.getItem("pixl_token") || "";
    } catch {}

    if (!token && !isPublic) {
      redirected.current = true;
      router.replace("/login");
      return;
    }

    if (token && isPublic) {
      redirected.current = true;
      router.replace("/");
    }
  }, [router, pathname]);

  return <>{children}</>;
}
