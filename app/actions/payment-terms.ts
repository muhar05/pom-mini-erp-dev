"use server";

import {
  createPaymentTermDb,
  updatePaymentTermDb,
  deletePaymentTermDb,
  getPaymentTermByIdDb,
  getAllPaymentTermsDb,
} from "@/data/payment-terms";
import {
  createPaymentTermSchema,
  updatePaymentTermSchema,
  CreatePaymentTermData,
  UpdatePaymentTermData,
} from "@/lib/schemas/payment-terms";
import { ZodError } from "zod";

// CREATE
export async function createPaymentTermAction(data: CreatePaymentTermData) {
  try {
    const validated = createPaymentTermSchema.parse(data);
    const paymentTerm = await createPaymentTermDb(validated);
    return { success: true, data: paymentTerm };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.errors.map((e) => e.message).join(", "),
      };
    }
    return { success: false, message: "Failed to create payment term" };
  }
}

// UPDATE
export async function updatePaymentTermAction(
  id: number,
  data: UpdatePaymentTermData,
) {
  try {
    const validated = updatePaymentTermSchema.parse(data);
    const paymentTerm = await updatePaymentTermDb(id, validated);
    return { success: true, data: paymentTerm };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.errors.map((e) => e.message).join(", "),
      };
    }
    return { success: false, message: "Failed to update payment term" };
  }
}

// DELETE
export async function deletePaymentTermAction(id: number) {
  try {
    await deletePaymentTermDb(id);
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete payment term" };
  }
}

// GET BY ID
export async function getPaymentTermByIdAction(id: number) {
  try {
    const paymentTerm = await getPaymentTermByIdDb(id);
    return { success: true, data: paymentTerm };
  } catch {
    return { success: false, message: "Payment term not found" };
  }
}

// GET ALL
export async function getAllPaymentTermsAction() {
  try {
    const paymentTerms = await getAllPaymentTermsDb();
    return { success: true, data: paymentTerms };
  } catch {
    return { success: false, message: "Failed to fetch payment terms" };
  }
}
