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
import { users, roles } from "@/types/models";
import { deleteUserAction } from "@/app/actions/users";
import Link from "next/link";
import UserDetailDialog from "./user-detail-dialog";
import UserDeleteDialog from "./user-delete-dialog";
import { Edit, Eye, Trash2 } from "lucide-react";

interface UserTableProps {
  users: users[];
  roles: roles[];
}

export default function UserTable({ users, roles }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<users | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Detail User
  const handleViewDetail = (user: users) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  // Delete User
  const handleDelete = (user: users) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
    setError("");
  };

  const handleDeleteConfirm = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await deleteUserAction(formData);
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
              <TableCell className="text-center py-4!">
                <div className="flex items-center p-0!">
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

      <UserDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        user={selectedUser}
      />

      <UserDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        user={selectedUser}
        isPending={isPending}
        error={error}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </>
  );
}
