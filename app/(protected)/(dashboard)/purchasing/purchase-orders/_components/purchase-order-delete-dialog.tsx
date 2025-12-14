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

type PurchaseOrder = {
  id: string;
  po_no: string;
  pr_no: string;
  vendor_name: string;
  vendor_email: string;
  contact_person: string;
  items_count: number;
  total_amount: number;
  order_date: string;
  delivery_date: string;
  payment_term: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface PurchaseOrderDeleteDialogProps {
  purchaseOrder: PurchaseOrder;
  trigger: React.ReactNode;
  onDelete?: () => void;
}

export default function PurchaseOrderDeleteDialog({
  purchaseOrder,
  trigger,
  onDelete,
}: PurchaseOrderDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual delete API call
      console.log("Deleting purchase order:", purchaseOrder.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onDelete?.();
    } catch (error) {
      console.error("Error deleting purchase order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Purchase Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete purchase order{" "}
            <strong>{purchaseOrder.po_no}</strong> from vendor{" "}
            <strong>{purchaseOrder.vendor_name}</strong>? This action cannot be
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
            {loading ? "Deleting..." : "Delete Purchase Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
