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
  // SUPERADMIN — full access
  superuser: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },

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

    { title: "Quotation (SQ)", url: "/crm/quotations", icon: FileCheck },
    { title: "Sales Order (SO)", url: "/crm/sales-orders", icon: ShoppingCart },

    {
      title: "Master",
      icon: Settings,
      items: [
        { title: "Customer List", url: "/customers", icon: UserRound },
        { title: "Company List", url: "/companies", icon: Building2 },
        { title: "Product List", url: "/products", icon: Package },
      ],
    },

    {
      title: "Purchasing",
      icon: FileBox,
      items: [
        {
          title: "Purchase Request (PR)",
          url: "/purchasing/purchase-requests",
          icon: ClipboardList,
        },
        {
          title: "Purchase Order (PO)",
          url: "/purchasing/purchase-orders",
          icon: FileBox,
        },
        { title: "Vendor List", url: "/purchasing/vendors", icon: Building2 },
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
      items: [
        { title: "FAR", url: "/finance/far", icon: BadgeDollarSign },
        { title: "Invoice", url: "/finance/invoice", icon: Receipt },
        {
          title: "Payment Schedule",
          url: "/finance/payment-schedule",
          icon: Banknote,
        },
        {
          title: "Customer Payment",
          url: "/finance/customer-payment",
          icon: HandCoins,
        },
      ],
    },

    {
      title: "Settings",
      icon: Settings,
      items: [
        { title: "Users", url: "/settings/users", icon: Users },
        { title: "Company", url: "/settings/company", icon: Building2 },
        // Tambahkan icon jika ada sub-items lain yang diaktifkan
      ],
    },

    { title: "System Logs", url: "/system/logs", icon: FileText },
  ],

  // SALES — hanya CRM
  sales: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Leads", url: "/crm/leads", icon: Users },
    { title: "Opportunity", url: "/crm/opportunities", icon: ClipboardList },
    { title: "Quotation (SQ)", url: "/crm/quotations", icon: FileCheck },
    { title: "Sales Order (SO)", url: "/crm/sales-orders", icon: ShoppingCart },
    { title: "Customer List", url: "/crm/customers", icon: UserRound },
  ],

  // PURCHASING — hanya PMS
  purchasing: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "Purchase Request (PR)",
      url: "/purchasing/purchase-requests",
      icon: ClipboardList,
    },
    {
      title: "Purchase Order (PO)",
      url: "/purchasing/purchase-orders",
      icon: FileBox,
    },
    { title: "Vendor List", url: "/purchasing/vendors", icon: Building2 },
  ],

  // WAREHOUSE — hanya warehouse
  warehouse: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "Stock Reservation (SR)",
      url: "/warehouse/reservations",
      icon: ClipboardList,
    },
    { title: "Goods Receipt (GR)", url: "/warehouse/receiving", icon: Package },
    {
      title: "Delivery Request (DR)",
      url: "/warehouse/delivery/requests",
      icon: Truck,
    },
    { title: "Stock List", url: "/warehouse/inventory/stocks", icon: Boxes },
    {
      title: "Stock Movements",
      url: "/warehouse/inventory/movements",
      icon: FileText,
    },
  ],

  // FINANCE — hanya finance
  finance: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "FAR", url: "/finance/far", icon: BadgeDollarSign },
    { title: "Invoice", url: "/finance/invoice", icon: Receipt },
    {
      title: "Payment Schedule",
      url: "/finance/payment-schedule",
      icon: Banknote,
    },
    {
      title: "Customer Payment Status",
      url: "/finance/customer-payment",
      icon: HandCoins,
    },
  ],

  manager_sales: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "My Pending Task",
      url: "/manager-sales/my-pending-task",
      icon: ClipboardList,
    },
    {
      title: "Pending Task",
      url: "/manager-sales/pending-task",
      icon: ClipboardList,
    },
    { title: "Leads", url: "/crm/leads", icon: Users },
    { title: "Opportunity", url: "/crm/opportunities", icon: ClipboardList },
    { title: "Quotation (SQ)", url: "/crm/quotations", icon: FileCheck },
    { title: "Sales Order (SO)", url: "/crm/sales-orders", icon: ShoppingCart },
    { title: "Customer List", url: "/crm/customers", icon: UserRound },
  ],
  manager_purchasing: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "My Pending Task",
      url: "/manager-purchasing/my-pending-task",
      icon: ClipboardList,
    },
    {
      title: "Purchase Request (PR)",
      url: "/purchasing/purchase-requests",
      icon: ClipboardList,
    },
    {
      title: "Purchase Order (PO)",
      url: "/purchasing/purchase-orders",
      icon: FileBox,
    },
    { title: "Vendor List", url: "/purchasing/vendors", icon: Building2 },
  ],
  manager_warehouse: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "My Pending Task",
      url: "/manager-warehouse/my-pending-task",
      icon: ClipboardList,
    },
    {
      title: "Stock Reservation (SR)",
      url: "/warehouse/reservations",
      icon: ClipboardList,
    },
    { title: "Goods Receipt (GR)", url: "/warehouse/receiving", icon: Package },
    {
      title: "Delivery Request (DR)",
      url: "/warehouse/delivery/requests",
      icon: Truck,
    },
    { title: "Stock List", url: "/warehouse/inventory/stocks", icon: Boxes },
    {
      title: "Stock Movements",
      url: "/warehouse/inventory/movements",
      icon: FileText,
    },
  ],
  manager_finance: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "My Pending Task",
      url: "/manager-finance/my-pending-task",
      icon: ClipboardList,
    },
    { title: "FAR", url: "/finance/far", icon: BadgeDollarSign },
    { title: "Invoice", url: "/finance/invoice", icon: Receipt },
    {
      title: "Payment Schedule",
      url: "/finance/payment-schedule",
      icon: Banknote,
    },
    {
      title: "Customer Payment Status",
      url: "/finance/customer-payment",
      icon: HandCoins,
    },
  ],
};
