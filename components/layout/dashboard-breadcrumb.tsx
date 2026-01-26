"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { House } from "lucide-react";
import { useSession } from "@/contexts/session-context";
import { useI18n } from "@/contexts/i18n-context";
import { usePathname } from "next/navigation";

interface BreadcrumbData {
  title: string;
  text: string;
}

const DashboardBreadcrumb = ({ title, text }: BreadcrumbData) => {
  const session = useSession();
  const { t } = useI18n();
  const pathname = usePathname();

  // Logic to determine active section label based on URL
  const activeLabel = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const mainModule = segments[0];

    if (!mainModule || mainModule === "dashboard") {
      return t("sidebar.dashboard");
    }

    const moduleMap: Record<string, string> = {
      crm: "leads",
      sales: "sales_orders",
      purchasing: "purchasing",
      warehouse: "warehouse",
      finance: "finance",
      settings: "settings",
      customers: "customers",
      products: "products",
      companies: "master_data",
      superuser: "superuser",
    };

    const key = moduleMap[mainModule] || mainModule;
    const translated = t(`sidebar.${key}`);

    // Fallback to original segment if translation key doesn't exist
    return translated.startsWith("sidebar.") ? mainModule.charAt(0).toUpperCase() + mainModule.slice(1) : translated;
  }, [pathname, t]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
      <h6 className="text-2xl font-semibold">{title}</h6>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="flex items-center gap-2 font-medium text-base text-neutral-600 hover:text-primary dark:text-white dark:hover:text-primary"
            >
              <House size={16} />
              {activeLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="text-base">
            <BreadcrumbPage>{text}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default DashboardBreadcrumb;
