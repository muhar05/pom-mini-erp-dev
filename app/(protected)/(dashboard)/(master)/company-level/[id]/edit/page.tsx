"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
    try {
      const res = await updateCompanyLevelAction(Number(id), values);
      if (!res.success) {
        throw new Error(res.message || "Failed to update");
      }
      toast.success("Company level updated successfully");
      router.push("/company-level");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update company level");
      throw error;
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <p className="text-red-500">Company level not found</p>
          <Button asChild className="mt-4">
            <Link href="/company-level">Back to Company Levels</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header dengan Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/company-level" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Company Levels
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Company Level</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update company level: {level.level_name}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">
            Company Level Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyLevelForm
            defaultValues={level}
            onSubmit={handleUpdate}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
