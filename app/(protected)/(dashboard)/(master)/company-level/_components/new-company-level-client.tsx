'use client'

import { useRouter } from "next/navigation";
import CompanyLevelForm, {
  CompanyLevelFormValues,
} from "../_components/company-level-form";
import { createCompanyLevelAction } from "@/app/actions/company-level";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCompanyLevelClient() {
  const router = useRouter();

  const handleSubmit = async (data: CompanyLevelFormValues) => {
    const result = await createCompanyLevelAction(data);
    if (result.success) {
      toast.success(result.message);
      router.push("/company-level");
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

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
          <h1 className="text-2xl font-bold">Add New Company Level</h1>
          <p className="text-gray-600">
            Create a new company level with discount settings
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Company Level Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyLevelForm mode="add" onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
