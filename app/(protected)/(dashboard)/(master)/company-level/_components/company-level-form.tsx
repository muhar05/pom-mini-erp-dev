"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  level_name: z
    .string()
    .min(2, "Level name must be at least 2 characters")
    .max(100, "Level name must be less than 100 characters"),
  disc1: z.coerce
    .number()
    .min(0, "Discount 1 must be positive")
    .max(100, "Discount 1 cannot exceed 100%")
    .optional(),
  disc2: z.coerce
    .number()
    .min(0, "Discount 2 must be positive")
    .max(100, "Discount 2 cannot exceed 100%")
    .optional(),
});

export type CompanyLevelFormValues = z.infer<typeof schema>;

interface CompanyLevelFormProps {
  defaultValues?: Partial<CompanyLevelFormValues>;
  onSubmit?: (data: CompanyLevelFormValues) => Promise<void>;
  mode?: "add" | "edit";
}

export default function CompanyLevelForm({
  defaultValues,
  onSubmit: onSubmitProp,
  mode = "add",
}: CompanyLevelFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CompanyLevelFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      level_name: defaultValues?.level_name ?? "",
      disc1: defaultValues?.disc1 ?? 0,
      disc2: defaultValues?.disc2 ?? 0,
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
      } else {
        // Fallback jika tidak ada onSubmit prop
        router.push("/company-level");
        router.refresh();
      }
    } catch (e: any) {
      setError(e.message || "Failed to save");
      toast.error(e.message || "Failed to save");
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            name="level_name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-gray-200">
                  Level Name *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    required
                    placeholder="Enter level name (e.g., Bronze, Silver, Gold)"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="disc1"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">
                    Discount 1 (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={
                        field.value === undefined || field.value === null
                          ? ""
                          : field.value
                      }
                      placeholder="Enter discount 1 percentage"
                      step="0.01"
                      min="0"
                      max="100"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
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
                  <FormLabel className="dark:text-gray-200">
                    Discount 2 (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={
                        field.value === undefined || field.value === null
                          ? ""
                          : field.value
                      }
                      placeholder="Enter discount 2 percentage"
                      step="0.01"
                      min="0"
                      max="100"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-900/20 dark:border-red-800">
              <div className="text-red-600 text-sm dark:text-red-400">
                {error}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/company-level")}
              disabled={isSubmitting}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {mode === "add" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "add" ? (
                "Create Company Level"
              ) : (
                "Update Company Level"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
