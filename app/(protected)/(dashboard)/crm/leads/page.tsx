"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LeadsTable from "./_components/leads-table";
import AddLeadButton from "./_components/add-lead-button";
import LeadsFilter from "./_components/leads-filter";
import { useLeads } from "@/hooks/useLeads";

export default function LeadPage() {
  const { leads, loading } = useLeads();
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const handleFilterChange = (newFilters: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <>
        <DashboardBreadcrumb
          title="Lead Management"
          text="Manage and monitor your leads"
        />
        <div className="flex justify-center items-center p-16 w-full h-full">
          <div className="flex flex-col w-full justify-center items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardBreadcrumb
        title="Lead Management"
        text="Manage and monitor your leads"
      />
      <AddLeadButton />
      <LeadsFilter onFilterChange={handleFilterChange} filters={filters} />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Leads</h2>
          <LeadsTable leads={leads} filters={filters} />
        </div>
      </div>
    </>
  );
}
