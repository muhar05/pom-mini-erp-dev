"use client";

import { useCompanyLevels } from "@/hooks/companies/useCompanyLevels";
import CompanyLevelsTable from "./company-levels-table";
import AddCompanyLevelButton from "./add-company-level-button";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CompanyLevelsClient() {
  const { levels, loading } = useCompanyLevels();

  return (
    <div className="grid grid-cols-1 gap-2">
      <DashboardBreadcrumb
        title="Company Level Management"
        text="Manage your company levels"
      />
      <div className="flex gap-2">
        <AddCompanyLevelButton />
        <Link href="/companies" passHref>
          <Button variant="secondary" className="h-10">
            Go to Companies
          </Button>
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">List Company Levels</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <CompanyLevelsTable levels={levels} />
        )}
      </div>
    </div>
  );
}
