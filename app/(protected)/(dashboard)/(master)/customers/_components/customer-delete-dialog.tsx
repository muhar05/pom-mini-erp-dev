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
import { useDeleteCustomer } from "@/hooks/customers/useDeleteCustomer";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { customers } from "@/types/models";

// Extend customers type for UI-only fields if needed
type Customer = customers & {
  status?: string | null;
  customer_type?: string | null;
  contact_person?: string | null;
  city?: string | null;
  country?: string | null;
  updated_at?: string | Date | null;
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
  const { deleteCustomer, loading } = useDeleteCustomer();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteCustomer(customer.id);
      toast.success("Customer deleted successfully");
      onDelete?.();
      router.refresh(); // <--- ini akan reload data tabel customer
    } catch (error: any) {
      toast.error(error.message || "Failed to delete customer");
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
