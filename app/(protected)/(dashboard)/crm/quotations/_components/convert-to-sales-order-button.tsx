"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, ArrowRight } from "lucide-react";
import { convertQuotationToSalesOrderAction } from "@/app/actions/sales-orders";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ConvertToSalesOrderButtonProps {
  quotationId: number;
  quotationNo: string;
  status: string;
  grandTotal: number;
  disabled?: boolean;
}

export default function ConvertToSalesOrderButton({
  quotationId,
  quotationNo,
  status,
  grandTotal,
  disabled = false,
}: ConvertToSalesOrderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Only show for approved quotations
  const canConvert = status === "sq_approved" || status === "approved";

  const handleConvert = async () => {
    setLoading(true);
    try {
      const result = await convertQuotationToSalesOrderAction(quotationId);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);

        // Redirect to sales order detail page
        router.push(`/crm/sales-orders/${result.data.sales_order_id}`);
      }
    } catch (error) {
      console.error("Error converting quotation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to convert quotation";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!canConvert || disabled) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <FileText className="h-4 w-4 mr-2" />
          Convert to Sales Order
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Quotation to Sales Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Are you sure you want to convert this quotation to a sales order?
          </p>
          <div className="bg-gray-50 p-3 rounded-md space-y-1">
            <div>
              <strong>Quotation:</strong> {quotationNo}
            </div>
            <div>
              <strong>Amount:</strong>{" "}
              {grandTotal.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </div>
          </div>
          <div className="text-sm text-red-600 space-y-2">
            <div>
              <strong>Warning:</strong> After conversion:
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Quotation status will be changed to CONVERTED</li>
              <li>Quotation data cannot be modified</li>
              <li>A new Sales Order will be created</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConvert}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? "Converting..." : "Convert to Sales Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
