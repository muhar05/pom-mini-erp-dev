import CrmStatCard from "@/app/(protected)/(dashboard)/(homes)/dashboard/components/crm-stat-card";
import QuotationStatusChart from "@/app/(protected)/(dashboard)/(homes)/dashboard/components/quotation-status-chart";
import SalesOrderStatusChart from "@/app/(protected)/(dashboard)/(homes)/dashboard/components/sales-order-status-chart";
import LeadStatusOverview from "@/app/(protected)/(dashboard)/(homes)/dashboard/components/lead-status-overview";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "CRM Dashboard | POM MINI ERP",
  description:
    "CRM dashboard provides an overview of leads, quotations, and sales orders for effective management.",
};

export default async function DashboardPage() {
  return (
    <>
      <DashboardBreadcrumb title="CRM Dashboard" text="Dashboard" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
        <Suspense
          fallback={<LoadingSkeleton height="h-32" text="Loading stats..." />}
        >
          <CrmStatCard />
        </Suspense>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <Suspense
          fallback={<LoadingSkeleton height="h-96" text="Loading chart..." />}
        >
          <QuotationStatusChart />
        </Suspense>

        <Suspense
          fallback={<LoadingSkeleton height="h-96" text="Loading chart..." />}
        >
          <SalesOrderStatusChart />
        </Suspense>
      </div>

      {/* Lead Status Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* You can add more components here */}
        <div className="xl:col-span-2">
          {/* Future: Recent activities, top customers, etc */}
        </div>
      </div>
    </>
  );
}
