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

type GoodsReceipt = {
  id: string;
  gr_no: string;
  po_no: string;
  vendor_name: string;
  receiver_name: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  receipt_date: string;
  delivery_note: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface GoodsReceiptDeleteDialogProps {
  goodsReceipt: GoodsReceipt;
  trigger: React.ReactNode;
  onDelete?: () => void;
}

export default function GoodsReceiptDeleteDialog({
  goodsReceipt,
  trigger,
  onDelete,
}: GoodsReceiptDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual delete API call
      console.log("Deleting goods receipt:", goodsReceipt.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onDelete?.();
    } catch (error) {
      console.error("Error deleting goods receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Goods Receipt</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete goods receipt{" "}
            <strong>{goodsReceipt.gr_no}</strong> for PO{" "}
            <strong>{goodsReceipt.po_no}</strong>? This action cannot be undone
            and may affect stock levels.
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
            {loading ? "Deleting..." : "Delete Goods Receipt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
