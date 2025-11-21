// config/sidebar.ts

import type { LucideIcon } from "lucide-react";

// ICONS untuk ERP
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
  children?: MenuItem[];
};

export const sidebarMenuByRole: Record<string, MenuItem[]> = {
  superuser: [
    { title: "Dashboard CRM", url: "/dashboard", icon: LayoutDashboard },
    { title: "Lead", url: "/crm/lead", icon: FileText },
    { title: "Opportunity", url: "/crm/opportunity", icon: ClipboardList },
    { title: "Quotation", url: "/crm/quotation", icon: FileCheck },
    { title: "Customer", url: "/crm/customer", icon: Users },

    {
      title: "PMS",
      icon: Package,
      children: [
        { title: "Sales Order", url: "/pms/so", icon: ShoppingCart },
        { title: "Purchase Request", url: "/pms/pr", icon: FileText },
        { title: "Purchase Order", url: "/pms/po", icon: FileBox },
        { title: "Delivery", url: "/pms/delivery", icon: Truck },
      ],
    },

    {
      title: "Inventory",
      icon: Warehouse,
      children: [
        { title: "Stock", url: "/inventory/stock", icon: Boxes },
        {
          title: "Warehouse Movement",
          url: "/inventory/movement",
          icon: Truck,
        },
      ],
    },

    {
      title: "Finance",
      icon: Wallet,
      children: [
        { title: "Invoice", url: "/finance/invoice", icon: Receipt },
        {
          title: "Payment Request",
          url: "/finance/payment-request",
          icon: Banknote,
        },
      ],
    },

    { title: "Users & Roles", url: "/settings/users", icon: UserCog },
    { title: "Company Setting", url: "/settings/company", icon: Building2 },
  ],

  sales: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Lead", url: "/crm/lead", icon: FileText },
    { title: "Opportunity", url: "/crm/opportunity", icon: ClipboardList },
    { title: "Quotation (SQ)", url: "/crm/quotation", icon: FileCheck },
    { title: "Sales Order (SO)", url: "/pms/so", icon: ShoppingCart },
    { title: "Customer List", url: "/crm/customer", icon: UserRound },
  ],

  purchasing: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Sales Order (read-only)", url: "/pms/so", icon: ShoppingCart },
    { title: "Purchase Request (PR)", url: "/pms/pr", icon: FileText },
    { title: "Purchase Order (PO)", url: "/pms/po", icon: FileBox },
    { title: "Vendor List (optional)", url: "/crm/vendor", icon: Building2 },
  ],

  warehouse: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Stock / Inventory", url: "/inventory/stock", icon: Boxes },
    {
      title: "Stock Reservation (SR)",
      url: "/inventory/sr",
      icon: ClipboardList,
    },
    {
      title: "Delivery Request (DR)",
      url: "/inventory/delivery-request",
      icon: Truck,
    },
    { title: "Goods Received", url: "/inventory/gr", icon: Package },
    { title: "Delivery to Customer", url: "/inventory/delivery", icon: Truck },
  ],

  finance: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "Finance Approval Request (FAR)",
      url: "/finance/far",
      icon: BadgeDollarSign,
    },
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
