"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import {
  validateQuotationFormData,
  CreateQuotationData,
  UpdateQuotationData,
} from "@/lib/schemas/quotations";
import {
  createQuotationDb,
  updateQuotationDb,
  deleteQuotationDb,
  getQuotationByIdDb,
  getAllQuotationsDb,
  CreateQuotationInput,
} from "@/data/quotations";
import { users, QuotationFormData } from "@/types/models";
import { ZodError } from "zod";
import {
  getQuotationPermissions,
  validateQuotationChange,
  getUserRole,
} from "@/utils/quotationPermissions";

// Helper to generate quotation number following pattern: SQ2515020001R0
async function generateQuotationNo(): Promise<string> {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2); // 25
  const companyCode = "15"; // You can make this configurable
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 02

  // Get the latest quotation number for this year and month
  const prefix = `SQ${year}${companyCode}${month}`;

  const lastQuotation = await prisma.quotations.findFirst({
    where: {
      quotation_no: {
        startsWith: prefix,
      },
    },
    orderBy: {
      quotation_no: "desc",
    },
  });

  let sequentialNumber = 1;

  if (lastQuotation) {
    const lastNumber = lastQuotation.quotation_no.substring(8, 12);
    sequentialNumber = parseInt(lastNumber) + 1;
  }

  const sequence = String(sequentialNumber).padStart(4, "0");
  const revision = "R0"; // Default revision

  return `${prefix}${sequence}${revision}`;
}

// CREATE
export async function createQuotationAction(data: QuotationFormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = validateQuotationFormData(data, "create");

    if (!validatedData.quotation_no) {
      validatedData.quotation_no = await generateQuotationNo();
    }

    // Convert target_date to ISO string if present and not already a Date
    if (
      validatedData.target_date &&
      typeof validatedData.target_date === "string"
    ) {
      if (!validatedData.target_date.includes("T")) {
        validatedData.target_date = new Date(
          validatedData.target_date + "T00:00:00.000Z"
        ).toISOString();
      } else {
        validatedData.target_date = new Date(
          validatedData.target_date
        ).toISOString();
      }
    }

    validatedData.total = data.total;
    validatedData.grand_total = data.grand_total;

    const { customer_id, quotation_no, quotation_detail, ...rest } =
      validatedData;
    const prismaData: CreateQuotationInput = {
      ...rest,
      quotation_no: quotation_no ?? (await generateQuotationNo()),
      quotation_detail: quotation_detail ?? [],
      customer: { connect: { id: customer_id } },
    };
    const quotation = await createQuotationDb(prismaData);
    const safeQuotation = {
      ...quotation,
      total: quotation.total ? Number(quotation.total) : 0,
      shipping: quotation.shipping ? Number(quotation.shipping) : 0,
      discount: quotation.discount ? Number(quotation.discount) : 0,
      tax: quotation.tax ? Number(quotation.tax) : 0,
      grand_total: quotation.grand_total ? Number(quotation.grand_total) : 0,
    };
    revalidatePath("/crm/quotations");
    return {
      success: true,
      message: "Quotation created successfully",
      data: safeQuotation,
    };
  } catch (error) {
    console.error("Error creating quotation:", error);

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Failed to create quotation. Please check your input and try again."
    );
  }
}

// UPDATE
export async function updateQuotationAction(
  id: number,
  data: UpdateQuotationData
) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    // Get current quotation
    const currentQuotation = await getQuotationByIdDb(id);

    // Get permissions
    const permissions = getQuotationPermissions(user);
    if (!permissions.canEdit) {
      throw new Error("Insufficient permissions to edit quotation");
    }

    // Validate status/stage changes if provided
    if (data.status || data.stage) {
      const newStatus = data.status || currentQuotation.status || "sq_draft";
      const newStage = data.stage || currentQuotation.stage || "draft";

      const validation = validateQuotationChange(
        user,
        currentQuotation.status || "sq_draft",
        newStatus,
        currentQuotation.stage || "draft",
        newStage
      );

      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }
    }

    const updatedQuotation = await updateQuotationDb(id, data);

    revalidatePath("/crm/quotations");
    return {
      success: true,
      message: "Quotation updated successfully",
      data: updatedQuotation,
    };
  } catch (error) {
    console.error("Error updating quotation:", error);
    throw error;
  }
}

// DELETE
export async function deleteQuotationAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  // Only superuser can delete
  if (!isSuperuser(user)) {
    throw new Error("Unauthorized");
  }

  try {
    const id = Number(formData.get("id"));
    if (!id) throw new Error("Quotation ID is required");

    // Use direct database call instead of fetch
    await deleteQuotationDb(id);

    revalidatePath("/crm/quotations");
    return { success: true, message: "Quotation deleted successfully" };
  } catch (error) {
    console.error("Error deleting quotation:", error);

    // Handle Prisma P2025 error (record not found)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return {
        success: false,
        message: "Quotation not found or already deleted",
      };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return {
      success: false,
      message: "Failed to delete quotation. Please try again.",
    };
  }
}

