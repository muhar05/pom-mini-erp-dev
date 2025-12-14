"use client";

import OpportunityForm from "../../_components/opportunity-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

// Mock data - replace with actual API call
const mockOpportunity = {
  id: "1",
  opportunity_no: "OPP-001",
  customer_name: "PT. ABC",
  customer_email: "abc@email.com",
  sales_pic: "Sales 1",
  type: "Perusahaan",
  company: "PT. ABC",
  potential_value: 10000000,
  stage: "Qualified",
  status: "Open",
  created_at: "2025-12-10",
  updated_at: "2025-12-11",
  expected_close_date: "2025-12-31",
  notes: "High potential customer for Q4 2025",
};

export default function OpportunityEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState(mockOpportunity);

  // TODO: Fetch opportunity detail by id for editing
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching opportunity for edit with id:", id);
    setOpportunity({ ...mockOpportunity, id: id as string });
  }, [id]);

  const handleSuccess = () => {
    router.push("/crm/opportunities");
  };

  const handleClose = () => {
    router.back();
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
