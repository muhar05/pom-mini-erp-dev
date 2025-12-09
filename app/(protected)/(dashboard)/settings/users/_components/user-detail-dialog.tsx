import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { users } from "@/types/models";

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: users | null;
}

export default function UserDetailDialog({
  open,
  onOpenChange,
  user,
}: UserDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header Section */}
        <DialogHeader className="bg-primary/5 px-8 py-6">
          <DialogTitle className="sr-only">User Details</DialogTitle>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shadow">
              {user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <h2 className="text-lg font-semibold mt-2">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge
              variant="secondary"
              className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs tracking-wide"
            >
              {user?.roles?.role_name || "No Role"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Info Section */}
        <div className="px-8 py-6">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Role</div>
              <div className="text-sm text-gray-800">
                {user?.roles?.role_name || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <div className="text-sm text-gray-800 break-all">
                {user?.email}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Created At</div>
              <div className="text-sm text-gray-800">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <DialogFooter className="bg-primary/5 px-8 py-4 flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {user && (
            <Link href={`/settings/users/${user.id}`}>
              <Button variant="default">View Full Details</Button>
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
