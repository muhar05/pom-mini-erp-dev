import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import UserOverviewChart from "@/components/charts/user-overview-chart";
import RevenueGrowthChart from "@/components/charts/revenue-growth-chart";
import LeadsTable from "./_components/leads-table";
import { getAllLeadsAction } from "@/app/actions/leads";

export default async function LeadPage() {
  const leads = await getAllLeadsAction();
  return (
    <>
      <DashboardBreadcrumb title="Lead Superuser" text="Lead Superuser" />
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">User Overview</h2>
          <UserOverviewChart />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Revenue Growth</h2>
          <RevenueGrowthChart chartColor="#487fff" />
        </div>
      </div> */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Table Leads</h2>
          <LeadsTable leads={leads} />
        </div>
        {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Notifications</h2>
          <NotificationDropdown />
        </div> */}
      </div>
    </>
  );
}
