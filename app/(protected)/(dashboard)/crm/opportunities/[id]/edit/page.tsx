import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { getOpportunityByIdAction } from "@/app/actions/opportunities";
import OpportunityForm from "../../_components/opportunity-form";

interface EditOpportunityPageProps {
  params: { id: string };
}

export default async function EditOpportunityPage({
  params,
}: EditOpportunityPageProps) {
  const opportunity = await getOpportunityByIdAction(Number(params.id));

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Opportunity: ${opportunity.opportunity_no}`}
        text="Update opportunity information"
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Edit Opportunity Information
          </h2>
          {/* Do not pass onClose or onSuccess from here */}
          <OpportunityForm mode="edit" opportunity={opportunity} />
        </div>
      </div>
    </>
  );
}
