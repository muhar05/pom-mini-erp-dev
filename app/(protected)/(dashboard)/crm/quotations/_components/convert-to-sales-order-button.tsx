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
import { updateQuotationAction } from "@/app/actions/quotations";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ConvertToSalesOrderButtonProps {
  quotationId: number;
  quotationNo: string;
  status: string;
  stage?: string;
  grandTotal: number;
  disabled?: boolean;
}

export default function ConvertToSalesOrderButton({
  quotationId,
  quotationNo,
  status,
  stage,
  grandTotal,
  disabled = false,
}: ConvertToSalesOrderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Update kondisi untuk menerima lebih banyak status yang valid
  const canConvert =
    status === "sq_win" ||
    status === "win" ||
    status === "sq_approved" || // Tambahkan ini
    status === "approved" ||
    (status === "sq_sent" && stage === "sent");

  // Debug logging (remove in production)
  console.log("ConvertToSalesOrderButton:", {
    status,
    stage,
    canConvert,
    quotationId,
    quotationNo,
  });

  const handleConvert = async () => {
    setLoading(true);
    try {
      // Direct convert - server action sudah handle update status
      const convertResult = await convertQuotationToSalesOrderAction(
        quotationId
      );

      if (convertResult.success) {
        toast.success("Quotation successfully converted to Sales Order");
        setOpen(false);

        // Redirect to sales order detail page
        router.push(`/crm/sales-orders/${convertResult.data.sales_order_id}`);
      } else {
        toast.error(convertResult.message || "Failed to convert quotation");
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

  // Hanya tampilkan button jika memenuhi kondisi convert
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
              <strong>Current Status:</strong> {status}
            </div>
            {stage && (
              <div>
                <strong>Current Stage:</strong> {stage}
              </div>
            )}
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
              <li>
                Quotation status will be changed to <strong>CONVERTED</strong>
              </li>
              <li>
                Quotation stage will be changed to <strong>CLOSED</strong>
              </li>
              <li>Quotation data cannot be modified anymore</li>
              <li>A new Sales Order will be created automatically</li>
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
