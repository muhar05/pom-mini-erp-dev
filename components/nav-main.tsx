"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { cn } from "@/lib/utils";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/contexts/i18n-context";

export interface SidebarItem {
  title: string;
  labelKey?: string;
  url?: string;
  icon?: LucideIcon;
  items?: { title: string; labelKey?: string; url: string; circleColor: string }[];
  circleColor?: string;
}

function RenderSidebarItems({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <>
      {items.map((item) => {
        // Cek apakah parent menu aktif jika ada sub-menu yang aktif
        const isSubActive =
          item.items &&
          item.items.some(
            (sub) => pathname === sub.url || pathname.startsWith(sub.url),
          );
        const isActive =
          (item.url &&
            (pathname === item.url || pathname.startsWith(item.url))) ||
          isSubActive;

        // PARENT MENU
        if (item.items && item.items.length > 0) {
          return (
            <Collapsible key={item.title}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.labelKey ? t(item.labelKey) : item.title}
                  className={cn(
                    "cursor-pointer py-5.5 px-3 text-base transition-colors duration-200",
                    "text-[#2A2A2A] dark:text-white",
                    "hover:bg-[#006533]", // Remove hover:text-white here
                    "active:bg-[#35CD2C] active:text-white",
                    isActive ? "font-bold bg-[#35CD2C] text-white" : "",
                  )}
                >
                  {item.icon && <item.icon className="w-4.5! h-4.5!" />}
                  <span>{item.labelKey ? t(item.labelKey) : item.title}</span>
                  <ChevronRight className="ml-auto transition-transform" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub className="gap-0 mt-2 space-y-1 ml-4">
                  {/* SUB MENU */}
                  {item.items.map((sub) => {
                    const isSubActive =
                      pathname === sub.url || pathname.startsWith(sub.url);

                    return (
                      <SidebarMenuSubItem key={sub.title}>
                        <Link
                          href={sub.url}
                          className="flex items-center gap-2 w-full"
                        >
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubActive}
                            circleColor={sub.circleColor}
                            className="py-5.5 px-3 text-base hover:text-white cursor-pointer"
                          >
                            <span
                              className={cn(
                                "transition-colors duration-200",
                                isSubActive
                                  ? "text-white"
                                  : "text-black dark:text-white",
                              )}
                            >
                              {sub.labelKey ? t(sub.labelKey) : sub.title}
                            </span>
                          </SidebarMenuSubButton>
                        </Link>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          );
        }

        // MENU TANPA SUB
        if (item.url && item.title) {
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.url}
                  className="flex items-center gap-2 w-full h-full"
                  style={{ display: "flex", width: "100%", height: "100%" }}
                >
                  {item.icon && <item.icon className="w-4.5! h-4.5!" />}
                  <span>{item.labelKey ? t(item.labelKey) : item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }

        return null;
      })}
    </>
  );
}

// Ganti isi return NavMain:
export function NavMain({ items }: { items: SidebarItem[] }) {
  const isCollapsed = useSidebarCollapsed();

  return (
    <SidebarGroup className={`${isCollapsed ? "px-1.5" : ""}`}>
      <SidebarMenu>
        <RenderSidebarItems items={items} />
      </SidebarMenu>
    </SidebarGroup>
  );
}