// GET BY ID
export async function getQuotationByIdAction(id: number) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  return getQuotationByIdDb(id);
}

// GET ALL
export async function getAllQuotationsAction() {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const quotations = await getAllQuotationsDb();

    // Convert Decimal fields to numbers for client compatibility
    const safeQuotations = quotations.map((quotation) => ({
      ...quotation,
      total: quotation.total ? Number(quotation.total) : 0,
      shipping: quotation.shipping ? Number(quotation.shipping) : 0,
      discount: quotation.discount ? Number(quotation.discount) : 0,
      tax: quotation.tax ? Number(quotation.tax) : 0,
      grand_total: quotation.grand_total ? Number(quotation.grand_total) : 0,
    }));

    return safeQuotations;
  } catch (error) {
    console.error("Error fetching quotations:", error);
    throw new Error("Failed to fetch quotations");
  }
}

// GET OPPORTUNITY QUALIFIED LEADS
export async function getOpportunityQualifiedLeadsAction() {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    let whereClause: any = {
      OR: [
        { status: "OpportunityQualified" },
        { status: "opportunityqualified" },
        { status: "OPPORTUNITYQUALIFIED" },
      ],
    };

    if (isSales(user)) {
      const userId = typeof user.id === "string" ? Number(user.id) : user.id;
      whereClause.id_user = userId;
    }

    const leads = await prisma.leads.findMany({
      where: whereClause,
      include: {
        users_leads_id_userTousers: true,
      },
      orderBy: { created_at: "desc" },
    });

    // Map to format suitable for quotation form
    return leads.map((lead) => ({
      id: lead.id,
      reference_no: lead.reference_no || `LE${lead.id}`,
      customer_name: lead.lead_name,
      customer_email: lead.email || "",
      company: lead.company || "",
      contact: lead.contact || "",
      phone: lead.phone || "",
      location: lead.location || "",
      type: lead.type || "",
      sales_pic: lead.users_leads_id_userTousers?.name || "",
      product_interest: lead.product_interest || "",
      note: lead.note || "",
      created_at: lead.created_at
        ? lead.created_at.toISOString().split("T")[0]
        : "",
    }));
  } catch (error) {
    console.error("Error fetching opportunity qualified leads:", error);
    throw new Error("Failed to fetch opportunity qualified leads");
  }
}

// CREATE QUOTATION FROM LEAD
export async function createQuotationFromLeadAction(
  leadId: number,
  formData: FormData
) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    // Get lead data
    const lead = await prisma.leads.findUnique({
      where: { id: leadId },
      include: {
        users_leads_id_userTousers: true,
      },
    });

    if (!lead) throw new Error("Lead not found");

    // Create or find customer based on lead data
    let customer = await prisma.customers.findFirst({
      where: {
        OR: [{ customer_name: lead.lead_name }, { email: lead.email }],
      },
    });

    if (!customer) {
      // Create new customer from lead data
      customer = await prisma.customers.create({
        data: {
          customer_name: lead.lead_name,
          email: lead.email || "",
          phone: lead.phone || "",
          type: lead.type || "",
          note: `Created from lead ${lead.reference_no}`,
        },
      });
    }

    const validatedData = validateQuotationFormData(formData, "create");

    if (!validatedData.quotation_no) {
      validatedData.quotation_no = await generateQuotationNo();
    }

    // Set customer_id from created/found customer
    validatedData.customer_id = customer.id;

    // Calculate totals
    const quotationDetail = validatedData.quotation_detail as any[];
    const total = quotationDetail.reduce((sum, item) => sum + item.total, 0);
    const grandTotal =
      total +
      (validatedData.shipping || 0) +
      (validatedData.tax || 0) -
      (validatedData.discount || 0);

    validatedData.total = total;
    validatedData.grand_total = grandTotal;

    const { customer_id, ...rest } = validatedData;
    const prismaData: CreateQuotationInput = {
      ...rest,
      customer: { connect: { id: customer_id } },
      quotation_detail: validatedData.quotation_detail ?? [],
      quotation_no: validatedData.quotation_no ?? (await generateQuotationNo()),
    };
    const quotation = await createQuotationDb(prismaData);
    const safeQuotation = {
      ...quotation,
      total: quotation.total ? Number(quotation.total) : 0,
      shipping: quotation.shipping ? Number(quotation.shipping) : 0,
      discount: quotation.discount ? Number(quotation.discount) : 0,
      tax: quotation.tax ? Number(quotation.tax) : 0,
      grand_total: quotation.grand_total ? Number(quotation.grand_total) : 0,
    };

    // Optional: Update lead status to indicate quotation created
    await prisma.leads.update({
      where: { id: leadId },
      data: {
        status: "Quotation Created",
        note: `${lead.note || ""}\nQuotation ${
          quotation.quotation_no
        } created on ${new Date().toISOString()}`,
      },
    });

    revalidatePath("/crm/quotations");
    return {
      success: true,
      message: "Quotation created successfully from lead",
      data: safeQuotation,
    };
  } catch (error) {
    console.error("Error creating quotation from lead:", error);

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Failed to create quotation from lead. Please check your input and try again."
    );
  }
}

