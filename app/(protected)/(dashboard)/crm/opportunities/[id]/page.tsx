"use client";

import OpportunityDetailDrawer from "../_components/opportunity-detail-drawer";
import { useParams } from "next/navigation";

export default function OpportunityDetailPage() {
  const { id } = useParams();

  // TODO: Fetch opportunity detail by id
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
    // Tambahkan field lain sesuai kebutuhan detail
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Detail Opportunity</h1>
      <OpportunityDetailDrawer opportunity={opportunity} />
    </div>
  );
}
