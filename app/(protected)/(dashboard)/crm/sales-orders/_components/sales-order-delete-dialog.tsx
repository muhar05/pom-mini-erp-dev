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

type SalesOrder = {
  id: string;
  so_no: string;
  quotation_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  items_count: number;
  total_amount: number;
  payment_term: string;
  delivery_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface SalesOrderDeleteDialogProps {
  salesOrder: SalesOrder;
  trigger: React.ReactNode;
  onDelete?: () => void;
}

export default function SalesOrderDeleteDialog({
  salesOrder,
  trigger,
  onDelete,
}: SalesOrderDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual delete API call
      console.log("Deleting sales order:", salesOrder.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onDelete?.();
    } catch (error) {
      console.error("Error deleting sales order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Sales Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete sales order{" "}
            <strong>{salesOrder.so_no}</strong> for{" "}
            <strong>{salesOrder.customer_name}</strong>? This action cannot be
            undone and will also remove all related data (delivery requests,
            invoices, payments).
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
            {loading ? "Deleting..." : "Delete Sales Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
