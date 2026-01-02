import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import UserTable from "@/app/(protected)/(dashboard)/settings/users/_components/users-list-table";
import { getAllUsersAction, getAllRolesAction } from "@/app/actions/users";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UsersSettingsPage() {
  const [users, roles] = await Promise.all([
    getAllUsersAction(),
    getAllRolesAction(),
  ]);

  const buttonClass =
    "h-[38px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-5 py-[8px] transition-colors";

  return (
    <>
      <DashboardBreadcrumb
        title="Users Settings"
        text="Manage and monitor your users"
      />
      <div className="flex gap-2 mb-4">
        <Link href="/settings/users/new">
          <Button type="button" className={buttonClass}>
            Add User
          </Button>
        </Link>
        <Link href="/settings/users/roles">
          <Button type="button" className={buttonClass}>
            Manage Role
          </Button>
        </Link>
      </div>
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
