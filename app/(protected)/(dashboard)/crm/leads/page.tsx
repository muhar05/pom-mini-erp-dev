"use client";

import React, { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LeadsTable from "./_components/leads-table";
import AddLeadButton from "./_components/add-lead-button";
import LeadsFilter from "./_components/leads-filter";
import { getAllLeadsAction } from "@/app/actions/leads";
import { leads } from "@/types/models";

export default function LeadPage() {
  const [leads, setLeads] = useState<leads[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  // Load leads data
  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        const leadsData = await getAllLeadsAction();
        setLeads(leadsData);
      } catch (error) {
        console.error("Error loading leads:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

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
        <div className="flex justify-center items-center p-8">
          <div className="text-center">Loading leads...</div>
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
