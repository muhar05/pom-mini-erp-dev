"use server";

import { revalidatePath } from "next/cache";
import {
  createLeadDb,
  updateLeadDb,
  deleteLeadDb,
  getLeadByIdDb,
  getAllLeadsDb,
  CreateLeadInput,
} from "@/data/leads";
import { validateLeadFormData, extractLeadId } from "@/lib/schemas";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { users, leads } from "@/types/models";
import { isSuperuser, isSales, logLeadActivity } from "@/utils/leadHelpers";
import {
  LEAD_STATUSES,
  OPPORTUNITY_STATUSES,
  isValidStatusTransition,
  getStatusPrefix,
} from "@/utils/statusHelpers";

// Helper untuk generate reference_no
function generateReferenceNo(): string {
  // Contoh: LE + 6 digit random (bisa diganti sesuai kebutuhan)
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `LE${randomNum}`;
}

function generateOpportunityNo(): string {
  // OP + 2 digit tahun + 2 digit bulan + 4-5 digit random
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(10000 + Math.random() * 90000); // 5 digit random
  return `OP${year}${month}${random}`;
}

// Normalisasi status lead
function normalizeStatusToNewFormat(status: string): string {
  const legacyToNewMapping: Record<string, string> = {
    new: LEAD_STATUSES.NEW,
    contacted: LEAD_STATUSES.CONTACTED,
    nurturing: LEAD_STATUSES.INTERESTED,
    qualified: LEAD_STATUSES.QUALIFIED,
    unqualified: LEAD_STATUSES.UNQUALIFIED,
    invalid: LEAD_STATUSES.UNQUALIFIED,
    converted: "prospecting", // Ubah ke prospecting
    lead_converted: "prospecting", // Ubah ke prospecting
    leadqualified: LEAD_STATUSES.QUALIFIED,
  };

  const lowerStatus = status.toLowerCase();
  return legacyToNewMapping[lowerStatus] || status;
}

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

    // Set default status using new prefixed format
    if (!validatedData.status) {
      validatedData.status = LEAD_STATUSES.NEW;
    } else {
      // Normalize legacy status to new format
      validatedData.status = normalizeStatusToNewFormat(validatedData.status);
    }

    validatedData.id_user = Number(user.id);

    // Tambahkan reference_no random jika belum ada
    validatedData.reference_no = generateReferenceNo();

    const lead = await createLeadDb(validatedData as CreateLeadInput);
    await logLeadActivity(lead.id, Number(user.id), "create", null, lead);

    revalidatePath("/crm/leads");
    return { success: true, message: "Lead created successfully" };
  } catch (error) {
    console.error("Error creating lead:", error);

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(
      "Failed to create lead. Please check your input and try again.",
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

    // Hanya superuser atau sales yang boleh update, sales hanya miliknya sendiri
    if (isSales(user) && oldLead.id_user !== user.id) {
      throw new Error("Unauthorized");
    }
    if (isSales(user) && oldLead.status === "prospecting") {
      throw new Error("Lead cannot be edited after conversion.");
    }

    const validatedData = validateLeadFormData(formData, "update");

    // Jika status qualified, ubah ke prospecting dan redirect ke opportunities
    if (validatedData.status === LEAD_STATUSES.QUALIFIED) {
      validatedData.status = OPPORTUNITY_STATUSES.PROSPECTING;
      // Generate nomor opportunity baru dengan prefix OP
      validatedData.reference_no = generateOpportunityNo();
      // Update lead status
      const updatedLead = await updateLeadDb(id, validatedData);
      await logLeadActivity(
        id,
        Number(user.id),
        "update",
        oldLead,
        updatedLead,
      );

      revalidatePath("/crm/opportunities");
      return {
        success: true,
        message:
          "Lead status changed to prospecting and moved to opportunities",
        redirect: "/crm/opportunities",
      };
    }

    // Set default status if not provided
    if (!validatedData.status) {
      validatedData.status = LEAD_STATUSES.NEW;
    } else {
      // Normalize legacy status to new format
      validatedData.status = normalizeStatusToNewFormat(validatedData.status);
    }

    // Status change validation
    if (validatedData.status && validatedData.status !== oldLead.status) {
      const oldNormalizedStatus = normalizeStatusToNewFormat(
        oldLead.status || LEAD_STATUSES.NEW,
      );

      if (isSales(user)) {
        // Sales tidak bisa ubah ke status tertentu
        const restrictedStatuses = [
          "prospecting", // ganti dari LEAD_STATUSES.CONVERTED
          LEAD_STATUSES.UNQUALIFIED,
        ];
        if (restrictedStatuses.includes(validatedData.status as any)) {
          throw new Error("Unauthorized status change.");
        }

        // Validate status transition
        if (
          !isValidStatusTransition(oldNormalizedStatus, validatedData.status)
        ) {
          throw new Error("Invalid status transition");
        }
      }

      await logLeadActivity(
        id,
        Number(user.id),
        "status-change",
        oldLead.status,
        validatedData.status,
      );
    }

    // Jangan pernah update id_user dari client
    delete (validatedData as any).id_user;

    const updatedLead = await updateLeadDb(id, validatedData);
    await logLeadActivity(id, Number(user.id), "update", oldLead, updatedLead);

    revalidatePath("/crm/leads");
    revalidatePath(`/crm/leads/${id}`);
    return { success: true, message: "Lead updated successfully" };
  } catch (error) {
    console.error("Error updating lead:", error);

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(
      "Failed to update lead. Please check your input and try again.",
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

    const normalizedStatus = normalizeStatusToNewFormat(lead.status || "");
    if (normalizedStatus === "prospecting") {
      return {
        success: false,
        message: "Lead is already Converted. Are you sure you want to delete?",
      };
    }

    await deleteLeadDb(id);
    await logLeadActivity(id, Number(user.id), "delete", lead, null);

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

  const normalizedStatus = normalizeStatusToNewFormat(lead.status || "");

  if (isSales(user)) {
    if (lead.id_user !== user.id) throw new Error("Unauthorized");
    if (normalizedStatus !== LEAD_STATUSES.QUALIFIED)
      throw new Error("Only qualified leads can be converted.");
  }
  // Superuser boleh convert kapan saja

  // Generate nomor opportunity baru
  const opportunityNo = generateOpportunityNo();

  // Ubah status menjadi converted dan update reference_no
  const updatedLead = await updateLeadDb(id, {
    status: "prospecting", // ganti dari LEAD_STATUSES.CONVERTED
    reference_no: opportunityNo,
  });

  await logLeadActivity(
    id,
    Number(user.id),
    "status-change",
    lead,
    updatedLead,
  );

  revalidatePath("/crm/leads");
  return {
    success: true,
    message: "Lead converted to opportunity",
    redirect: "/crm/opportunities", // or null/undefined if not redirecting
  };
}
