"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "react-hot-toast";
import * as z from "zod";

const schema = z.object({
  level_name: z.string().min(2).max(100),
  disc1: z.coerce.number().optional(),
  disc2: z.coerce.number().optional(),
});

export type CompanyLevelFormValues = z.infer<typeof schema>;

export default function CompanyLevelForm({
  defaultValues,
  onSubmit: onSubmitProp,
}: {
  defaultValues?: Partial<CompanyLevelFormValues>;
  onSubmit?: (data: CompanyLevelFormValues) => Promise<void>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CompanyLevelFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      level_name: defaultValues?.level_name ?? "",
      disc1: defaultValues?.disc1 ?? undefined,
      disc2: defaultValues?.disc2 ?? undefined,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: CompanyLevelFormValues) => {
    setError(null);
    try {
      if (onSubmitProp) {
        await onSubmitProp(values);
      }
      router.push("/company-level");
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
            {defaultValues ? "Edit Company Level" : "Add Company Level"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="level_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level Name</FormLabel>
                    <FormControl>
                      <Input {...field} required placeholder="Level name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="disc1"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disc 1</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Disc 1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="disc2"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disc 2</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Disc 2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-red-600 text-sm">{error}</div>}
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
