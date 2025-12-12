"use server";

import { revalidatePath } from "next/cache";
import {
  createLeadDb,
  updateLeadDb,
  deleteLeadDb,
  getLeadByIdDb,
  getAllLeadsDb,
  CreateLeadInput, // tambahkan ini
} from "@/data/leads";
import { validateLeadFormData, extractLeadId } from "@/lib/schemas";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { users, leads } from "@/types/models";
import {
  isSuperuser,
  isSales,
  logLeadActivity,
  // createOpportunityFromLead,
} from "@/utils/leadHelpers";

// CREATE
export async function createLeadAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");
  try {
    const validatedData = validateLeadFormData(formData, "create");
    if (!validatedData.lead_name) {
      throw new Error("Lead name is required");
    }
    // Pastikan status "New" jika tidak ada di input
    if (!validatedData.status) validatedData.status = "New";
    const lead = await createLeadDb(validatedData as CreateLeadInput);
    await logLeadActivity(lead.id, user!.id, "create", null, lead);

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
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");
  try {
    const id = Number(extractLeadId(formData));
    const oldLead = await getLeadByIdDb(id);

    if (isSales(user) && oldLead.id_user !== user.id) {
      throw new Error("Unauthorized");
    }
    if (isSales(user) && oldLead.status === "Converted") {
      throw new Error("Lead cannot be edited after conversion.");
    }

    const validatedData = validateLeadFormData(formData, "update");
    if (!validatedData.status) validatedData.status = "New";
    if (validatedData.status && validatedData.status !== oldLead.status) {
      if (isSales(user)) {
        if (
          ["Converted", "Invalid", "Unqualified"].includes(
            validatedData.status!
          )
        ) {
          throw new Error("Unauthorized status change.");
        }
        if (oldLead.status === "New" && validatedData.status === "Converted") {
          throw new Error("Invalid status transition");
        }
        const allowedTransitions: Record<string, string[]> = {
          New: ["Contacted"],
          Contacted: ["Qualified", "Nurturing", "Unqualified", "Invalid"],
          Qualified: ["Converted"],
          Nurturing: [],
          Unqualified: [],
          Invalid: [],
          Converted: [],
        };
        if (
          oldLead.status &&
          (!allowedTransitions[oldLead.status] ||
            !allowedTransitions[oldLead.status].includes(validatedData.status!))
        ) {
          throw new Error("Invalid status transition");
        }
      }
      await logLeadActivity(
        id,
        user.id,
        "status-change",
        oldLead.status,
        validatedData.status
      );
    }

    const updatedLead = await updateLeadDb(id, validatedData);
    await logLeadActivity(id, user.id, "update", oldLead, updatedLead);

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
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");
  try {
    const id = Number(formData.get("id"));
    if (!id) throw new Error("Lead ID is required");
    const lead = await getLeadByIdDb(id);

    if (isSales(user)) {
      throw new Error("Unauthorized");
    }
    if (lead.status === "Converted") {
      return {
        success: false,
        message: "Lead is already Converted. Are you sure you want to delete?",
      };
    }

    await deleteLeadDb(id);
    await logLeadActivity(id, user.id, "delete", lead, null);

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
  const session = await auth();
  const user = session?.user as users | undefined;
  const lead = await getLeadByIdDb(id);
  if (!user) throw new Error("Unauthorized");
  if (isSales(user) && lead.id_user !== user.id) {
    throw new Error("Unauthorized");
  }
  return lead;
}

// GET ALL
export async function getAllLeadsAction() {
  const session = await auth();
  const user = session?.user as users | undefined;
  try {
    return await getAllLeadsDb(user);
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw new Error("Failed to fetch leads");
  }
}

// CONVERT LEAD
export async function convertLeadAction(id: number) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");
  const lead = await getLeadByIdDb(id);

  if (isSales(user)) {
    if (lead.id_user !== user.id) throw new Error("Unauthorized");
    if (lead.status !== "Qualified")
      throw new Error("Only qualified leads can be converted.");
  }
  // Superuser boleh convert kapan saja

  const updatedLead = await updateLeadDb(id, { status: "Converted" });
  await logLeadActivity(id, user.id, "status-change", lead.status, "Converted");

  // await createOpportunityFromLead(updatedLead, user.id);

  revalidatePath("/crm/leads");
  return { success: true, message: "Lead converted to opportunity" };
}
