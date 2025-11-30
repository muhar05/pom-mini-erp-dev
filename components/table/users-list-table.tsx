"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Trash2 } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role_id?: number | null;
  created_at?: string;
  roles?: { role_name: string } | null; // <-- perbaiki di sini
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
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
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-[50%] text-blue-500 bg-primary/10"
                >
                  <Eye className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-[50%] text-green-600 bg-green-600/10"
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-[50%] text-red-500 bg-red-500/10"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
