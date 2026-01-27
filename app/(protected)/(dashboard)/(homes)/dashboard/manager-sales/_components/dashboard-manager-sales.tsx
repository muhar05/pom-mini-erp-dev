"use client";

import DashboardSales from "@/app/(protected)/(dashboard)/(homes)/dashboard/sales/_components/dashboard-sales";

/**
 * DashboardManagerSales component now acts as an alias for the unified DashboardSales component.
 * Role-based visibility and data scoping are handled internally within DashboardSales.
 */
export default function DashboardManagerSales() {
  return <DashboardSales />;
}
