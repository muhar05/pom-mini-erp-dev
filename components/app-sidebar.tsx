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
import { MenuItem } from "@/config/sidebar";
import { SidebarItem } from "@/components/nav-main";

// Fungsi konversi rekursif
function convertMenuToSidebar(items: MenuItem[]): SidebarItem[] {
  return items.map((item) => {
    if (item.items && item.items.length > 0) {
      // Untuk group, sub-menu HARUS bertipe { title, url, circleColor }
      return {
        title: item.title,
        icon: item.icon,
        // Tidak perlu url/circleColor di group
        items: item.items.map((sub) => ({
          title: sub.title,
          url: sub.url ?? "#",
          circleColor: "bg-primary", // atau warna lain sesuai kebutuhan
        })),
      };
    }
    // Untuk leaf menu
    return {
      title: item.title,
      url: item.url,
      icon: item.icon,
      circleColor: "bg-primary", 
    };
  });
}

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

  // Tambahkan konversi di sini
  const sidebarItems = convertMenuToSidebar(menuItems);

  return (
    <Sidebar collapsible="icon" {...props} className="hidden xl:block">
      <SidebarHeader>
        <LogoSidebar />
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin scrollbar-invisible hover:scrollbar-visible">
        <NavMain items={sidebarItems} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
