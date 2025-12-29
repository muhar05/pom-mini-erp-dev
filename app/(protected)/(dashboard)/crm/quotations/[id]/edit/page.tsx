"use client";

import QuotationForm from "../../_components/quotation-form";
import { useParams, useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useQuotationDetail } from "@/hooks/quotations/useQuotationDetail";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuotationEditPage() {
  const { id } = useParams();
  const idParam = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { quotation, loading } = useQuotationDetail(idParam);

  const handleSuccess = () => {
    router.push("/crm/quotations");
  };

  const handleClose = () => {
    router.back();
  };

  if (loading || !quotation) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Quotation - ${quotation.quotation_no}`}
        text="Update quotation information"
      />
      <div className="w-full mx-auto py-4">
        <Button
          variant="outline"
          className="mb-4 flex items-center gap-2"
          onClick={handleClose}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="w-full py-4">
          <QuotationForm
            mode="edit"
            quotation={quotation}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </>
  );
}
