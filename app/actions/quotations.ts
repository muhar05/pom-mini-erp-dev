"use server";

import { revalidatePath } from "next/cache";
import {
  createQuotationDb,
  updateQuotationDb,
  deleteQuotationDb,
  getQuotationByIdDb,
  getAllQuotationsDb,
  CreateQuotationInput,
} from "@/data/quotations";
import {
  validateQuotationFormData,
  extractQuotationId,
} from "@/lib/schemas/quotations";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { users } from "@/types/models";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import { prisma } from "@/lib/prisma";

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
    // Extract the sequential number from the last quotation
    // Pattern: SQ2515020001R0
    //                ^^^^
    const lastNumber = lastQuotation.quotation_no.substring(8, 12);
    sequentialNumber = parseInt(lastNumber) + 1;
  }

  const sequence = String(sequentialNumber).padStart(4, "0");
  const revision = "R0"; // Default revision

  return `${prefix}${sequence}${revision}`;
}

// CREATE
export async function createQuotationAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = validateQuotationFormData(formData, "create");

    if (!validatedData.quotation_no) {
      validatedData.quotation_no = await generateQuotationNo();
    }

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

    const quotation = await createQuotationDb(
      validatedData as CreateQuotationInput
    );

    revalidatePath("/crm/quotations");
    return {
      success: true,
      message: "Quotation created successfully",
      data: quotation,
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
export async function updateQuotationAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const id = Number(extractQuotationId(formData));
    const oldQuotation = await getQuotationByIdDb(id);

    const validatedData = validateQuotationFormData(formData, "update");

    // Recalculate totals if quotation_detail is updated
    if (validatedData.quotation_detail) {
      const quotationDetail = validatedData.quotation_detail as any[];
      const total = quotationDetail.reduce((sum, item) => sum + item.total, 0);
      const grandTotal =
        total +
        Number(validatedData.shipping ?? oldQuotation.shipping ?? 0) +
        Number(validatedData.tax ?? oldQuotation.tax ?? 0) -
        Number(validatedData.discount ?? oldQuotation.discount ?? 0);

      validatedData.total = total;
      validatedData.grand_total = grandTotal;
    }

    const updatedQuotation = await updateQuotationDb(id, validatedData);

    revalidatePath("/crm/quotations");
    revalidatePath(`/crm/quotations/${id}`);
    return {
      success: true,
      message: "Quotation updated successfully",
      data: updatedQuotation,
    };
  } catch (error) {
    console.error("Error updating quotation:", error);

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Failed to update quotation. Please check your input and try again."
    );
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

    await deleteQuotationDb(id);

    revalidatePath("/crm/quotations");
    return { success: true, message: "Quotation deleted successfully" };
  } catch (error) {
    console.error("Error deleting quotation:", error);

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
    return await getAllQuotationsDb();
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

    const quotation = await createQuotationDb(
      validatedData as CreateQuotationInput
    );

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
      data: quotation,
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

    const quotation = await createQuotationDb({
      quotation_no: quotationData.quotation_no || (await generateQuotationNo()),
      customer_id: customer.id,
      quotation_detail: quotationData.quotation_detail || [],
      total: quotationData.total || 0,
      shipping: quotationData.shipping || 0,
      discount: quotationData.discount || 0,
      tax: quotationData.tax || 0,
      grand_total: quotationData.grand_total || 0,
      status: quotationData.status || "draft",
      stage: quotationData.stage,
      note: quotationData.note,
      target_date: quotationData.target_date,
      top: quotationData.top,
    });

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
      data: quotation,
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
