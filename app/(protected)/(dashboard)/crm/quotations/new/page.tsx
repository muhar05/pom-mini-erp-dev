"use client";

import QuotationForm from "../_components/quotation-form";
import { useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function QuotationNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/crm/quotations");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title="Create Quotation"
        text="Create a new quotation from opportunity"
      />
      <div className="max-w-4xl mx-auto py-8">
        <QuotationForm
          mode="add"
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
