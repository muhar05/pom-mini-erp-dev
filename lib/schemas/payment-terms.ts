import { z } from "zod";

// Schema untuk create
export const createPaymentTermSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  days: z.number().int().min(0).optional(),
  note: z.string().max(255).optional(),
  is_active: z.boolean().optional().default(true),
});

// Schema untuk update
export const updatePaymentTermSchema = z.object({
  code: z.string().max(50).optional(),
  name: z.string().max(100).optional(),
  days: z.number().int().min(0).optional(),
  note: z.string().max(255).optional(),
  is_active: z.boolean().optional(),
});

export type CreatePaymentTermData = z.infer<typeof createPaymentTermSchema>;
export type UpdatePaymentTermData = z.infer<typeof updatePaymentTermSchema>;
