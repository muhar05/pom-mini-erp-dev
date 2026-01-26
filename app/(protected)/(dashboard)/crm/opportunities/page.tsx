"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import OpportunitiesTable from "./_components/opportunities-table";
import OpportunitiesFilter from "./_components/opportunity-filter";
import { useOpportunities } from "@/hooks/opportunities/useOpportunities";
import { useSession } from "@/contexts/session-context";
import { useI18n } from "@/contexts/i18n-context";

export default function OpportunitiesPage() {
  const { t } = useI18n();
  const { opportunities, loading, setOpportunities } = useOpportunities();
  const [filters, setFilters] = useState({});

  const handleRefreshData = async () => {
    const response = await fetch("/api/opportunities");
    const data = await response.json();
    setOpportunities(data);
  };

  const session = useSession();
  const currentUser = session?.user;

  return (
    <>
      <DashboardBreadcrumb
        title={t("page.opportunities.title")}
        text={t("page.opportunities.details")}
      />
      <OpportunitiesFilter onFilterChange={setFilters} filters={filters} />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{t("page.opportunities.list")}</h2>
          {loading ? (
            <div className="flex justify-center items-center p-16 w-full h-full">
              <div className="flex flex-col w-full justify-center items-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-sm text-muted-foreground">
                  {t("common.loading")}
                </span>
              </div>
            </div>
          ) : (
            <OpportunitiesTable
              data={opportunities}
              onDelete={handleRefreshData}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>
    </>
  );
}
