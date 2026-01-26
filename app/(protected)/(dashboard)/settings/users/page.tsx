"use client";

import React, { useEffect, useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import UserTable from "@/app/(protected)/(dashboard)/settings/users/_components/users-list-table";
import { getAllUsersAction, getAllRolesAction } from "@/app/actions/users";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-context";

export default function UsersSettingsPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          getAllUsersAction(),
          getAllRolesAction(),
        ]);
        setUsers(usersRes);
        setRoles(rolesRes);
      } catch (error) {
        console.error("Error fetching users/roles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const buttonClass =
    "h-[38px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-5 py-[8px] transition-colors";

  if (loading) {
    return (
      <>
        <DashboardBreadcrumb
          title={t("page.settings.users")}
          text={t("common.loading")}
        />
        <div className="flex justify-center items-center p-16 w-full h-full">
          <div className="flex flex-col w-full justify-center items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardBreadcrumb
        title={t("page.settings.users")}
        text={t("page.settings.title")}
      />
      <div className="flex gap-2 mb-4">
        <Link href="/settings/users/new">
          <Button type="button" className={buttonClass}>
            {t("common.add")} User
          </Button>
        </Link>
        <Link href="/settings/users/roles">
          <Button type="button" className={buttonClass}>
            {t("page.settings.roles")}
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t("sidebar.users")}</h2>
            <UserTable users={users} roles={roles} />
          </div>
        </div>
      </div>
    </>
  );
}
