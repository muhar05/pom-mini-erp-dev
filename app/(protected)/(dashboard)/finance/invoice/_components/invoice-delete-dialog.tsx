"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

type Invoice = {
  id: string;
  invoice_no: string;
  sales_order_no: string;
  customer_name: string;
  customer_email: string;
  billing_address: string;
  items_count: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  invoice_date: string;
  due_date: string;
  payment_term: string;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

interface InvoiceDeleteDialogProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
}

export default function InvoiceDeleteDialog({
  invoice,
  open,
  onClose,
}: InvoiceDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Implement delete functionality here
      console.log("Deleting invoice:", invoice.id);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error("Error deleting invoice:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Invoice</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete invoice{" "}
            <span className="font-semibold">{invoice.invoice_no}</span>?
            <br />
            <br />
            This action cannot be undone. This will permanently delete the
            invoice and remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
