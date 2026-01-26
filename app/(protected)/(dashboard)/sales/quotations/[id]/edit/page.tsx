"use client";

import QuotationForm from "../../_components/quotation-form";
import { useParams, useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useQuotationDetail } from "@/hooks/quotations/useQuotationDetail";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { convertQuotationToSalesOrderAction } from "@/app/actions/sales-orders";
import { QUOTATION_STATUSES } from "@/utils/quotationPermissions";
import { useState } from "react";
import { useSession } from "@/contexts/session-context";
import { Button } from "@/components/ui/button";
import type { quotations } from "@/types/models";
import { canAccessQuotation } from "@/utils/quotationAccess";

export default function QuotationEditPage() {
  const { id } = useParams();
  const idParam = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { quotation, loading, error } = useQuotationDetail(idParam);
  const user = useSession();
  const [converting, setConverting] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  const handleSuccess = () => {
    router.push("/sales/quotations");
  };

  const handleClose = () => {
    router.push("/sales/quotations");
  };

  const handleConvertToSO = async () => {
    if (!quotation?.id) return;
    setConverting(true);
    try {
      const result = await convertQuotationToSalesOrderAction(
        Number(quotation.id),
      );
      if (result.success) {
        toast.success(
          result.message || "Quotation successfully converted to Sales Order!",
          {
            duration: 4000,
            icon: "🎉",
          },
        );
        if (result.data?.id) {
          router.push(`/sales/sales-orders/${result.data.id}/edit`);
        } else {
          router.push("/sales/sales-orders");
        }
      } else {
        toast.error(
          result.message || "Failed to convert quotation to Sales Order",
          {
            duration: 5000,
          },
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while converting quotation",
        { duration: 5000 },
      );
    } finally {
      setConverting(false);
      setShowConvertDialog(false);
    }
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

          {/* Convert to SO Button - Available for APPROVED and SENT statuses */}
          {quotation && [QUOTATION_STATUSES.APPROVED, QUOTATION_STATUSES.SENT].includes(quotation.status as any) && (
            <Button
              variant="default"
              disabled={converting}
              onClick={() => setShowConvertDialog(true)}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {converting ? "Converting..." : "Convert to SO"}
            </Button>
          )}
        </div>

        <div className="w-full py-4">
          <QuotationForm
            quotation={safeQuotation}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </div>
      </div>

      {/* SO Conversion Confirmation Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Convert to Sales Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to convert this quotation to a Sales Order?
              This will create a new Sales Order record and mark this quotation as converted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={converting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleConvertToSO}
              disabled={converting}
              className="bg-primary"
            >
              {converting ? "Converting..." : "Yes, Convert to SO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
