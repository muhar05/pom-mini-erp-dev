import { z } from "zod";

// Base field schemas
const productCodeSchema = z
  .string()
  .min(1, "Product code is required")
  .min(2, "Product code must be at least 2 characters")
  .max(100, "Product code must be less than 100 characters")
  .trim();

const productNameSchema = z
  .string()
  .min(1, "Product name is required")
  .min(2, "Product name must be at least 2 characters")
  .max(200, "Product name must be less than 200 characters")
  .trim();

const productNameOptionalSchema = z
  .string()
  .min(2, "Product name must be at least 2 characters")
  .max(200, "Product name must be less than 200 characters")
  .trim()
  .optional();

const priceSchema = z
  .number()
  .min(0, "Price must be greater than or equal to 0")
  .optional();

const stockSchema = z
  .number()
  .int()
  .min(0, "Stock must be greater than or equal to 0")
  .optional();

// Main product schema for CREATE
export const createProductSchema = z.object({
  product_code: productCodeSchema, // Required for create
  name: productNameSchema, // Required for create
  item_group: z
    .string()
    .max(100, "Item group must be less than 100 characters")
    .trim()
    .optional(),
  unit: z
    .string()
    .max(50, "Unit must be less than 50 characters")
    .trim()
    .optional(),
  part_number: z
    .string()
    .max(150, "Part number must be less than 150 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .trim()
    .optional(),
  price: priceSchema,
  stock: stockSchema,
  brand: z
    .string()
    .max(100, "Brand must be less than 100 characters")
    .trim()
    .optional(),
  rack: z
    .string()
    .max(100, "Rack must be less than 100 characters")
    .trim()
    .optional(),
  images: z.any().optional(), // JSON field
});

// Schema untuk update (all fields optional including required ones)
export const updateProductSchema = z.object({
  product_code: z
    .string()
    .min(2, "Product code must be at least 2 characters")
    .max(100, "Product code must be less than 100 characters")
    .trim()
    .optional(),
  name: productNameOptionalSchema, // Optional for update
  item_group: z
    .string()
    .max(100, "Item group must be less than 100 characters")
    .trim()
    .optional(),
  unit: z
    .string()
    .max(50, "Unit must be less than 50 characters")
    .trim()
    .optional(),
  part_number: z
    .string()
    .max(150, "Part number must be less than 150 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .trim()
    .optional(),
  price: priceSchema,
  stock: stockSchema,
  brand: z
    .string()
    .max(100, "Brand must be less than 100 characters")
    .trim()
    .optional(),
  rack: z
    .string()
    .max(100, "Rack must be less than 100 characters")
    .trim()
    .optional(),
  images: z.any().optional(), // JSON field
});

// Export base schema for form validation
export const productSchema = createProductSchema;

// Type definitions
export type CreateProductData = z.infer<typeof createProductSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;

// Helper function untuk validasi FormData
export function validateProductFormData(
  formData: FormData,
  mode: "create" | "update"
) {
  const data: Record<string, any> = {};

  // Convert FormData to object
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue === "") {
        data[key] = undefined;
      } else {
        // Handle numeric fields
        if (key === "price") {
          const numValue = Number(trimmedValue);
          data[key] = isNaN(numValue) ? undefined : numValue;
        } else if (key === "stock") {
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

  // Validate based on mode
  if (mode === "create") {
    return createProductSchema.parse(data);
  } else {
    return updateProductSchema.parse(data);
  }
}

// Extract ID from FormData
export function extractProductId(formData: FormData): number {
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    throw new Error("Product ID is required for update");
  }

  const numId = Number(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error("Invalid product ID");
  }

  return numId;
}
