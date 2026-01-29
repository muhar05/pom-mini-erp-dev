import { z } from "zod";

// Base field schemas
const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true; // Optional field
      // Check if it's a valid phone number (digits, spaces, dashes, parentheses, plus)
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,20}$/;
      return phoneRegex.test(val.trim());
    },
    {
      message: "Please enter a valid phone number (8-20 digits)",
    },
  );

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
    },
  );

const leadNameSchema = z
  .string()
  .min(1, "Lead name is required")
  .min(2, "Lead name must be at least 2 characters")
  .max(150, "Lead name must be less than 150 characters")
  .trim();

const leadNameOptionalSchema = z
  .string()
  .min(2, "Lead name must be at least 2 characters")
  .max(150, "Lead name must be less than 150 characters")
  .trim()
  .optional();

const contactSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      return val.trim().length >= 2 && val.trim().length <= 150;
    },
    {
      message: "Contact person must be between 2-150 characters",
    },
  );

const companySchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      return val.trim().length >= 2 && val.trim().length <= 150;
    },
    {
      message: "Company name must be between 2-150 characters",
    },
  );

const locationSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      return val.trim().length >= 2 && val.trim().length <= 150;
    },
    {
      message: "Location must be between 2-150 characters",
    },
  );

// Type: accept common strings, validate length (and letters/spaces/_-)
const typeSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const trimmed = val.trim();
      // allow up to 100 chars
      return trimmed.length <= 100;
    },
    {
      message: "Please enter a valid type (max 100 characters)",
    },
  );

// Source: accept freeform source names (Website, LinkedIn, Google Search...), validate length
const sourceSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const trimmed = val.trim();
      return trimmed.length <= 100;
    },
    {
      message: "Please enter a valid source (max 100 characters)",
    },
  );

// Status: accept both canonical options and freeform values from DB (e.g., "Open", "Follow Up")
// Validate length and prevent overly long/invalid values
const statusSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const trimmed = val.trim();
      return trimmed.length <= 50;
    },
    {
      message: "Please enter a valid status (max 50 characters)",
    },
  );

// Main lead schema for CREATE (lead_name is required)
export const createLeadSchema = z.object({
  lead_name: leadNameSchema,
  company: companySchema.refine((val) => !!val && val.trim() !== "", {
    message: "Company is required",
  }),
  contact: z.string().min(1, "Contact person is required").trim(),
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required").min(8, "Phone must be at least 8 digits").trim(),
  type: z.string().min(1, "Type is required"),
  location: z.string().min(1, "Location is required"),
  product_interest: z.string().min(1, "At least one product must be selected"),
  source: z.string().min(1, "Source is required"),
  note: z.string().min(1, "Note is required").max(1000, "Note must be less than 1000 characters").trim(),
  id_user: z.number().optional(),
  assigned_to: z.number().optional(),
  status: statusSchema,
  reference_no: z.string().optional(),
  potential_value: z.preprocess((val) => {
    if (typeof val === "string") {
      const num = Number(val.replace(/[^0-9.]/g, ""));
      return isNaN(num) ? undefined : num;
    }
    return val;
  }, z.number().min(1, "Potential value is required and must be at least 1")),
});

// Schema untuk update (all fields optional including lead_name)
export const updateLeadSchema = z.object({
  lead_name: leadNameOptionalSchema,
  contact: contactSchema,
  email: emailSchema,
  phone: phoneSchema,
  type: typeSchema,
  company: companySchema,
  location: locationSchema,
  product_interest: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.trim().length <= 200;
      },
      {
        message: "Product interest must be less than 200 characters",
      },
    ),
  source: sourceSchema,
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
      },
    ),
  id_user: z.number().optional(),
  assigned_to: z.number().optional(),
  status: statusSchema,
  reference_no: z.string().optional(),
  potential_value: z.preprocess((val) => {
    if (typeof val === "string") {
      const num = Number(val.replace(/[^0-9.]/g, ""));
      return isNaN(num) ? undefined : num;
    }
    return val;
  }, z.number().min(0, "Potential value must be a positive number").optional()),
});

// Export base schema for form validation (same as create for backward compatibility)
export const leadSchema = createLeadSchema;

// Type definitions that match database interfaces
export type CreateLeadData = z.infer<typeof createLeadSchema>;
export type UpdateLeadData = z.infer<typeof updateLeadSchema>;

// Helper function untuk validasi FormData
export function validateLeadFormData(
  formData: FormData,
  mode: "create" | "update",
) {
  const data: Record<string, any> = {};

  // Convert FormData to object
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      // Convert empty strings to undefined for optional fields
      const trimmedValue = value.trim();
      if (trimmedValue === "") {
        data[key] = undefined;
      } else {
        // Handle numeric fields
        if (key === "id_user" || key === "assigned_to") {
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
    return createLeadSchema.parse(data);
  } else {
    return updateLeadSchema.parse(data);
  }
}

// Separate function to extract ID from FormData for update operations
export function extractLeadId(formData: FormData): number {
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    throw new Error("Lead ID is required for update");
  }

  const numId = Number(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error("Invalid lead ID");
  }

  return numId;
}
