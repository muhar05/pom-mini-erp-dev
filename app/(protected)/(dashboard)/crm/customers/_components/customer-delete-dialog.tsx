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

type Customer = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  company: string;
  contact_person: string;
  address: string;
  city: string;
  country: string;
  customer_type: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface CustomerDeleteDialogProps {
  customer: Customer;
  trigger: React.ReactNode;
  onDelete?: () => void;
}

export default function CustomerDeleteDialog({
  customer,
  trigger,
  onDelete,
}: CustomerDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual delete API call
      console.log("Deleting customer:", customer.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onDelete?.();
    } catch (error) {
      console.error("Error deleting customer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>{customer.customer_name}</strong>? This action cannot be
            undone and will also remove all related data (opportunities,
            quotations, sales orders).
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
            {loading ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
