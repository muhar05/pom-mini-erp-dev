"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import CompanyLevelForm, {
  CompanyLevelFormValues,
} from "../../_components/company-level-form";
import { updateCompanyLevelAction } from "@/app/actions/company-level";
import { toast } from "react-hot-toast";
import { useCompanyLevelById } from "@/hooks/companies/useCompanyLevelById";

export default function EditCompanyLevelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { level, loading } = useCompanyLevelById(id);
  const router = useRouter();

  async function handleUpdate(values: CompanyLevelFormValues) {
    const res = await updateCompanyLevelAction(Number(id), values);
    if (!res.success) {
      throw new Error(res.message || "Failed to update");
    }
    toast.success("Company level updated successfully");
    router.push("/company-level");
    router.refresh();
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!level)
    return <div className="text-center py-8 text-red-500">Not found</div>;

  return <CompanyLevelForm defaultValues={level} onSubmit={handleUpdate} />;
}
