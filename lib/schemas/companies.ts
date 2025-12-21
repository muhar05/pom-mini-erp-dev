import { z } from "zod";

export const createCompanySchema = z.object({
  company_name: z.string().min(2).max(200),
  address: z.string().max(500).optional(),
  npwp: z.string().max(50).optional(),
  id_level: z.number().int().optional(),
  note: z.string().max(1000).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyData = z.infer<typeof createCompanySchema>;
export type UpdateCompanyData = z.infer<typeof updateCompanySchema>;

export function validateCompanyFormData(
  formData: FormData,
  mode: "create" | "update"
) {
  const data: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      if (key === "id_level") {
        data[key] = value ? Number(value) : undefined;
      } else {
        data[key] = value.trim() === "" ? undefined : value.trim();
      }
    }
  }
  if (mode === "create") return createCompanySchema.parse(data);
  return updateCompanySchema.parse(data);
}
