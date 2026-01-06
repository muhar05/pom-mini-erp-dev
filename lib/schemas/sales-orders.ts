import { z } from "zod";

// Base field schemas
const saleNoSchema = z
  .string()
  .min(1, "Sale number is required")
  .max(50, "Sale number must be less than 50 characters")
  .trim();

const quotationIdSchema = z.string().optional(); // BigInt as string
const customerIdSchema = z.string().optional(); // BigInt as string

// Sale order detail item schema
const saleOrderDetailItemSchema = z.object({
  product_id: z.string().optional(), // BigInt as string
  product_name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  qty: z.number().int().min(1, "Quantity must be at least 1"),
  total: z.number().min(0).optional(),
  status: z.string().optional().default("ACTIVE"),
});

const statusSchema = z
  .string()
  .max(30, "Status must be less than 30 characters")
  .optional()
  .default("DRAFT");

const saleStatusSchema = z
  .string()
  .max(30, "Sale status must be less than 30 characters")
  .optional()
  .default("OPEN");

const paymentStatusSchema = z
  .string()
  .max(30, "Payment status must be less than 30 characters")
  .optional()
  .default("UNPAID");

// Main sales order schema for CREATE
export const createSalesOrderSchema = z.object({
  sale_no: saleNoSchema,
  customer_id: customerIdSchema, // Add customer_id support
  quotation_id: quotationIdSchema,
  total: z.number().min(0).optional().default(0),
  discount: z.number().min(0).optional().default(0),
  shipping: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
  grand_total: z.number().min(0).optional().default(0),
  status: statusSchema,
  note: z
    .string()
    .max(1000, "Note must be less than 1000 characters")
    .optional(),
  sale_status: saleStatusSchema,
  payment_status: paymentStatusSchema,
  file_po_customer: z.string().optional(),
});

// Schema untuk update (all fields optional except required validations)
export const updateSalesOrderSchema = z.object({
  sale_no: z.string().max(50).trim().optional(),
  customer_id: z.string().optional(), // Add customer_id support
  quotation_id: z.string().optional(),
  total: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  grand_total: z.number().min(0).optional(),
  status: z.string().max(30).optional(),
  note: z.string().max(1000).optional(),
  sale_status: z.string().max(30).optional(),
  payment_status: z.string().max(30).optional(),
  file_po_customer: z.string().optional(),
});

// Export base schema
export const salesOrderSchema = createSalesOrderSchema;

// Type definitions
export type CreateSalesOrderData = z.infer<typeof createSalesOrderSchema>;
export type UpdateSalesOrderData = z.infer<typeof updateSalesOrderSchema>;
export type SaleOrderDetailItem = z.infer<typeof saleOrderDetailItemSchema>;

// Helper function untuk validasi FormData atau object
export function validateSalesOrderFormData(
  formData: FormData | Record<string, any>,
  mode: "create" | "update"
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
            ["total", "shipping", "discount", "tax", "grand_total"].includes(
              key
            )
          ) {
            const numValue = Number(trimmedValue);
            data[key] = isNaN(numValue) ? undefined : numValue;
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
    return createSalesOrderSchema.parse(data);
  } else {
    return updateSalesOrderSchema.parse(data);
  }
}

// Extract ID from FormData
export function extractSalesOrderId(formData: FormData): string {
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    throw new Error("Sales order ID is required for update");
  }

  return id;
}
