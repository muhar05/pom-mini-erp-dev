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

export interface SidebarItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  items?: { title: string; url: string; circleColor: string }[];
  circleColor?: string;
}

function RenderSidebarItems({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const isActive =
          item.url && (pathname === item.url || pathname.startsWith(item.url));

        // PARENT MENU
        if (item.items && item.items.length > 0) {
          return (
            <Collapsible key={item.title}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "cursor-pointer py-5.5 px-3 text-base transition-colors duration-200",
                    "text-[#2A2A2A] dark:text-white",
                    "hover:bg-[#006533]", // Remove hover:text-white here
                    "active:bg-[#35CD2C] active:text-white",
                    isActive ? "font-bold bg-[#35CD2C] text-white" : "",
                  )}
                >
                  {item.icon && <item.icon className="w-4.5! h-4.5!" />}
                  <span>{item.title}</span>
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
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubActive}
                          circleColor={sub.circleColor}
                          className="py-5.5 px-3 text-base hover:text-white cursor-pointer"
                        >
                          <Link
                            href={sub.url}
                            className="flex items-center gap-2 w-full"
                          >
                            <span className="text-black dark:text-white transition-colors duration-200">
                              {sub.title}
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
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
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={cn(
                  "cursor-pointer py-5.5 px-3 text-base transition-colors duration-200",
                  "text-[#2A2A2A] dark:text-white",
                  "hover:bg-[#006533] hover:text-white",
                  "active:bg-[#35CD2C] active:text-white",
                  isActive ? "font-bold bg-[#35CD2C] text-white" : "",
                )}
              >
                <Link href={item.url} className="flex items-center gap-2">
                  {item.icon && <item.icon className="w-4.5! h-4.5!" />}
                  <span>{item.title}</span>
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
