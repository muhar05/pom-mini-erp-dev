import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/types/models";

interface UserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isPending: boolean;
  error: string;
  onDeleteConfirm: (formData: FormData) => void;
}

export default function UserDeleteDialog({
  open,
  onOpenChange,
  user,
  isPending,
  error,
  onDeleteConfirm,
}: UserDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {user && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Name:</strong> {user.name}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        )}

        <form action={onDeleteConfirm}>
          <input type="hidden" name="id" value={user ? user.id : ""} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
