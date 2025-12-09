import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LeadsTable from "./_components/leads-table";
import AddLeadButton from "./_components/add-lead-button";
import { getAllLeadsAction } from "@/app/actions/leads";

export default async function LeadPage() {
  const leads = await getAllLeadsAction();

  return (
    <>
      <DashboardBreadcrumb
        title="Lead Management"
        text="Manage and monitor your leads"
      />
      <AddLeadButton />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Leads</h2>
          <LeadsTable leads={leads} />
        </div>
      </div>
    </>
  );
}
