"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Eye, Trash2 } from "lucide-react";
import { User, Role } from "@/types/models";
import { deleteUser } from "@/app/actions/user-actions";
import Link from "next/link";

interface UserTableProps {
  users: User[];
  roles: Role[];
}

export default function UserTable({ users, roles }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Detail User
  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  // Delete User
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
    setError("");
  };

  const handleDeleteConfirm = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await deleteUser(formData);
        setIsDeleteOpen(false);
        setSelectedUser(null);
        setError("");
      } catch (error: any) {
        setError(error.message || "Failed to delete user");
      }
    });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 h-12 text-center">No</TableHead>
            <TableHead className="px-4 h-12 text-center">Name</TableHead>
            <TableHead className="px-4 h-12 text-center">Email</TableHead>
            <TableHead className="px-4 h-12 text-center">Role</TableHead>
            <TableHead className="px-4 h-12 text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, idx) => (
            <TableRow key={user.id}>
              <TableCell className="text-center">{idx + 1}</TableCell>
              <TableCell className="text-center">{user.name}</TableCell>
              <TableCell className="text-center">{user.email}</TableCell>
              <TableCell className="text-center">
                {user.roles?.role_name ?? "-"}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  {/* Detail Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-[50%] text-blue-500 bg-primary/10"
                    onClick={() => handleViewDetail(user)}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>

                  {/* Edit Button - Link to edit page */}
                  <Link href={`/settings/users/${user.id}/edit`}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-[50%] text-green-600 bg-green-600/10"
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                  </Link>

                  {/* Delete Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-[50%] text-red-500 bg-red-500/10"
                    onClick={() => handleDelete(user)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Detail User Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Role
                </label>
                <p className="text-sm">
                  {selectedUser.roles?.role_name || "No Role"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  User ID
                </label>
                <p className="text-sm">#{selectedUser.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created At
                </label>
                <p className="text-sm">
                  {selectedUser.created_at
                    ? new Date(selectedUser.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "-"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedUser && (
              <Link href={`/settings/users/${selectedUser.id}`}>
                <Button>View Full Details</Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
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

          {selectedUser && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {selectedUser.email}
              </p>
            </div>
          )}

          <form action={handleDeleteConfirm}>
            <input type="hidden" name="id" value={selectedUser?.id} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
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
    </>
  );
}
