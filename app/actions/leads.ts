"use server";

import { revalidatePath } from "next/cache";
import {
  createLeadDb,
  updateLeadDb,
  deleteLeadDb,
  getLeadByIdDb,
  getAllLeadsDb,
} from "@/data/leads";
import { validateLeadFormData, extractLeadId } from "@/lib/schemas";
import { ZodError } from "zod";

// CREATE
export async function createLeadAction(formData: FormData) {
  try {
    // Validate form data - this ensures lead_name is required and present
    const validatedData = validateLeadFormData(formData, "create");

    // Type assertion is safe here because createLeadSchema guarantees lead_name exists
    await createLeadDb(validatedData as Parameters<typeof createLeadDb>[0]);

    revalidatePath("/crm/leads");

    return { success: true, message: "Lead created successfully" };
  } catch (error) {
    console.error("Error creating lead:", error);

    // Handle validation errors specifically
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Failed to create lead. Please check your input and try again."
    );
  }
}

// UPDATE
export async function updateLeadAction(formData: FormData) {
  try {
    // Extract and validate ID separately
    const id = extractLeadId(formData);

    // Validate form data (without ID) - all fields optional for update
    const validatedData = validateLeadFormData(formData, "update");

    // Type assertion is safe here because updateLeadSchema matches the expected type
    await updateLeadDb(id, validatedData as Parameters<typeof updateLeadDb>[1]);

    revalidatePath("/crm/leads");
    revalidatePath(`/crm/leads/${id}`);

    return { success: true, message: "Lead updated successfully" };
  } catch (error) {
    console.error("Error updating lead:", error);

    // Handle validation errors specifically
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Failed to update lead. Please check your input and try again."
    );
  }
}

// DELETE
export async function deleteLeadAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    if (!id) throw new Error("Lead ID is required");

    await deleteLeadDb(Number(id));

    revalidatePath("/crm/leads");

    return { success: true, message: "Lead deleted successfully" };
  } catch (error) {
    console.error("Error deleting lead:", error);

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return {
      success: false,
      message: "Failed to delete lead. Please try again.",
    };
  }
}

// GET BY ID
export async function getLeadByIdAction(id: number) {
  try {
    return await getLeadByIdDb(id);
  } catch (error) {
    console.error("Error fetching lead:", error);
    throw new Error("Lead not found");
  }
}

// GET ALL
export async function getAllLeadsAction() {
  try {
    return await getAllLeadsDb();
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw new Error("Failed to fetch leads");
  }
}
