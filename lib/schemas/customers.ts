import { z } from "zod";

// Base field schemas
const customerNameSchema = z
  .string()
  .min(1, "Customer name is required")
  .min(2, "Customer name must be at least 2 characters")
  .max(200, "Customer name must be less than 200 characters")
  .trim();

const customerNameOptionalSchema = z
  .string()
  .min(2, "Customer name must be at least 2 characters")
  .max(200, "Customer name must be less than 200 characters")
  .trim()
  .optional();

const emailSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true; // Optional field
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val.trim());
    },
    {
      message: "Please enter a valid email address",
    }
  );

const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true; // Optional field
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,20}$/;
      return phoneRegex.test(val.trim());
    },
    {
      message: "Please enter a valid phone number (8-20 digits)",
    }
  );

const typeSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const trimmed = val.trim();
      return trimmed.length <= 50;
    },
    {
      message: "Type must be less than 50 characters",
    }
  );

// Main customer schema for CREATE
export const createCustomerSchema = z.object({
  customer_name: customerNameSchema,
  address: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.trim().length <= 500;
      },
      {
        message: "Address must be less than 500 characters",
      }
    ),
  phone: phoneSchema,
  email: emailSchema,
  type: typeSchema,
  company_id: z.number().int().optional(),
  note: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.trim().length <= 1000;
      },
      {
        message: "Note must be less than 1000 characters",
      }
    ),
});

// Schema untuk update (all fields optional)
export const updateCustomerSchema = z.object({
  customer_name: customerNameOptionalSchema,
  address: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.trim().length <= 500;
      },
      {
        message: "Address must be less than 500 characters",
      }
    ),
  phone: phoneSchema,
  email: emailSchema,
  type: typeSchema,
  company_id: z.number().int().optional(),
  note: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.trim().length <= 1000;
      },
      {
        message: "Note must be less than 1000 characters",
      }
    ),
});

// Export base schema
export const customerSchema = createCustomerSchema;

// Type definitions
export type CreateCustomerData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>;

// Helper function untuk validasi FormData
export function validateCustomerFormData(
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
        if (key === "company_id") {
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
    return createCustomerSchema.parse(data);
  } else {
    return updateCustomerSchema.parse(data);
  }
}

// Extract ID from FormData
export function extractCustomerId(formData: FormData): number {
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    throw new Error("Customer ID is required for update");
  }

  const numId = Number(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error("Invalid customer ID");
  }

  return numId;
}
