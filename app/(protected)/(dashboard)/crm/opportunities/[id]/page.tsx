import { getAllOpportunitiesAction } from "@/app/actions/opportunities";
import { notFound } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import OpportunityDetailClient from "../_components/opportunities-detail-client";

export default async function OpportunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Ambil semua opportunities dan cari yang sesuai ID
  const opportunities = await getAllOpportunitiesAction();
  const opportunity = opportunities.find((o: any) => o.id === id);

  if (!opportunity) {
    return notFound();
  }

  return (
    <>
      <DashboardBreadcrumb
        title={`Opportunity - ${opportunity.opportunity_no}`}
        text="View opportunity details"
      />
      <OpportunityDetailClient opportunity={opportunity} />
    </>
  );
}
