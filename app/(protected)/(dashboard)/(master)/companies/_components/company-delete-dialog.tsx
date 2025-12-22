"use client";

import { useState, useTransition } from "react";
import { deleteCompanyAction } from "@/app/actions/companies";
import { useRouter } from "next/navigation";
import type { company } from "@/types/models";

export default function CompanyDeleteDialog({
  open,
  setOpen,
  company,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  company: company;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", String(company.id));
        await deleteCompanyAction(formData);
        setOpen(false);
        router.refresh();
      } catch (e: any) {
        setError(e.message || "Failed to delete");
      }
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow p-6 min-w-[300px]">
        <h2 className="font-bold mb-2">Delete Company</h2>
        <p>
          Are you sure you want to delete <b>{company.company_name}</b>?
        </p>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="flex gap-2 mt-4 justify-end">
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded border bg-red-600 text-white"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
