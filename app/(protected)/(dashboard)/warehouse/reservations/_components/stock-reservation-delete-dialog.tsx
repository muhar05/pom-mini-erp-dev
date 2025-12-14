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

type StockReservation = {
  id: string;
  sr_no: string;
  so_no: string;
  customer_name: string;
  reserved_by: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  reservation_date: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface StockReservationDeleteDialogProps {
  stockReservation: StockReservation;
  trigger: React.ReactNode;
  onDelete?: () => void;
}

export default function StockReservationDeleteDialog({
  stockReservation,
  trigger,
  onDelete,
}: StockReservationDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual delete API call
      console.log("Deleting stock reservation:", stockReservation.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onDelete?.();
    } catch (error) {
      console.error("Error deleting stock reservation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Stock Reservation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete stock reservation{" "}
            <strong>{stockReservation.sr_no}</strong> for SO{" "}
            <strong>{stockReservation.so_no}</strong>? This action cannot be
            undone and will release all reserved stock.
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
            {loading ? "Deleting..." : "Delete Stock Reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
