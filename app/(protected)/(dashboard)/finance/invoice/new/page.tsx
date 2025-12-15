"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import InvoiceForm from "../_components/invoice-form";

export default function NewInvoicePage() {
  return (
    <>
      <DashboardBreadcrumb
        title="Create New Invoice"
        text="Create a new invoice for customer billing"
      />

      <InvoiceForm />
    </>
  );
}
