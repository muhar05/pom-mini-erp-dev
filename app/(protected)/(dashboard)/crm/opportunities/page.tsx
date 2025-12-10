"use client";

import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import Filters from "./_components/filters";
import OpportunitiesTable from "./_components/opportunities-table";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/session-context";

const dummyData = [
  {
    no: "OPP-001",
    date: "2025-12-10",
    customer: "PT. ABC",
    email: "abc@email.com",
    sales: "Sales 1",
    type: "Perusahaan",
    company: "PT. ABC",
    total: 10000000,
    status: "Prospecting",
    lastUpdate: "2025-12-11",
  },
  {
    no: "OPP-002",
    date: "2025-12-09",
    customer: "Budi Santoso",
    email: "budi@email.com",
    sales: "Sales 2",
    type: "Personal",
    company: "-",
    total: 5000000,
    status: "Qualified",
    lastUpdate: "2025-12-10",
  },
  // Tambahkan data lain sesuai kebutuhan
];

export default function OpportunitiesPage() {
  const { user } = useSession();
  const isSuperadmin = user?.role === "superadmin";

  return (
    <>
      <DashboardBreadcrumb
        title="Opportunity"
        text="Manage your sales opportunities here."
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Opportunities</h2>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              {isSuperadmin && (
                <Button variant="default">Create Opportunity</Button>
              )}
            </div>

            {/* Filter Bar/Drawer */}
            <Filters />

            {/* Table/List Data */}
            <OpportunitiesTable isSuperadmin={isSuperadmin} data={dummyData} />

            {/* Modals/Drawers for Detail, Edit, Delete, Logs, etc. */}
            {/* Implementasi drawer/modal di komponen terkait */}
          </div>
        </div>
      </div>
    </>
  );
}
