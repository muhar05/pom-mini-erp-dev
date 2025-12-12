"use client";

import OpportunityEditForm from "../_components/opportunity-edit-form";

export default function OpportunityNewPage() {
  // TODO: Fetch opportunity detail by id for editing
  const opportunity = {
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
    // Tambahkan field lain sesuai kebutuhan edit
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Create New Opportunity</h1>
      <OpportunityEditForm mode="add" opportunity={opportunity} />
    </div>
  );
}
