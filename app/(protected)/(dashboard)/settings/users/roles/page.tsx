
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { getAllRolesAction } from "@/app/actions/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, UserCog } from "lucide-react";
import Link from "next/link";
import type { roles } from "@/types/models";
import RolesTable from "./_components/RolesTable";

export default async function ManageRolesPage() {
  const rolesData: roles[] = await getAllRolesAction();

  return (
    <>
      <DashboardBreadcrumb
        title="Manage Roles"
        text="Add and view user roles"
      />

      <div className="w-full mx-auto py-4 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Role Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage user roles across the system
            </p>
          </div>
          <Link href="/settings/users/roles/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md">
              <Plus className="w-4 h-4" />
              Add New Role
            </button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Roles
                  </p>
                  <p className="text-2xl font-bold">{rolesData.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <UserCog className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roles Table Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
              <UserCog className="w-5 h-5" />
              All Roles
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              List of all user roles
            </p>
          </CardHeader>
          <CardContent>
            <RolesTable roles={rolesData} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
