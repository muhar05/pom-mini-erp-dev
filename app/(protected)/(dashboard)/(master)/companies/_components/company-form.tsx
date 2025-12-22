"use client";

import { useState, useTransition } from "react";
import {
  updateCompanyAction,
  createCompanyAction,
} from "@/app/actions/companies";
import { useRouter } from "next/navigation";
import type { company } from "@/types/models";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CompanyForm({
  company,
  mode = "edit",
}: {
  company?: company;
  mode?: "edit" | "create";
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (company?.id) formData.set("id", String(company.id));
    startTransition(async () => {
      try {
        if (mode === "edit") {
          await updateCompanyAction(formData);
        } else {
          await createCompanyAction(formData);
        }
        router.push("/companies");
        router.refresh();
      } catch (e: any) {
        setError(e.message || "Failed to save");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "edit" ? "Edit Company" : "Create Company"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="company_name"
                  defaultValue={company?.company_name || ""}
                  required
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Level ID
                </label>
                <Input
                  name="id_level"
                  type="number"
                  defaultValue={company?.id_level || ""}
                  placeholder="Enter level id"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <Input
                  name="address"
                  defaultValue={company?.address || ""}
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">NPWP</label>
                <Input
                  name="npwp"
                  defaultValue={company?.npwp || ""}
                  placeholder="Enter NPWP"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <Textarea
                name="note"
                defaultValue={company?.note || ""}
                placeholder="Enter note"
                rows={2}
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
