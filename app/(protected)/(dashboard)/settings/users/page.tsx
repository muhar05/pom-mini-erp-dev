import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import UserOverviewChart from "@/components/charts/user-overview-chart";
import RevenueGrowthChart from "@/components/charts/revenue-growth-chart";
import TopCustomerList from "@/components/shared/top-customer-list";
import NotificationDropdown from "@/components/shared/notification-dropdown";

export default function UsersSettingsPage() {
  return (
    <>
      <DashboardBreadcrumb
        title="Users Settings"
        text="Manage and monitor your users"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">User Overview</h2>
            <UserOverviewChart />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Revenue Growth</h2>
            <RevenueGrowthChart chartColor="#487fff" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Top Users</h2>
            <TopCustomerList />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <NotificationDropdown />
          </div>
        </div>
      </div>
    </>
  );
}
