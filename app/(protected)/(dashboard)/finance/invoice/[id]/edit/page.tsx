"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import InvoiceForm from "../../_components/invoice-form";

// Mock invoice data - replace with actual API call
const mockInvoice = {
  sales_order_no: "SO-001",
  customer_name: "PT. Client Technology",
  customer_email: "finance@clienttech.com",
  billing_address: "Jl. Sudirman No. 123, Jakarta",
  invoice_date: "2025-12-10",
  due_date: "2025-12-25",
  payment_term: "Net 15",
  subtotal: 25000000,
  tax_amount: 2500000,
  discount_amount: 500000,
  total_amount: 27000000,
  notes: "Please process payment by due date",
  status: "sent",
};

export default function EditInvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState(mockInvoice);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load invoice data here based on params.id
    console.log("Loading invoice:", params.id);
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DashboardBreadcrumb
        title="Edit Invoice"
        text="Update invoice information and details"
      />

      <InvoiceForm initialData={invoice} isEdit />
    </>
  );
}
