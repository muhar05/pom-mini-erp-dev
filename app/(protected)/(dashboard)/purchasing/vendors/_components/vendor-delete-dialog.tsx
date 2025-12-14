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

type Vendor = {
  id: string;
  vendor_code: string;
  vendor_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  payment_term: string;
  status: string;
  total_pos: number;
  created_at: string;
  updated_at: string;
};

interface VendorDeleteDialogProps {
  vendor: Vendor;
  trigger: React.ReactNode;
  onDelete?: () => void;
}

export default function VendorDeleteDialog({
  vendor,
  trigger,
  onDelete,
}: VendorDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual delete API call
      console.log("Deleting vendor:", vendor.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onDelete?.();
    } catch (error) {
      console.error("Error deleting vendor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Vendor</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete vendor{" "}
            <strong>{vendor.vendor_name}</strong> (
            <strong>{vendor.vendor_code}</strong>)? This action cannot be undone
            and will also remove all related data.
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
            {loading ? "Deleting..." : "Delete Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
