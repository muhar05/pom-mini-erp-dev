"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCompanyAction,
  updateCompanyAction,
} from "@/app/actions/companies";
import { company } from "@/types/models";
import {
  createCompanySchema,
  updateCompanySchema,
} from "@/lib/schemas/companies";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { useCompanyLevels } from "@/hooks/companies/useCompanyLevels";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

type CompanyFormProps = {
  company?: company;
  mode?: "edit" | "create";
};

export default function CompanyForm({
  company,
  mode = "edit",
}: CompanyFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { levels, loading: loadingLevels } = useCompanyLevels();
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>(
    company?.customers?.map((c) => c.id) || []
  );

  const form = useForm({
    resolver: zodResolver(
      mode === "edit" ? updateCompanySchema : createCompanySchema
    ),
    defaultValues: {
      company_name: company?.company_name ?? "",
      address: company?.address ?? "",
      npwp: company?.npwp ?? "",
      id_level: company?.id_level ?? undefined,
      note: company?.note ?? "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: any) => {
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          formData.append(key, String(value));
      });
      // Tambahkan customer_ids ke formData
      selectedCustomers.forEach((id) =>
        formData.append("customer_ids[]", String(id))
      );
      if (company?.id) formData.set("id", String(company.id));
      if (mode === "edit") {
        await updateCompanyAction(formData);
        toast.success("Company updated successfully");
      } else {
        await createCompanyAction(formData);
        toast.success("Company created successfully");
      }
      router.push("/companies");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed to save");
      toast.error(e.message || "Failed to save");
    }
  };


  return (
    <div className="w-full mx-auto mt-8">
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle>
            {mode === "edit" ? "Edit Company" : "Create Company"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="company_name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Company Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          required
                          placeholder="Enter company name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="id_level"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <FormControl>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-between"
                              disabled={loadingLevels}
                            >
                              {loadingLevels
                                ? "Loading..."
                                : levels.find((l) => l.id_level === field.value)
                                    ?.level_name || "Select level"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            {levels.map((level) => (
                              <DropdownMenuItem
                                key={level.id_level}
                                onSelect={() => field.onChange(level.id_level)}
                              >
                                {level.level_name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="address"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="npwp"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPWP</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter NPWP" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                name="note"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter note" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
