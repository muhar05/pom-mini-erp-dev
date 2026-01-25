"use client";

import QuotationForm from "../../_components/quotation-form";
import { useParams, useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useQuotationDetail } from "@/hooks/quotations/useQuotationDetail";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { quotations } from "@/types/models";
import { useSession } from "@/contexts/session-context";
import { canAccessQuotation } from "@/utils/quotationAccess";

export default function QuotationEditPage() {
  const { id } = useParams();
  const idParam = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { quotation, loading, error } = useQuotationDetail(idParam);
  const user = useSession();

  const handleSuccess = () => {
    router.push("/sales/quotations");
  };

  const handleClose = () => {
    router.push("/sales/quotations");
  };

  // Konversi Decimal ke number
  function parseDecimalFields(obj: Partial<quotations>): any {
    return {
      ...obj,
      total: obj.total ? Number(obj.total) : 0,
      shipping: obj.shipping ? Number(obj.shipping) : 0,
      discount: obj.discount ? Number(obj.discount) : 0,
      tax: obj.tax ? Number(obj.tax) : 0,
      grand_total: obj.grand_total ? Number(obj.grand_total) : 0,
      opportunity_no: (obj as any).opportunity_no ?? "",
      customer_name: (obj as any).customer_name ?? "",
      customer_email: (obj as any).customer_email ?? "",
      sales_pic: (obj as any).sales_pic ?? "",
      type: (obj as any).type ?? "",
      company: (obj as any).company ?? "",
      // Tambahkan field lain yang dibutuhkan oleh QuotationForm jika perlu
    };
  }

  // Early return if no valid id
  if (!idParam) {
    return (
      <div className="flex justify-center items-center p-16 w-full h-full">
        <div className="flex flex-col w-full justify-center items-center">
          <span className="text-sm text-muted-foreground">
            Invalid quotation ID
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16 w-full h-full">
        <div className="flex flex-col w-full justify-center items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Handle Forbidden or Not Found
  if (error?.includes("403") || (quotation && user && !canAccessQuotation(user, quotation))) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Forbidden</h2>
        <p className="text-muted-foreground mb-6">You don't have permission to view or edit this quotation.</p>
        <Button onClick={() => router.push("/sales/quotations")}>Return to List</Button>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Not Found</h2>
        <p className="text-muted-foreground mb-6">The quotation you are looking for does not exist.</p>
        <Button onClick={() => router.push("/sales/quotations")}>Return to List</Button>
      </div>
    );
  }

  // Only parse after data is loaded and not null
  const safeQuotation = parseDecimalFields(quotation);

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Quotation - ${quotation.quotation_no}`}
        text="Update quotation information"
      />
      <div className="w-full mx-auto py-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleClose}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="w-full py-4">
          <QuotationForm
            quotation={safeQuotation}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </>
  );
}
