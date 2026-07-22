"use client";

import { Button } from "@pixl/ui/button";
import { Kbd, KbdGroup } from "@pixl/ui/kbd";
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
} from "@pixl/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@pixl/ui/tooltip";
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
        },
        {
          label: "Shop",
          shortcut: ["Ctrl", "S"],
          href: "/shop",
        },
        {
          label: "Orders",
          shortcut: ["Ctrl", "Shift", "O"],
          href: "/orders",
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
        },
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
              {g.items.map((i, j) => (
                <Tooltip key={j}>
                  <TooltipContent side="right">
                    {i.label}{" "}
                    <KbdGroup>
                      {i.shortcut.map((s, k) => (
                        <Kbd key={k}>{s}</Kbd>
                      ))}
                    </KbdGroup>
                  </TooltipContent>
                  <TooltipTrigger>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={cn(
                          active === i.href &&
                            "bg-red hover:bg-red text-black/90",
                        )}
                        onClick={() => {
                          router.push(i.href);
                        }}
                      >
                        {i.label}
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
