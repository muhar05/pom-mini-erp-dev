import { getConvertedOpportunities } from "@/app/actions/opportunities";
import { notFound } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import OpportunityForm from "../../_components/opportunity-form";

export default async function OpportunityEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Ambil semua opportunities dan cari yang sesuai ID
  const opportunities = await getConvertedOpportunities();
  const opportunity = opportunities.find((o) => o.id === id);

  if (!opportunity) {
    return notFound();
  }

  const handleSuccess = () => {
    "use client";
    // router.push("/crm/opportunities");
    window.location.href = "/crm/opportunities";
  };

  const handleClose = () => {
    "use client";
    window.history.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Opportunity - ${opportunity.opportunity_no}`}
        text="Update opportunity information"
      />
      <div className="max-w-4xl mx-auto py-8">
        <OpportunityForm
          mode="edit"
          opportunity={opportunity}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
