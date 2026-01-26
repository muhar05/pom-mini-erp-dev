"use client";

import React, { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LeadsTable from "./_components/leads-table";
import AddLeadButton from "./_components/add-lead-button";
import LeadsFilter from "./_components/leads-filter";
import { useLeads } from "@/hooks/leads/useLeads";
import { useSession } from "@/contexts/session-context";
import { useI18n } from "@/contexts/i18n-context";

export default function LeadPage() {
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});
  const { leads, loading } = useLeads(filters);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Set isInitialLoading to false after the first fetch completes
  useEffect(() => {
    if (!loading && isInitialLoading) {
      setIsInitialLoading(false);
    }
  }, [loading, isInitialLoading]);

  const session = useSession();
  const currentUser = session?.user;
  const { t } = useI18n();

  const handleFilterChange = (newFilters: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setFilters(newFilters);
  };

  // Full page loading ONLY for initial mount
  if (isInitialLoading && loading) {
    return (
      <>
        <DashboardBreadcrumb
          title={t("page.leads.title")}
          text={t("page.leads.details")}
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
        title={t("page.leads.title")}
        text={t("page.leads.list")}
      />
      <AddLeadButton />
      <LeadsFilter onFilterChange={handleFilterChange} filters={filters} />

      <div className="grid grid-cols-1 gap-6 mt-6 relative">
        {/* Subtle loading overlay for subsequent filter updates */}
        {loading && !isInitialLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center rounded-lg">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{t("page.leads.list")}</h2>
          <LeadsTable
            leads={leads}
            filters={filters}
            currentUser={currentUser}
          />
        </div>
      </div>
    </>
  );
}
