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
import { useRouter } from "next/navigation";
import { CompanyLevel } from "@/hooks/companies/useCompanyLevels";

interface CompanyLevelDeleteDialogProps {
  level: CompanyLevel;
  onDelete: (
    id_level: number
  ) => Promise<{ success: boolean; message: string }>;
  trigger: React.ReactNode;
}

export default function CompanyLevelDeleteDialog({
  level,
  onDelete,
  trigger,
}: CompanyLevelDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const loadingToastId = toast.loading("Deleting company level...");

    try {
      const result = await onDelete(level.id_level);

      toast.dismiss(loadingToastId);

      if (result?.success) {
        toast.success(`Level "${level.level_name}" deleted successfully!`, {
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
        setTimeout(() => {
          setOpen(false);
          router.refresh();
        }, 100);
      } else {
        toast.error(result?.message || "Failed to delete level", {
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
      toast.dismiss(loadingToastId);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the level";
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
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Delete Company Level
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-100">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              "{level.level_name}"
            </span>
            ?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
            This action cannot be undone. All data associated with this level
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
              "Delete Level"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
