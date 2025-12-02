import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import UserTable from "@/app/(protected)/(dashboard)/settings/users/_components/users-list-table";
import AddUserButton from "@/app/(protected)/(dashboard)/settings/users/_components/add-user-button";
import { getAllUsersAction, getAllRolesAction } from "@/app/actions/users";

export default async function UsersSettingsPage() {
  const [users, roles] = await Promise.all([
    getAllUsersAction(),
    getAllRolesAction(),
  ]);

  return (
    <>
      <DashboardBreadcrumb
        title="Users Settings"
        text="Manage and monitor your users"
      />
      <AddUserButton />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">List User</h2>
            <UserTable users={users} roles={roles} />
          </div>
        </div>
      </div>
    </>
  );
}