// Add this new action that accepts object data
export async function createQuotationFromLeadObjectAction(
  leadId: number,
  quotationData: any
) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    // Get lead data
    const lead = await prisma.leads.findUnique({
      where: { id: leadId },
      include: {
        users_leads_id_userTousers: true,
      },
    });

    if (!lead) throw new Error("Lead not found");

    // Create or find customer based on lead data
    let customer = await prisma.customers.findFirst({
      where: {
        OR: [{ customer_name: lead.lead_name }, { email: lead.email }],
      },
    });

    if (!customer) {
      // Create new customer from lead data
      customer = await prisma.customers.create({
        data: {
          customer_name: lead.lead_name,
          email: lead.email || "",
          phone: lead.phone || "",
          type: lead.type || "",
          note: `Created from lead ${lead.reference_no}`,
        },
      });
    }

    const { customer_id, ...rest } = quotationData;
    const prismaData = {
      ...rest,
      customer: { connect: { id: customer_id } },
      quotation_detail: quotationData.quotation_detail ?? [],
      quotation_no: quotationData.quotation_no ?? (await generateQuotationNo()),
    };
    const quotation = await createQuotationDb(prismaData);
    const safeQuotation = {
      ...quotation,
      total: quotation.total ? Number(quotation.total) : 0,
      shipping: quotation.shipping ? Number(quotation.shipping) : 0,
      discount: quotation.discount ? Number(quotation.discount) : 0,
      tax: quotation.tax ? Number(quotation.tax) : 0,
      grand_total: quotation.grand_total ? Number(quotation.grand_total) : 0,
    };

    // Update lead status
    await prisma.leads.update({
      where: { id: leadId },
      data: {
        status: "Quotation Created",
        note: `${lead.note || ""}\nQuotation ${
          quotation.quotation_no
        } created on ${new Date().toISOString()}`,
      },
    });

    revalidatePath("/crm/quotations");
    return {
      success: true,
      message: "Quotation created successfully from lead",
      data: safeQuotation,
    };
  } catch (error) {
    console.error("Error creating quotation from lead:", error);
    throw new Error("Failed to create quotation from lead");
  }
}

// Add this new action to generate quotation number without saving
export async function generateQuotationNumberAction(): Promise<string> {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    return await generateQuotationNo();
  } catch (error) {
    console.error("Error generating quotation number:", error);
    throw new Error("Failed to generate quotation number");
  }
}

// Fungsi khusus untuk approve quotation (Manager only)
export async function approveQuotationAction(id: number, note?: string) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  const userRole = getUserRole(user);
  if (userRole !== "manager_sales" && userRole !== "superuser") {
    throw new Error("Only managers can approve quotations");
  }

  try {
    const currentQuotation = await getQuotationByIdDb(id);

    if (currentQuotation.status !== "sq_review") {
      throw new Error("Can only approve quotations in review status");
    }

    const updatedQuotation = await updateQuotationDb(id, {
      status: "sq_approved",
      stage: "approved",
      note: note || currentQuotation.note,
    });

    revalidatePath("/crm/quotations");
    return {
      success: true,
      message: "Quotation approved successfully",
      data: updatedQuotation,
    };
  } catch (error) {
    console.error("Error approving quotation:", error);
    throw error;
  }
}

// Fungsi khusus untuk reject quotation (Manager only)
export async function rejectQuotationAction(id: number, reason: string) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  const userRole = getUserRole(user);
  if (userRole !== "manager_sales" && userRole !== "superuser") {
    throw new Error("Only managers can reject quotations");
  }

  try {
    const currentQuotation = await getQuotationByIdDb(id);

    if (currentQuotation.status !== "sq_review") {
      throw new Error("Can only reject quotations in review status");
    }

    const updatedQuotation = await updateQuotationDb(id, {
      status: "sq_rejected",
      stage: "review",
      note: reason,
    });

    revalidatePath("/crm/quotations");
    return {
      success: true,
      message: "Quotation rejected successfully",
      data: updatedQuotation,
    };
  } catch (error) {
    console.error("Error rejecting quotation:", error);
    throw error;
  }
}
