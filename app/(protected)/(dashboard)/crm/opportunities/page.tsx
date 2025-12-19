import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import OpportunitiesClient from "./_components/opportunities-client";
import { getAllLeadsAction } from "@/app/actions/leads";
import { leads, Opportunity } from "@/types/models";
import { getConvertedOpportunities } from "@/app/actions/opportunities";

export default async function OpportunitiesPage() {
  const opportunities = await getConvertedOpportunities();

  return (
    <>
      <DashboardBreadcrumb
        title="Opportunity"
        text="Manage your sales opportunities here."
      />
      {/* Kirim data ke Client Component */}
      <OpportunitiesClient opportunities={opportunities} />
    </>
  );
}
