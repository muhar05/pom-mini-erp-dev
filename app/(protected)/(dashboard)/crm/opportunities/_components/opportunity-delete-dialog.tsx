"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteOpportunity } from "@/hooks/opportunities/useDeleteOpportunity";
import { useState } from "react";
import { toast } from "react-hot-toast";

type Opportunity = {
  id: string;
  opportunity_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  potential_value: number;
  stage: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface OpportunityDeleteDialogProps {
  opportunity: Opportunity;
  onDelete?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function OpportunityDeleteDialog({
  opportunity,
  onDelete,
  open: controlledOpen,
  onOpenChange,
}: OpportunityDeleteDialogProps) {
  const { deleteOpportunity, isLoading } = useDeleteOpportunity();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  // Controlled or uncontrolled open state
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;

  const handleDelete = async () => {
    const loadingToast = toast.loading("Deleting opportunity...");
    const success = await deleteOpportunity(opportunity.id);
    toast.dismiss(loadingToast);

    if (success) {
      toast.success(
        `Opportunity "${opportunity.opportunity_no}" deleted successfully!`
      );
      setOpen(false);
      onDelete?.();
    } else {
      toast.error("Failed to delete opportunity");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Opportunity</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete opportunity{" "}
            <strong>{opportunity.opportunity_no}</strong> for{" "}
            <strong>{opportunity.customer_name}</strong>? This action cannot be
            undone and will also remove all related data.
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
            {isLoading ? "Deleting..." : "Delete Opportunity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
