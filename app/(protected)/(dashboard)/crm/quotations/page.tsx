"use client";

import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import Filters from "./_components/filters";
import QuotationsTable from "./_components/quotations-table";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/session-context";

const dummyData = [
  {
    no: "QT-001",
    date: "2025-12-10",
    customer: "PT. XYZ",
    email: "xyz@email.com",
    sales: "Sales 1",
    type: "Perusahaan",
    company: "PT. XYZ",
    total: 20000000,
    status: "Open",
    lastUpdate: "2025-12-11",
  },
  // Tambahkan data lain sesuai kebutuhan
];

export default function QuotationsPage() {
  const { user } = useSession();
  const isSuperadmin = user?.role === "superadmin";

  return (
    <>
      <DashboardBreadcrumb
        title="Quotation"
        text="Manage your sales quotations here."
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Quotations</h2>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              {isSuperadmin && (
                <Button variant="default">Create Quotation</Button>
              )}
            </div>

            {/* Filter Bar/Drawer */}
            <Filters />

            {/* Table/List Data */}
            <QuotationsTable isSuperadmin={isSuperadmin} data={dummyData} />

            {/* Modals/Drawers for Detail, Edit, Delete, Logs, etc. */}
            {/* Implementasi drawer/modal di komponen terkait */}
          </div>
        </div>
      </div>
    </>
  );
}
