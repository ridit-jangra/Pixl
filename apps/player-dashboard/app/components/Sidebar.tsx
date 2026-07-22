"use client";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const active = usePathname();
  const router = useRouter();

  const groups = [
    {
      name: "Dashboard",
      items: [
        { label: "Overview", shortcut: ["Ctrl", "O"], href: "/" },
        { label: "Projects", shortcut: ["Ctrl", "P"], href: "/projects" },
      ],
    },
    {
      name: "Community",
      items: [
        { label: "Explore", shortcut: ["Ctrl", "E"], href: "/explore" },
        { label: "Leaderboard", shortcut: ["Ctrl", "L"], href: "/explore?tab=leaderboard" },
      ],
    },
    {
      name: "Shop",
      items: [
        { label: "Shop", shortcut: ["Ctrl", "S"], href: "/shop" },
        { label: "Orders", shortcut: ["Ctrl", "Shift", "O"], href: "/orders" },
      ],
    },
    {
      name: "World",
      items: [
        { label: "Quests", shortcut: ["Ctrl", "Q"], href: "/quests" },
        { label: "Vault", shortcut: ["Ctrl", "V"], href: "/vault" },
        { label: "Timeline", shortcut: ["Ctrl", "T"], href: "/timeline" },
      ],
    },
    {
      name: "Support",
      items: [
        { label: "Report", shortcut: ["Ctrl", "R"], href: "/report" },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu className="flex justify-center items-center">
          <SidebarMenuItem className="flex items-center gap-2">
            <Image src={"/p.png"} alt="pixl" width={50} height={50} />
            <Image src={"/i.png"} alt="pixl" width={50} height={50} />
            <Image src={"/x.png"} alt="pixl" width={50} height={50} />
            <Image src={"/l.png"} alt="pixl" width={50} height={50} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g, i) => (
          <SidebarGroup key={i}>
            <SidebarGroupLabel>{g.name}</SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              {g.items.map((item, j) => (
                <Tooltip key={j}>
                  <TooltipContent side="right">
                    {item.label}{" "}
                    <KbdGroup>
                      {item.shortcut.map((s, k) => (
                        <Kbd key={k}>{s}</Kbd>
                      ))}
                    </KbdGroup>
                  </TooltipContent>
                  <TooltipTrigger>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={cn(
                          active === item.href?.split("?")[0] &&
                            "bg-red hover:bg-red text-black/90",
                        )}
                        onClick={() => {
                          router.push(item.href);
                        }}
                      >
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </TooltipTrigger>
                </Tooltip>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button className={"w-full"}>Logout</Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
