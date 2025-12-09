import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LeadForm from "../_components/lead-form";
import { createLeadAction } from "@/app/actions/leads";

export default function NewLeadPage() {
  return (
    <>
      <DashboardBreadcrumb
        title="Add New Lead"
        text="Create a new lead entry"
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Lead Information</h2>
          <LeadForm mode="create" onSubmit={createLeadAction} />
        </div>
      </div>
    </>
  );
}
