import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { getLeadByIdAction, updateLeadAction } from "@/app/actions/leads";
import LeadForm from "../../_components/lead-form";
import { getAllProductsAction } from "@/app/actions/products";

interface EditLeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLeadPage(props: Promise<EditLeadPageProps>) {
  const { params } = await props;
  const resolvedParams = await params;
  const lead = await getLeadByIdAction(Number(resolvedParams.id));
  const products = (await getAllProductsAction()).map((p) => ({
    ...p,
    price: p.price ? Number(p.price) : null,
  }));

  // Konversi potential_value ke number jika ada
  const leadForForm = {
    ...lead,
    potential_value: lead.potential_value ? Number(lead.potential_value) : null,
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Lead: ${lead.lead_name}`}
        text="Update lead information"
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 pt-8">
          <LeadForm
            mode="edit"
            lead={leadForForm}
            onSubmit={updateLeadAction}
            products={products}
          />
        </div>
      </div>
    </>
  );
}
