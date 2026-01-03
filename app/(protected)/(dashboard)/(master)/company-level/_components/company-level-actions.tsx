"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CompanyLevel } from "@/hooks/companies/useCompanyLevels";
import CompanyLevelDeleteDialog from "./company-level-delete-dialog";

async function deleteLevel(
  id_level: number
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`/api/company-level/${id_level}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, message: "Deleted" };
    }
    return { success: false, message: data?.error || "Failed to delete" };
  } catch (e: any) {
    return { success: false, message: e.message || "Failed to delete" };
  }
}

export default function CompanyLevelActions({
  level,
}: {
  level: CompanyLevel;
}) {
  return (
    <div className="flex gap-2">
      <Link href={`/company-level/${level.id_level}/edit`} passHref>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </Link>
      <CompanyLevelDeleteDialog
        level={level}
        onDelete={deleteLevel}
        trigger={
          <Button size="sm" variant="destructive">
            Delete
          </Button>
        }
      />
    </div>
  );
}
