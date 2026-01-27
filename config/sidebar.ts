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
  labelKey?: string;
  url?: string;
  icon?: LucideIcon;
  items?: MenuItem[];
};


export const sidebarMenuByRole: Record<string, MenuItem[]> = {
  superuser: [
    {
      title: "Dashboard",
      labelKey: "sidebar.dashboard",
      icon: LayoutDashboard,
      items: [
        { title: "Superuser", labelKey: "sidebar.superuser", url: "/dashboard/superuser" },
        { title: "Sales", labelKey: "sidebar.sales_orders", url: "/dashboard/sales" },
        { title: "Finance", labelKey: "sidebar.finance", url: "/dashboard/finance" },
        { title: "Purchase", labelKey: "sidebar.purchasing", url: "/dashboard/purchasing" },
        { title: "Warehouse", labelKey: "sidebar.warehouse", url: "/dashboard/warehouse" },
        { title: "Delivery", labelKey: "sidebar.delivery_orders", url: "/dashboard/delivery" },
      ],
    },

    {
      title: "CRM",
      labelKey: "sidebar.leads",
      icon: FileText,
      items: [
        { title: "Lead List", labelKey: "sidebar.leads", url: "/crm/leads", icon: Users },
        {
          title: "Opportunity",
          labelKey: "sidebar.opportunities",
          url: "/crm/opportunities",
          icon: ClipboardList,
        },
      ],
    },

    {
      title: "Sales",
      labelKey: "sidebar.sales_orders",
      icon: ShoppingCart,
      items: [
        { title: "Quotation (SQ)", labelKey: "sidebar.quotations", url: "/sales/quotations", icon: FileCheck },
        {
          title: "Sales Order (SO)",
          labelKey: "sidebar.sales_orders",
          url: "/sales/sales-orders",
          icon: ShoppingCart,
        },
      ],
    },

    {
      title: "Purchasing",
      labelKey: "sidebar.purchasing",
      icon: FileBox,
      items: [
        {
          title: "Purchase Order",
          labelKey: "sidebar.purchase_orders",
          url: "/purchasing/purchase-orders",
          icon: ShoppingCart,
        },
        {
          title: "Stock Reservation",
          labelKey: "sidebar.stock_reservations",
          url: "/warehouse/reservations",
          icon: ClipboardList,
        },
        {
          title: "Delivery Request",
          labelKey: "sidebar.delivery_requests",
          url: "/warehouse/delivery/requests",
          icon: Truck,
        },
      ],
    },

    {
      title: "Warehouse",
      labelKey: "sidebar.warehouse",
      icon: Warehouse,
      items: [
        {
          title: "Delivery Order",
          labelKey: "sidebar.delivery_orders",
          url: "/warehouse/delivery/orders",
          icon: Truck,
        },
        {
          title: "Warehouse Stock",
          labelKey: "sidebar.warehouse",
          url: "/warehouse/inventory/stocks",
          icon: Boxes,
        },
        {
          title: "Stock Movements",
          labelKey: "sidebar.warehouse",
          url: "/warehouse/inventory/movements",
          icon: FileText,
        },
        {
          title: "Goods Receipt (GR)",
          labelKey: "sidebar.warehouse",
          url: "/warehouse/receiving",
          icon: Package,
        },
      ],
    },

    {
      title: "Finance",
      labelKey: "sidebar.finance",
      icon: Wallet,
      items: [
        {
          title: "Finance Approval",
          labelKey: "sidebar.approvals",
          url: "/finance/approvals",
          icon: FileCheck,
        },
        {
          title: "Finance Transactions",
          labelKey: "sidebar.finance",
          url: "/finance/transactions",
          icon: BadgeDollarSign,
        },
        { title: "FAR", labelKey: "sidebar.finance", url: "/finance/far", icon: BadgeDollarSign },
      ],
    },

    {
      title: "Settings",
      labelKey: "sidebar.settings",
      icon: Settings,
      items: [
        { title: "Users", labelKey: "sidebar.users", url: "/settings/users", icon: Users },
        { title: "Company", labelKey: "sidebar.master_data", url: "/settings/company", icon: Building2 },
        {
          title: "Term of Payment",
          labelKey: "sidebar.finance",
          url: "/settings/term-of-payment",
          icon: Banknote,
        },
      ],
    },

    {
      title: "Master",
      labelKey: "sidebar.master_data",
      icon: Settings,
      items: [
        { title: "Customer List", labelKey: "sidebar.customers", url: "/customers", icon: UserRound },
        { title: "Company List", labelKey: "sidebar.master_data", url: "/companies", icon: Building2 },
        { title: "Product List", labelKey: "sidebar.products", url: "/products", icon: Package },
        { title: "Vendor List", labelKey: "sidebar.purchasing", url: "/purchasing/vendors", icon: Building2 },
      ],
    },
  ],

  sales: [
    {
      title: "Dashboard",
      labelKey: "sidebar.dashboard",
      icon: LayoutDashboard,
      items: [{ title: "Sales", labelKey: "sidebar.sales", url: "/dashboard/sales" }],
    },
    {
      title: "CRM",
      labelKey: "sidebar.leads",
      icon: FileText,
      items: [
        { title: "Lead List", labelKey: "sidebar.leads", url: "/crm/leads", icon: Users },
        {
          title: "Opportunity",
          labelKey: "sidebar.opportunities",
          url: "/crm/opportunities",
          icon: ClipboardList,
        },
      ],
    },
    {
      title: "Sales",
      labelKey: "sidebar.sales",
      icon: ShoppingCart,
      items: [
        { title: "Quotation (SQ)", labelKey: "sidebar.quotations", url: "/sales/quotations", icon: FileCheck },
        {
          title: "Sales Order (SO)",
          labelKey: "sidebar.sales_orders",
          url: "/sales/sales-orders",
          icon: ShoppingCart,
        },
      ],
    },
    {
      title: "Stock",
      labelKey: "sidebar.warehouse",
      icon: Boxes,
      items: [
        {
          title: "View Stock",
          labelKey: "sidebar.warehouse",
          url: "/warehouse/inventory/stocks",
          icon: Boxes,
        },
      ],
    },
  ],

  "manager-sales": [
    {
      title: "Dashboard",
      labelKey: "sidebar.dashboard",
      icon: LayoutDashboard,
      items: [{ title: "Manager Sales", labelKey: "sidebar.manager_sales", url: "/dashboard/manager-sales" }],
    },
    {
      title: "CRM",
      labelKey: "sidebar.leads",
      icon: FileText,
      items: [
        { title: "Lead List", labelKey: "sidebar.leads", url: "/crm/leads", icon: Users },
        {
          title: "Opportunity",
          labelKey: "sidebar.opportunities",
          url: "/crm/opportunities",
          icon: ClipboardList,
        },
      ],
    },
    {
      title: "Approval",
      labelKey: "sidebar.approvals",
      icon: FileCheck,
      items: [
        {
          title: "Quotation Approval",
          labelKey: "sidebar.approvals",
          url: "/manager-sales/pending-task",
          icon: FileCheck,
        },
      ],
    },
    {
      title: "Quotation",
      labelKey: "sidebar.quotations",
      icon: FileCheck,
      items: [
        {
          title: "Quotation",
          labelKey: "sidebar.quotations",
          url: "/sales/quotations",
          icon: FileCheck,
        },
      ],
    },
    {
      title: "Sales",
      labelKey: "sidebar.sales_orders",
      icon: ShoppingCart,
      items: [
        {
          title: "Sales Order",
          labelKey: "sidebar.sales_orders",
          url: "/sales/sales-orders",
          icon: ShoppingCart,
        },
      ],
    },
  ],

  purchasing: [
    {
      title: "Dashboard",
      labelKey: "sidebar.dashboard",
      icon: LayoutDashboard,
      items: [{ title: "Purchasing", labelKey: "sidebar.purchasing", url: "/dashboard/purchasing" }],
    },
    {
      title: "Purchasing",
      labelKey: "sidebar.purchasing",
      icon: FileBox,
      items: [
        {
          title: "Purchase Order",
          labelKey: "sidebar.purchase_orders",
          url: "/purchasing/purchase-orders",
          icon: ShoppingCart,
        },
        {
          title: "Stock Reservation",
          labelKey: "sidebar.stock_reservations",
          url: "/warehouse/reservations",
          icon: ClipboardList,
        },
        {
          title: "Delivery Request",
          labelKey: "sidebar.delivery_requests",
          url: "/warehouse/delivery/requests",
          icon: Truck,
        },
      ],
    },
    {
      title: "Master",
      labelKey: "sidebar.master_data",
      icon: Settings,
      items: [
        { title: "Vendor List", labelKey: "sidebar.purchasing", url: "/purchasing/vendors", icon: Building2 },
        { title: "Product List", labelKey: "sidebar.products", url: "/products", icon: Package },
      ],
    },
  ],

  "manager-purchasing": [
    {
      title: "Dashboard",
      labelKey: "sidebar.dashboard",
      icon: LayoutDashboard,
      items: [
        { title: "Manager Purchasing", labelKey: "sidebar.manager_purchasing", url: "/dashboard/manager-purchasing" },
      ],
    },
    {
      title: "Approval",
      labelKey: "sidebar.approvals",
      icon: FileCheck,
      items: [
        {
          title: "PO Approval",
          labelKey: "sidebar.approvals",
          url: "/purchasing/purchase-orders",
          icon: FileCheck,
        },
      ],
    },
    {
      title: "Purchasing",
      labelKey: "sidebar.purchasing",
      icon: FileBox,
      items: [
        {
          title: "Assign PIC",
          labelKey: "sidebar.purchasing",
          url: "/purchasing/purchase-orders",
          icon: UserCog,
        },
      ],
    },
    {
      title: "Master",
      labelKey: "sidebar.master_data",
      icon: Settings,
      items: [
        { title: "Vendor List", labelKey: "sidebar.purchasing", url: "/purchasing/vendors", icon: Building2 },
        { title: "Product List", labelKey: "sidebar.products", url: "/products", icon: Package },
      ],
    },
  ],

  warehouse: [
    {
      title: "Dashboard",
      labelKey: "sidebar.dashboard",
      icon: LayoutDashboard,
      items: [{ title: "Warehouse", labelKey: "sidebar.warehouse", url: "/dashboard/warehouse" }],
    },
    {
      title: "Warehouse",
      labelKey: "sidebar.warehouse",
      icon: Warehouse,
      items: [
        {
          title: "Delivery Order",
          labelKey: "sidebar.delivery_orders",
          url: "/warehouse/delivery/orders",
          icon: Truck,
        },
        {
          title: "Warehouse Stock",
          labelKey: "sidebar.warehouse",
          url: "/warehouse/inventory/stocks",
          icon: Boxes,
        },
        {
          title: "Stock Movement",
          labelKey: "sidebar.warehouse",
          url: "/warehouse/inventory/movements",
          icon: FileText,
        },
      ],
    },
  ],

  finance: [
    {
      title: "Dashboard",
      labelKey: "sidebar.dashboard",
      icon: LayoutDashboard,
      items: [{ title: "Finance", labelKey: "sidebar.finance", url: "/dashboard/finance" }],
    },
    {
      title: "Finance",
      labelKey: "sidebar.finance",
      icon: Wallet,
      items: [
        {
          title: "Finance Approval",
          labelKey: "sidebar.approvals",
          url: "/finance/approvals",
          icon: FileCheck,
        },
        {
          title: "Finance Transactions",
          labelKey: "sidebar.finance",
          url: "/finance/transactions",
          icon: BadgeDollarSign,
        },
      ],
    },
  ],
};
