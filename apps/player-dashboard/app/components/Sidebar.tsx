"use client";

import { ThemeToggle } from "./theme-toggle";
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

  console.log(active);

  const groups = [
    {
      name: "Actions",
      items: [
        {
          label: "Overview",
          shortcut: ["Ctrl", "O"],
          href: "/",
          activeColor: "text-red",
          hoverColor: "hover:text-red",
        },
      ],
    },
    {
      name: "Shop",
      items: [
        {
          label: "Shop",
          shortcut: ["Ctrl", "S"],
          href: "/shop",
          activeColor: "text-orange",
          hoverColor: "hover:text-orange",
        },
        {
          label: "Orders",
          shortcut: ["Ctrl", "Shift", "o"],
          href: "/orders",
          activeColor: "text-yellow",
          hoverColor: "hover:text-yellow",
        },
      ],
    },
    {
      name: "Explore",
      items: [
        {
          label: "Players",
          shortcut: ["Ctrl", "P"],
          href: "/explore/players",
          activeColor: "text-green",
          hoverColor: "hover:text-green",
        },
        {
          label: "Projects",
          shortcut: ["Ctrl", "Shift", "P"],
          href: "/explore/projects",
          activeColor: "text-cyan",
          hoverColor: "hover:text-cyan",
        },
        {
          label: "Leaderboard",
          shortcut: ["Ctrl", "L"],
          href: "/explore/leaderboard",
          activeColor: "text-blue",
          hoverColor: "hover:text-blue",
        },
      ],
    },
    {
      name: "Help",
      items: [
        {
          label: "Report",
          shortcut: ["Ctrl", "R"],
          href: "/report",
          activeColor: "text-purple",
          hoverColor: "hover:text-purple",
        },
      ],
    },
    {
      name: "Projects",
      items: [
        {
          label: "All projects",
          shortcut: ["Ctrl", "N"],
          href: "/projects",
          activeColor: "text-hc-muted",
          hoverColor: "hover:text-hc-muted",
        },
      ],
    },
  ];

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <SidebarMenu className="flex justify-center items-center">
          <SidebarMenuItem className="flex items-center mt-5">
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
              {g.items.map((i, j) => (
                <SidebarMenuItem
                  key={j}
                  className={cn(
                    "transition-transform duration-200 hover:-translate-x-3.5",
                    active === i.href && "-translate-x-3.5",
                  )}
                >
                  <SidebarMenuButton
                    className={cn(
                      "hover:bg-transparent",
                      i.hoverColor,
                      active === i.href && i.activeColor,
                    )}
                    onClick={() => router.push(i.href)}
                  >
                    {i.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 w-full">
              <ThemeToggle />
              <Button className="flex-1">Logout</Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
