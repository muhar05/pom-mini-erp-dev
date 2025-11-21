"use client";

import { useSession } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import LogoSidebar from "./shared/logo-sidebar";
import { sidebarMenuByRole } from "@/config/sidebar";
import { NavMain } from "@/components/nav-main";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const roleMap: Record<string, keyof typeof sidebarMenuByRole> = {
    "1": "superuser",
    "2": "sales",
    "3": "warehouse",
    "4": "finance",
    "5": "purchasing",
  };

  const roleName = roleMap[session?.user?.role_id ?? "2"];
  const menuItems = sidebarMenuByRole[roleName];

  return (
    <Sidebar collapsible="icon" {...props} className="hidden xl:block">
      <SidebarHeader>
        <LogoSidebar />
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin scrollbar-invisible hover:scrollbar-visible">
        <NavMain items={menuItems} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
