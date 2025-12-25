"use client";

import React, { useEffect, useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import OpportunitiesTable from "./_components/opportunities-table";
import OpportunitiesFilter from "./_components/opportunity-filter";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/opportunities");
        const data = await res.json();
        setOpportunities(data);
      } catch (error) {
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  return (
    <>
      <DashboardBreadcrumb
        title="Opportunity"
        text="Manage your sales opportunities here."
      />
      <OpportunitiesFilter onFilterChange={setFilters} filters={filters} />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Opportunities</h2>
          {loading ? (
            <div className="flex justify-center items-center p-16 w-full h-full">
              <div className="flex flex-col w-full justify-center items-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            </div>
          ) : (
            <OpportunitiesTable data={opportunities} />
          )}
        </div>
      </div>
    </>
  );
}
