"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

type DeliveryRequest = {
  id: string;
  dr_no: string;
  so_no: string;
  sr_no: string;
  customer_name: string;
  delivery_address: string;
  requested_by: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  request_date: string;
  required_date: string;
  delivery_type: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

interface DeliveryRequestDeleteDialogProps {
  deliveryRequest: DeliveryRequest;
  onSuccess?: () => void;
  trigger: React.ReactNode;
}

export default function DeliveryRequestDeleteDialog({
  deliveryRequest,
  onSuccess,
  trigger,
}: DeliveryRequestDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log("Deleting delivery request:", deliveryRequest.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to delete delivery request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Delivery Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete delivery request{" "}
            <span className="font-semibold">{deliveryRequest.dr_no}</span>?
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Customer: {deliveryRequest.customer_name}
            </span>
            <br />
            This action cannot be undone. This will permanently delete the
            delivery request and remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button
              className="btn btn-outline"
              type="button"
              disabled={isLoading}
            >
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="btn btn-danger"
            type="button"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
