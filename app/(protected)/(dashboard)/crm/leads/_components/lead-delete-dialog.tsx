"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface LeadDeleteDialogProps {
  leadId: number;
  leadName: string;
  trigger: React.ReactNode;
  onDelete: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
}

export default function LeadDeleteDialog({
  leadId,
  leadName,
  trigger,
  onDelete,
}: LeadDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    // Show loading toast
    const loadingToastId = toast.loading("Deleting lead...");

    try {
      const formData = new FormData();
      formData.append("id", String(leadId));

      const result = await onDelete(formData);

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      if (result?.success) {
        // Show success toast
        toast.success(`Lead "${leadName}" deleted successfully!`, {
          duration: 4000,
          style: {
            background: "#10B981",
            color: "#fff",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        });

        setOpen(false);
      } else {
        // Show error toast if result indicates failure
        toast.error(result?.message || "Failed to delete lead", {
          duration: 5000,
          style: {
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      console.error("Error deleting lead:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the lead";

      // Show error toast
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Delete Lead
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{leadName}"</span>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone. All data associated with this lead
            will be permanently removed.
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </span>
            ) : (
              "Delete Lead"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
