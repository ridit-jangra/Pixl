"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function ReviewTabs({
  isSuper,
  pending,
}: {
  isSuper: boolean;
  pending?: number;
}) {
  const pathname = usePathname();
  const tabs: { href: string; label: string; count?: number }[] = [
    { href: "/review", label: "Needs review", count: pending },
    { href: "/review/reviewed", label: "Reviewed" },
    { href: "/review/stats", label: "Stats" },
  ];
  if (isSuper) {
    tabs.push({ href: "/review/log", label: "Reviewer log" });
    tabs.push({ href: "/review/audit", label: "Audit notes" });
  }

  const active = tabs.find((t) => t.href === pathname)?.href ?? "/review";

  return (
    <Tabs value={active} className="mb-6">
      <TabsList variant="line" className="h-auto border-b border-border w-full justify-start rounded-none pb-0">
        {tabs.map((t) => (
          <TabsTrigger key={t.href} value={t.href} asChild className="pb-3">
            <Link href={t.href}>
              {t.label}
              {t.count ? (
                <Badge
                  variant={t.href === active ? "default" : "secondary"}
                  className="ml-1"
                >
                  {t.count}
                </Badge>
              ) : null}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
