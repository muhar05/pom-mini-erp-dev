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
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },

    // Lead Management
    { title: "Lead List", url: "/crm/leads", icon: FileText },
    // { title: "New Lead", url: "/crm/leads/new" },
    // { title: "Convert Lead to Opportunity", url: "/crm/leads/convert" },

    // Sales Quotation (SQ)
    { title: "Create Quotation", url: "/crm/quotations/new", icon: FileCheck },
    // { title: "Approve Quotation", url: "/crm/quotations/approve" },
    // { title: "Quotation History", url: "/crm/quotations/history" },

    // Sales Order (SO)
    { title: "Sales Order List", url: "/crm/sales-orders", icon: ShoppingCart },
    // { title: "Create SO from Quotation", url: "/crm/sales-orders/from-quotation" },
    // { title: "SO Approval", url: "/crm/sales-orders/approval" },

    // Purchase Request (PR)
    { title: "PR List", url: "/purchasing/purchase-requests", icon: FileBox },
    // { title: "New PR", url: "/purchasing/purchase-requests/new" },
    // { title: "PR Approval", url: "/purchasing/purchase-requests/approval" },

    // Purchase Order (PO)
    { title: "PO List", url: "/purchasing/purchase-orders", icon: FileBox },
    // { title: "Create PO from PR", url: "/purchasing/purchase-orders/from-pr" },

    // Finance & Tax
    { title: "Submit FAR", url: "/finance/far/submit", icon: Wallet },
    // { title: "Approve/Reject FAR", url: "/finance/far/approval" },
    // { title: "FAR History", url: "/finance/far/history" },

    // Warehouse & Logistics
    {
      title: "Stock Reservation",
      url: "/warehouse/reservations",
      icon: Warehouse,
    },
    // --- Subitems acuan:
    // { title: "Create SR for Sales Order", url: "/warehouse/reservations/new" },
    // { title: "Approve SR", url: "/warehouse/reservations/approval" },

    { title: "Material Receiving", url: "/warehouse/receiving", icon: Package },
    // { title: "Goods Receipt (GR)", url: "/warehouse/receiving/goods-receipt" },
    // { title: "Quality Control (QC)", url: "/warehouse/receiving/qc" },
    // { title: "Reject Handling", url: "/warehouse/receiving/reject" },

    {
      title: "Delivery Request (DR)",
      url: "/warehouse/delivery/requests",
      icon: Truck,
    },
    // { title: "Approve DR", url: "/warehouse/delivery/approval" },
    // { title: "Delivery Order (DO)", url: "/warehouse/delivery/orders" },
    // { title: "Shipment Tracking", url: "/warehouse/delivery/tracking" },

    { title: "Stock List", url: "/warehouse/inventory/stocks", icon: Boxes },
    // { title: "Stock Movements", url: "/warehouse/inventory/movements" },
    // { title: "Stock In / Stock Out", url: "/warehouse/inventory/inout" },
    // { title: "Minimum Stock Alerts", url: "/warehouse/inventory/alerts" },
    // { title: "Inventory Valuation", url: "/warehouse/inventory/valuation" },

    // Settings (tetap nested)
    {
      title: "Settings",
      icon: Settings,
      items: [
        { title: "Users", url: "/settings/users", icon: Users },
        { title: "Company", url: "/settings/company", icon: UserCog },
      ],
    },
  ],

  sales: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Lead", url: "/crm/leads", icon: FileText },
    { title: "Opportunity", url: "/crm/opportunities", icon: ClipboardList },
    { title: "Quotation (SQ)", url: "/crm/quotations", icon: FileCheck },
    { title: "Sales Order (SO)", url: "/crm/sales-orders", icon: ShoppingCart },
    { title: "Customer List", url: "/crm/customers", icon: UserRound },
  ],

  purchasing: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "Sales Order (Read-Only)",
      url: "/crm/sales-orders",
      icon: ShoppingCart,
    },
    {
      title: "Purchase Request (PR)",
      url: "/purchasing/purchase-requests",
      icon: FileText,
    },
    {
      title: "Purchase Order (PO)",
      url: "/purchasing/purchase-orders",
      icon: FileBox,
    },
    { title: "Vendor List (Optional)", url: "/crm/vendors", icon: Building2 },
  ],

  warehouse: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "Stock / Inventory",
      url: "/warehouse/inventory/stocks",
      icon: Boxes,
    },
    {
      title: "Stock Reservation (SR)",
      url: "/warehouse/reservations",
      icon: ClipboardList,
    },
    {
      title: "Delivery Request (DR)",
      url: "/warehouse/delivery/requests",
      icon: Truck,
    },
    {
      title: "Goods Receipt (GR)",
      url: "/warehouse/receiving/goods-receipt",
      icon: Package,
    },
    {
      title: "Delivery to Customer (DO)",
      url: "/warehouse/delivery/orders",
      icon: Truck,
    },
  ],

  finance: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "FAR (Finance Approval Request)",
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
