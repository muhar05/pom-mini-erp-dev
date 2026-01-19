import { z } from "zod";

// Base field schemas
const quotationNoSchema = z
  .string()
  .min(1, "Quotation number is required")
  .max(50, "Quotation number must be less than 50 characters")
  .trim();

const customerIdSchema = z.number().int().min(1, "Customer is required");

// Quotation detail item schema (untuk array produk)
const quotationDetailItemSchema = z.object({
  product_id: z.number().int().optional(),
  product_name: z.string().min(1, "Product name is required"),
  product_code: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z
    .number()
    .min(0, "Unit price must be greater than or equal to 0"),
  discount: z.number().min(0).max(100).optional().default(0),
  total: z.number().min(0),
});

const quotationDetailSchema = z
  .array(quotationDetailItemSchema)
  .min(1, "At least one product is required");

const statusSchema = z
  .string()
  .max(50, "Status must be less than 50 characters")
  .optional()
  .default("draft");

// Main quotation schema for CREATE
export const createQuotationSchema = z.object({
  quotation_no: quotationNoSchema,
  customer_id: customerIdSchema,
  quotation_detail: quotationDetailSchema,
  total: z.number().min(0).optional().default(0),
  shipping: z.number().min(0).optional().default(0),
  discount: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
  grand_total: z.number().min(0).optional().default(0),
  status: statusSchema,
  note: z
    .string()
    .max(1000, "Note must be less than 1000 characters")
    .optional(),
  target_date: z.string().optional(), // ISO date string
  top: z.string().max(50, "TOP must be less than 50 characters").optional(),
});

// Schema untuk update (all fields optional except required validations)
export const updateQuotationSchema = z.object({
  quotation_no: z.string().max(50).trim().optional(),
  customer_id: z.number().int().min(1).optional(),
  quotation_detail: quotationDetailSchema.optional(),
  total: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  grand_total: z.number().min(0).optional(),
  status: z.string().max(50).optional(),
  note: z.string().max(1000).optional(),
  target_date: z.string().optional(),
  top: z.string().max(50).optional(),
});

// Extended schema for creating quotation from lead
export const createQuotationFromLeadSchema = z.object({
  quotation_no: quotationNoSchema.optional(),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email().optional(),
  quotation_detail: quotationDetailSchema,
  total: z.number().min(0).optional().default(0),
  shipping: z.number().min(0).optional().default(0),
  discount: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
  grand_total: z.number().min(0).optional().default(0),
  status: statusSchema,
  note: z.string().max(1000).optional(),
  target_date: z.string().optional(),
  top: z.string().max(50).optional(),
});

// Export base schema
export const quotationSchema = createQuotationSchema;

// Type definitions
export type CreateQuotationData = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationData = z.infer<typeof updateQuotationSchema>;
export type QuotationDetailItem = z.infer<typeof quotationDetailItemSchema>;

// Helper function untuk validasi FormData atau object
export function validateQuotationFormData(
  formData: FormData | Record<string, any>,
  mode: "create" | "update",
) {
  let data: Record<string, any> = {};

  if (typeof FormData !== "undefined" && formData instanceof FormData) {
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue === "") {
          data[key] = undefined;
        } else {
          // Handle numeric fields
          if (
            [
              "customer_id",
              "total",
              "shipping",
              "discount",
              "tax",
              "grand_total",
            ].includes(key)
          ) {
            const numValue = Number(trimmedValue);
            data[key] = isNaN(numValue) ? undefined : numValue;
          } else if (key === "quotation_detail") {
            // Parse JSON for quotation_detail
            try {
              data[key] = JSON.parse(trimmedValue);
            } catch {
              data[key] = undefined;
            }
          } else {
            data[key] = trimmedValue;
          }
        }
      } else {
        data[key] = value;
      }
    }
  } else {
    // Assume it's a plain object
    data = { ...formData };
  }

  // Validate based on mode
  if (mode === "create") {
    return createQuotationSchema.parse(data);
  } else {
    return updateQuotationSchema.parse(data);
  }
}

// Extract ID from FormData
export function extractQuotationId(formData: FormData): number {
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    throw new Error("Quotation ID is required for update");
  }

  const numId = Number(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error("Invalid quotation ID");
  }

  return numId;
}
