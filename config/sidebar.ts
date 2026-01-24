// config/sidebar.ts
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Settings,
  ShoppingCart,
  ClipboardList,
  Receipt,
  Package,
  Truck,
  Warehouse,
  FileText,
  FileBox,
  FileCheck,
  Building2,
  HandCoins,
  Wallet,
  Banknote,
  BadgeDollarSign,
  UserRound,
  Boxes,
} from "lucide-react";

export type MenuItem = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  items?: MenuItem[];
};

export const sidebarMenuByRole: Record<string, MenuItem[]> = {
  superuser: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      items: [
        { title: "Superuser", url: "/dashboard/superuser" },
        { title: "CRM", url: "/dashboard/crm" },
        { title: "Sales", url: "/dashboard/sales" },
        { title: "Finance", url: "/dashboard/finance" },
        { title: "Purchase", url: "/dashboard/purchase" },
        { title: "Warehouse", url: "/dashboard/warehouse" },
        { title: "Delivery", url: "/dashboard/delivery" },
      ],
    },

    {
      title: "CRM",
      icon: FileText,
      items: [
        { title: "Lead List", url: "/crm/leads", icon: Users },
        {
          title: "Opportunity",
          url: "/crm/opportunities",
          icon: ClipboardList,
        },
      ],
    },

    {
      title: "Sales",
      icon: ShoppingCart,
      items: [
        { title: "Quotation (SQ)", url: "/sales/quotations", icon: FileCheck },
        {
          title: "Sales Order (SO)",
          url: "/sales/sales-orders",
          icon: ShoppingCart,
        },
      ],
    },

    {
      title: "Purchasing",
      icon: FileBox,
      items: [
        { title: "Purchase Order", url: "/purchasing/purchase-orders" },
        { title: "Purchase Request", url: "/purchasing/requests" },
      ],
    },

    {
      title: "Warehouse",
      icon: Warehouse,
      items: [
        {
          title: "Stock Reservation (SR)",
          url: "/warehouse/reservations",
          icon: ClipboardList,
        },
        {
          title: "Goods Receipt (GR)",
          url: "/warehouse/receiving",
          icon: Package,
        },
      ],
    },

    {
      title: "Logistics",
      icon: Truck,
      items: [
        {
          title: "Delivery Request (DR)",
          url: "/warehouse/delivery/requests",
          icon: Truck,
        },
      ],
    },

    {
      title: "Inventory",
      icon: Boxes,
      items: [
        {
          title: "Stock List",
          url: "/warehouse/inventory/stocks",
          icon: Boxes,
        },
        {
          title: "Stock Movements",
          url: "/warehouse/inventory/movements",
          icon: FileText,
        },
      ],
    },

    {
      title: "Finance",
      icon: Wallet,
      items: [{ title: "FAR", url: "/finance/far", icon: BadgeDollarSign }],
    },

    {
      title: "Settings",
      icon: Settings,
      items: [
        { title: "Users", url: "/settings/users", icon: Users },
        { title: "Company", url: "/settings/company", icon: Building2 },
        {
          title: "Term of Payment",
          url: "/settings/term-of-payment",
          icon: Banknote,
        },
      ],
    },

    {
      title: "Master",
      icon: Settings,
      items: [
        { title: "Customer List", url: "/customers", icon: UserRound },
        { title: "Company List", url: "/companies", icon: Building2 },
        { title: "Product List", url: "/products", icon: Package },
        { title: "Vendor List", url: "/purchasing/vendors", icon: Building2 },
      ],
    },
  ],

  sales: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      items: [{ title: "Sales", url: "/dashboard/sales" }],
    },
    {
      title: "CRM",
      icon: FileText,
      items: [
        { title: "Lead List", url: "/crm/leads", icon: Users },
        {
          title: "Opportunity",
          url: "/crm/opportunities",
          icon: ClipboardList,
        },
      ],
    },
    {
      title: "Sales",
      icon: ShoppingCart,
      items: [
        { title: "Quotation (SQ)", url: "/sales/quotations", icon: FileCheck },
        {
          title: "Sales Order (SO)",
          url: "/sales/sales-orders",
          icon: ShoppingCart,
        },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      items: [
        { title: "Company", url: "/companies", icon: Building2 },
        {
          title: "Term of Payment",
          url: "/settings/term-of-payment",
          icon: Banknote,
        },
      ],
    },
  ],

  manager_sales: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      items: [{ title: "Manager Sales", url: "/dashboard/manager-sales" }],
    },
    {
      title: "Pending Task",
      icon: FileText,
      items: [
        {
          title: "Pending Task",
          url: "/manager-sales/pending-task",
          icon: FileText,
        },
      ],
    },
    {
      title: "CRM",
      icon: FileText,
      items: [
        { title: "Lead List", url: "/crm/leads", icon: Users },
        {
          title: "Opportunity",
          url: "/crm/opportunities",
          icon: ClipboardList,
        },
      ],
    },
    {
      title: "Sales",
      icon: ShoppingCart,
      items: [
        { title: "Quotation (SQ)", url: "/sales/quotations", icon: FileCheck },
        {
          title: "Sales Order (SO)",
          url: "/sales/sales-orders",
          icon: ShoppingCart,
        },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      items: [
        { title: "Company", url: "/companies", icon: Building2 },
        {
          title: "Term of Payment",
          url: "/settings/term-of-payment",
          icon: Banknote,
        },
      ],
    },
  ],
  purchasing: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      items: [{ title: "Purchasing", url: "/dashboard/purchasing" }],
    },
    {
      title: "Purchasing",
      icon: FileBox,
      items: [
        { title: "Purchase Order", url: "/purchasing/purchase-orders" },
        { title: "Purchase Request", url: "/purchasing/requests" },
      ],
    },
    {
      title: "Master",
      icon: Settings,
      items: [
        { title: "Vendor List", url: "/purchasing/vendors", icon: Building2 },
        { title: "Product List", url: "/products", icon: Package },
      ],
    },
  ],
  manager_purchasing: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      items: [{ title: "Purchasing", url: "/dashboard/manager-purchasing" }],
    },
    {
      title: "Purchasing",
      icon: FileBox,
      items: [
        { title: "Purchase Order", url: "/purchasing/purchase-orders" },
        { title: "Purchase Request", url: "/purchasing/requests" },
      ],
    },
    {
      title: "Master",
      icon: Settings,
      items: [
        { title: "Vendor List", url: "/purchasing/vendors", icon: Building2 },
        { title: "Product List", url: "/products", icon: Package },
      ],
    },
  ],
};
