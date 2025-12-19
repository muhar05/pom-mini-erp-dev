"use client";

import QuotationForm from "../../_components/quotation-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

// Mock data - replace with actual API call
const mockQuotation = {
  id: "1",
  quotation_no: "QT-001",
  opportunity_no: "OPP-001",
  customer_name: "PT. XYZ",
  customer_email: "xyz@email.com",
  sales_pic: "Sales 1",
  type: "Perusahaan",
  company: "PT. XYZ",
  total_amount: 20000000,
  shipping: 500000, // Add shipping
  discount: 1000000, // Add discount
  tax: 2000000, // Add tax
  grand_total: 21500000, // Add grand total (total_amount + shipping + tax - discount)
  status: "Open",
  stage: "draft", // Add stage
  target_date: "2025-12-31", // Add target_date
  top: "net30", // Add terms of payment
  created_at: "2025-12-10",
  updated_at: "2025-12-11",
  valid_until: "2025-12-31",
  notes: "Initial quotation for customer requirements",
};

export default function QuotationEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState(mockQuotation);

  // TODO: Fetch quotation detail by id for editing
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching quotation for edit with id:", id);
    setQuotation({ ...mockQuotation, id: id as string });
  }, [id]);

  const handleSuccess = () => {
    router.push("/crm/quotations");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Quotation - ${quotation.quotation_no}`}
        text="Update quotation information"
      />
      <div className="max-w-4xl mx-auto py-8">
        <QuotationForm
          mode="edit"
          quotation={quotation}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
