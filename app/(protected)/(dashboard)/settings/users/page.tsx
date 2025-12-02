import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import UserOverviewChart from "@/components/charts/user-overview-chart";
import RevenueGrowthChart from "@/components/charts/revenue-growth-chart";
import { Button } from "@/components/ui/button";
import UserTable from "@/components/table/users-list-table";
import AddUserButton from "@/components/user/add-user-button";
import { getAllUsers, getAllRoles } from "@/app/actions/user-actions";

export default async function UsersSettingsPage() {
  // Fetch data di server-side
  const [users, roles] = await Promise.all([getAllUsers(), getAllRoles()]);

  return (
    <>
      <DashboardBreadcrumb
        title="Users Settings"
        text="Manage and monitor your users"
      />
      <AddUserButton />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">User Overview</h2>
            <UserOverviewChart />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">List User</h2>
            <UserTable users={users} roles={roles} />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Revenue Growth</h2>
            <RevenueGrowthChart chartColor="#487fff" />
          </div>
        </div>
      </div>
    </>
  );
}
