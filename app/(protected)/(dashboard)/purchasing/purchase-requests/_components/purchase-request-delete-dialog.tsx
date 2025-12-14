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

type PurchaseRequest = {
  id: string;
  pr_no: string;
  so_no: string;
  requested_by: string;
  department: string;
  items_count: number;
  total_amount: number;
  request_date: string;
  required_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface PurchaseRequestDeleteDialogProps {
  purchaseRequest: PurchaseRequest;
  trigger: React.ReactNode;
  onDelete?: () => void;
}

export default function PurchaseRequestDeleteDialog({
  purchaseRequest,
  trigger,
  onDelete,
}: PurchaseRequestDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual delete API call
      console.log("Deleting purchase request:", purchaseRequest.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onDelete?.();
    } catch (error) {
      console.error("Error deleting purchase request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Purchase Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete purchase request{" "}
            <strong>{purchaseRequest.pr_no}</strong> requested by{" "}
            <strong>{purchaseRequest.requested_by}</strong>? This action cannot
            be undone and will also remove all related data.
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
            {loading ? "Deleting..." : "Delete Purchase Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
