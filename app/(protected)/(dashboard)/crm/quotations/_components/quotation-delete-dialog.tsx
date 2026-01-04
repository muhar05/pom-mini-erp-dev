"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { deleteQuotationAction } from "@/app/actions/quotations";
import { toast } from "react-hot-toast";

type Quotation = {
  id: string;
  quotation_no: string;
  customer_name: string;
  customer_email: string;
  type: string;
  company: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  opportunity_no: string;
};

interface QuotationDeleteDialogProps {
  quotation: Quotation;
  trigger: React.ReactNode;
  onDelete?: () => void;
}

export default function QuotationDeleteDialog({
  quotation,
  trigger,
  onDelete,
}: QuotationDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", quotation.id);

      const result = await deleteQuotationAction(formData);

      if (result.success) {
        toast.success("Quotation deleted successfully");
        onDelete?.();
      } else {
        toast.error(result.message || "Failed to delete quotation");
      }
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast.error("Failed to delete quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Quotation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete quotation{" "}
            <strong>{quotation.quotation_no}</strong> for{" "}
            <strong>{quotation.customer_name}</strong>? This action cannot be
            undone and will also remove all related data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Deleting..." : "Delete Quotation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
