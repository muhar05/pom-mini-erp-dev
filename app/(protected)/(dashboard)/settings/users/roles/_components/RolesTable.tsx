"use client";

import React, { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { roles } from "@/types/models";

export default function RolesTable({ roles }: { roles: roles[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/users/roles/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          window.location.reload();
        } else {
          const data = await res.json();
          setError(data.error || "Failed to delete role");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="bg-red-50 text-red-700 p-2 rounded mb-2">{error}</div>
      )}
      <table className="w-full">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Role Name
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Role ID
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Users
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr
              key={role.id}
              className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td className="py-4 px-4 font-medium dark:text-gray-100">
                {role.role_name}
              </td>
              <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                {role.id}
              </td>
              <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                {role.users ? role.users.length : 0}
              </td>
              <td className="py-4 px-4">
                <button
                  className={`flex items-center gap-2 px-3 py-1 rounded text-red-600 border border-red-200 dark:border-red-400 disabled:opacity-50`}
                  disabled={
                    isPending ||
                    deletingId === role.id ||
                    (role.users && role.users.length > 0)
                  }
                  onClick={() => handleDelete(role.id)}
                  title={
                    role.users && role.users.length > 0
                      ? "Cannot delete role with users"
                      : "Delete role"
                  }
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingId === role.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
