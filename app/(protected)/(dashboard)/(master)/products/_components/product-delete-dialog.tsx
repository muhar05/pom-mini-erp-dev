"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Product } from "../page";
import { deleteProductAction } from "@/app/actions/products";

interface ProductDeleteDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function ProductDeleteDialog({
  product,
  isOpen,
  onClose,
  onDeleted,
}: ProductDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!product) return;

    try {
      setIsLoading(true);

      // Create FormData for server action
      const formData = new FormData();
      formData.append("id", product.id.toString());

      const result = await deleteProductAction(formData);

      if (result.success) {
        onDeleted?.();
        onClose();
      } else {
        console.error("Delete failed:", result.message);
        // Optionally show error to user
      }
    } catch (error) {
      console.error("Delete error:", error);
      // Optionally show error to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete product{" "}
            <strong>{product?.name}</strong> ({product?.product_code})? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
