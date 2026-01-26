"use client";

import { useSession } from "@/contexts/session-context";
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

function convertMenuToSidebar(items: MenuItem[]): SidebarItem[] {
  if (!items) return [];
  return items.map((item) => {
    if (item.items && item.items.length > 0) {
      return {
        title: item.title,
        labelKey: item.labelKey,
        icon: item.icon,
        items: item.items.map((sub) => ({
          title: sub.title,
          labelKey: sub.labelKey,
          url: sub.url ?? "#",
          circleColor: getColorByTitle(sub.title),
        })),
      };
    }

    return {
      title: item.title,
      labelKey: item.labelKey,
      url: item.url,
      icon: item.icon,
    };
  });

}

// mapping warna bullet
// mapping warna bullet
function getColorByTitle(title: string) {
  const map: Record<string, string> = {
    // Dashboard
    CRM: "bg-emerald-500",
    Sales: "bg-blue-500",
    Finance: "bg-yellow-500",
    Purchase: "bg-purple-500",
    Warehouse: "bg-orange-500",
    Delivery: "bg-red-500",

    // CRM
    "Lead List": "bg-emerald-500",
    Opportunity: "bg-blue-500",

    // Sales
    "Quotation (SQ)": "bg-purple-500",
    "Sales Order (SO)": "bg-orange-500",

    // Purchasing
    "Purchase Order": "bg-red-500",
    "Purchase Request": "bg-pink-500",

    // Warehouse
    "Stock Reservation (SR)": "bg-yellow-500",
    "Goods Receipt (GR)": "bg-green-500",

    // Logistics
    "Delivery Request (DR)": "bg-blue-500",

    // Inventory
    "Stock List": "bg-orange-500",
    "Stock Movements": "bg-gray-500",

    // Finance
    FAR: "bg-yellow-500",

    // Settings
    Users: "bg-blue-500",
    Company: "bg-green-500",

    // Master
    "Customer List": "bg-emerald-500",
    "Company List": "bg-blue-500",
    "Product List": "bg-purple-500",
    "Vendor List": "bg-pink-500",
  };

  return map[title] ?? "bg-gray-400";
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const session = useSession();

  const roleMap: Record<string, keyof typeof sidebarMenuByRole> = {
    "1": "superuser",
    "2": "sales",
    "3": "warehouse",
    "4": "finance",
    "5": "purchasing",
    "6": "manager-sales",
    "7": "manager-warehouse",
    "8": "manager-finance",
    "9": "manager-purchasing",
  };

  const roleName = roleMap[session?.user?.role_id ?? "2"];
  const menuItems = sidebarMenuByRole[roleName];

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
