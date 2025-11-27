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
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Lead Management",
      icon: FileText,
      items: [
        { title: "Lead List", url: "/crm/leads" },
        { title: "New Lead", url: "/crm/leads/new" },
        { title: "Convert Lead to Opportunity", url: "/crm/leads/convert" },
      ],
    },
    {
      title: "Sales Quotation (SQ)",
      icon: FileCheck,
      items: [
        { title: "Create Quotation", url: "/crm/quotations/new" },
        { title: "Approve Quotation", url: "/crm/quotations/approve" },
        { title: "Quotation History", url: "/crm/quotations/history" },
      ],
    },
    {
      title: "Sales Order (SO)",
      icon: ShoppingCart,
      items: [
        { title: "Sales Order List", url: "/crm/sales-orders" },
        {
          title: "Create SO from Quotation",
          url: "/crm/sales-orders/from-quotation",
        },
        { title: "SO Approval", url: "/crm/sales-orders/approval" },
      ],
    },
    {
      title: "Purchase Request (PR)",
      icon: FileBox,
      items: [
        { title: "PR List", url: "/purchasing/purchase-requests" },
        { title: "New PR", url: "/purchasing/purchase-requests/new" },
        { title: "PR Approval", url: "/purchasing/purchase-requests/approval" },
      ],
    },
    {
      title: "Purchase Order (PO)",
      icon: FileBox,
      items: [
        { title: "PO List", url: "/purchasing/purchase-orders" },
        {
          title: "Create PO from PR",
          url: "/purchasing/purchase-orders/from-pr",
        },
      ],
    },
    {
      title: "Finance & Tax",
      icon: Wallet,
      items: [
        { title: "Submit FAR", url: "/finance/far/submit" },
        { title: "Approve/Reject FAR", url: "/finance/far/approval" },
        { title: "FAR History", url: "/finance/far/history" },
      ],
    },
    {
      title: "Warehouse & Logistics",
      icon: Warehouse,
      items: [
        {
          title: "Stock Reservation (SR)",
          items: [
            { title: "SR List", url: "/warehouse/reservations" },
            {
              title: "Create SR for Sales Order",
              url: "/warehouse/reservations/new",
            },
            { title: "Approve SR", url: "/warehouse/reservations/approval" },
          ],
        },
        {
          title: "Material Receiving",
          items: [
            { title: "Material Receiving List", url: "/warehouse/receiving" },
            {
              title: "Goods Receipt (GR)",
              url: "/warehouse/receiving/goods-receipt",
            },
            { title: "Quality Control (QC)", url: "/warehouse/receiving/qc" },
            { title: "Reject Handling", url: "/warehouse/receiving/reject" },
          ],
        },
        {
          title: "Delivery Order",
          items: [
            {
              title: "Delivery Request (DR)",
              url: "/warehouse/delivery/requests",
            },
            { title: "Approve DR", url: "/warehouse/delivery/approval" },
            { title: "Delivery Order (DO)", url: "/warehouse/delivery/orders" },
            { title: "Shipment Tracking", url: "/warehouse/delivery/tracking" },
          ],
        },
        {
          title: "Inventory",
          items: [
            { title: "Stock List", url: "/warehouse/inventory/stocks" },
            { title: "Stock Movements", url: "/warehouse/inventory/movements" },
            {
              title: "Stock In / Stock Out",
              url: "/warehouse/inventory/inout",
            },
            {
              title: "Minimum Stock Alerts",
              url: "/warehouse/inventory/alerts",
            },
            {
              title: "Inventory Valuation",
              url: "/warehouse/inventory/valuation",
            },
          ],
        },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      items: [
        {
          title: "Users",
          url: "/settings/users",
          icon: Users,
        },
        // Tambahkan menu settings lain jika perlu
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
