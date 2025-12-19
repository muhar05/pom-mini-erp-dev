import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import QuotationsClient from "./_components/quotations-client";
import { getOpportunityQualifiedLeadsAction } from "@/app/actions/quotations";

export default async function QuotationsPage() {
  const availableLeads = await getOpportunityQualifiedLeadsAction();

  return (
    <>
      <DashboardBreadcrumb
        title="Quotations"
        text="Manage and monitor your sales quotations"
      />
      <QuotationsClient availableLeads={availableLeads} />
    </>
  );
}
