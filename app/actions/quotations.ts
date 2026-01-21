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
    console.log("Data diterima dari UI:", data);
    const validatedData = validateQuotationFormData(data, "create");
    console.log("Data setelah validasi:", validatedData);

    // JANGAN hitung ulang total, discount, tax, grand_total di sini!
    // Gunakan nilai dari validatedData (yang sudah dihitung di UI)

    const { customer_id, quotation_no, quotation_detail, ...rest } =
      validatedData; // ^^^ tambahkan top di sini agar tidak ikut ke Prisma
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
    revalidatePath("/sales/quotations");
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
      "Failed to create quotation. Please check your input and try again.",
    );
  }
}

// UPDATE
export async function updateQuotationAction(
  id: number,
  data: UpdateQuotationData,
) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  // Ambil quotation dan lead terkait
  const currentQuotation = await getQuotationByIdDb(id);
  const leadId = currentQuotation.lead_id;
  let lead = null;
  if (leadId) {
    lead = await prisma.leads.findUnique({ where: { id: Number(leadId) } });
    if (!lead) throw new Error("Lead not found");
    // Validasi: hanya sales yang sama boleh update
    if (isSales(user) && Number(lead.id_user) !== Number(user.id)) {
      throw new Error(
        "Unauthorized: Only the owner sales can update this quotation.",
      );
    }
  }

  try {
    // Get current quotation
    const currentQuotation = await getQuotationByIdDb(id);

    // Get permissions
    const permissions = getQuotationPermissions(user);

    // Tambahkan pengecekan: jika superuser, override semua rules
    const isSuper = isSuperuser(user);

    if (!isSuper && !permissions.canEdit) {
      throw new Error("Unauthorized");
    }

    // Validate status/stage changes if provided
    if (!isSuper && data.status) {
      const newStatus = data.status || currentQuotation.status || "sq_draft";

      const validation = validateQuotationChange(
        user,
        currentQuotation.status || "sq_draft",
        newStatus,
      );

      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }
    }

    // Handle target_date conversion and filtering
    if (data.target_date !== undefined) {
      if (!data.target_date || data.target_date.trim() === "") {
        // Jika kosong, hapus dari data (jangan kirim ke Prisma)
        delete data.target_date;
      } else if (typeof data.target_date === "string") {
        // Jika ada nilai, konversi ke ISO DateTime
        if (data.target_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          data.target_date = `${data.target_date}T00:00:00.000Z`;
        }
      }
    }

    // Convert customer_id to number if it's a string
    if (data.customer_id && typeof data.customer_id === "string") {
      data.customer_id = parseInt(data.customer_id, 10);
    }

    // Handle revision
    const oldRevision =
      typeof currentQuotation.revision_no === "number"
        ? currentQuotation.revision_no
        : 0;
    const newRevision = oldRevision + 1;

    // Update SQ No: ganti R{old} → R{new}
    let newQuotationNo = currentQuotation.quotation_no;
    if (/R\d+$/i.test(newQuotationNo)) {
      newQuotationNo = newQuotationNo.replace(/R\d+$/i, `R${newRevision}`);
    } else {
      newQuotationNo = `${newQuotationNo}R${newRevision}`;
    }

    const updateData: any = { ...data };

    // Pastikan update quotation_no dan revision_no
    updateData.quotation_no = newQuotationNo;
    updateData.revision_no = newRevision;

    // Handle payment_term_id as relation
    if (updateData.payment_term_id) {
      updateData.payment_term = { connect: { id: updateData.payment_term_id } };
      delete updateData.payment_term_id;
    }

    if (updateData.customer_id) {
      updateData.customer = { connect: { id: Number(updateData.customer_id) } };
      delete updateData.customer_id;
    }
    const updatedQuotation = await updateQuotationDb(id, updateData);

    // Convert Decimal fields to numbers for client compatibility
    const safeQuotation = {
      ...updatedQuotation,
      total: updatedQuotation.total ? Number(updatedQuotation.total) : 0,
      shipping: updatedQuotation.shipping
        ? Number(updatedQuotation.shipping)
        : 0,
      discount: updatedQuotation.discount
        ? Number(updatedQuotation.discount)
        : 0,
      tax: updatedQuotation.tax ? Number(updatedQuotation.tax) : 0,
      grand_total: updatedQuotation.grand_total
        ? Number(updatedQuotation.grand_total)
        : 0,
    };

    revalidatePath("/sales/quotations");
    return {
      success: true,
      message: "Quotation updated successfully",
      data: safeQuotation,
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

  const id = Number(formData.get("id"));
  if (!id) throw new Error("Quotation ID is required");

  // Ambil quotation dan lead terkait
  const quotation = await getQuotationByIdDb(id);
  const leadId = quotation.lead_id;
  let lead = null;
  if (leadId) {
    lead = await prisma.leads.findUnique({ where: { id: Number(leadId) } });
    if (!lead) throw new Error("Lead not found");
    // Validasi: hanya sales yang sama boleh delete
    if (isSales(user) && Number(lead.id_user) !== Number(user.id)) {
      throw new Error(
        "Unauthorized: Only the owner sales can delete this quotation.",
      );
    }
  }

  // Only superuser can delete
  if (!isSuperuser(user)) {
    throw new Error("Unauthorized");
  }

  try {
    // Use direct database call instead of fetch
    await deleteQuotationDb(id);

    revalidatePath("/sales/quotations");
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
  formData: FormData,
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

    // JANGAN hitung ulang total, discount, tax, grand_total di sini!
    // Gunakan nilai dari validatedData (hasil UI)

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

    revalidatePath("/sales/quotations");
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
      "Failed to create quotation from lead. Please check your input and try again.",
    );
  }
}

// Add this new action that accepts object data
export async function createQuotationFromLeadObjectAction(
  leadId: number,
  quotationData: any,
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

    revalidatePath("/sales/quotations");
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

// Kirim ke manager sales untuk approval
export async function submitQuotationForApprovalAction(id: number) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  // Ambil data quotation
  const quotation = await getQuotationByIdDb(id);
  if (!quotation) throw new Error("Quotation not found");

  // Cek permission: hanya sales yang boleh submit approval
  const permissions = getQuotationPermissions(user);
  if (!permissions.canEdit) throw new Error("Anda tidak punya akses");

  // Cek status: hanya draft yang bisa dikirim
  if (
    !quotation.status ||
    !["sq_draft", "sq_revised"].includes(quotation.status.toLowerCase())
  ) {
    throw new Error(
      "Quotation hanya bisa dikirim ke approval dari status draft atau revised",
    );
  }

  // Update status ke waiting_approval (atau status lain sesuai sistem Anda)
  const updateData: any = {
    status: "sq_waiting_approval",
  };

  // Tambah revisi jika perlu
  const oldRevision =
    typeof quotation.revision_no === "number" ? quotation.revision_no : 0;
  updateData.revision_no = oldRevision + 1;

  // Update quotation
  const updated = await updateQuotationDb(id, updateData);

  // Convert Decimal fields to numbers for client compatibility
  const safeQuotation = {
    ...updated,
    total: updated.total ? Number(updated.total) : 0,
    shipping: updated.shipping ? Number(updated.shipping) : 0,
    discount: updated.discount ? Number(updated.discount) : 0,
    tax: updated.tax ? Number(updated.tax) : 0,
    grand_total: updated.grand_total ? Number(updated.grand_total) : 0,
  };

  revalidatePath("/sales/quotations");
  return {
    success: true,
    message: "Quotation berhasil dikirim ke manager sales untuk approval",
    data: safeQuotation, // <--- sudah plain object
  };
}

// Approve quotation (manager sales)
export async function approveQuotationAction(id: number, note?: string) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  // Ambil quotation
  const quotation = await getQuotationByIdDb(id);
  if (!quotation) throw new Error("Quotation not found");

  // Hanya manager sales atau superuser yang boleh approve
  const permissions = getQuotationPermissions(user);
  if (!permissions.canApprove) throw new Error("Unauthorized");

  // Update status ke approved
  const updateData: any = {
    status: "sq_approved",
    note: note
      ? `${quotation.note ? quotation.note + "\n" : ""}${note}`
      : quotation.note,
    revision_no: (quotation.revision_no ?? 0) + 1,
  };

  const updated = await updateQuotationDb(id, updateData);

  revalidatePath("/sales/quotations");
  return {
    success: true,
    message: "Quotation approved successfully",
    data: {
      ...updated,
      total: updated.total ? Number(updated.total) : 0,
      shipping: updated.shipping ? Number(updated.shipping) : 0,
      discount: updated.discount ? Number(updated.discount) : 0,
      tax: updated.tax ? Number(updated.tax) : 0,
      grand_total: updated.grand_total ? Number(updated.grand_total) : 0,
    },
  };
}

// Reject quotation (manager sales)
export async function rejectQuotationAction(id: number, note?: string) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  // Ambil quotation
  const quotation = await getQuotationByIdDb(id);
  if (!quotation) throw new Error("Quotation not found");

  // Hanya manager sales atau superuser yang boleh reject
  const permissions = getQuotationPermissions(user);
  if (!permissions.canApprove) throw new Error("Unauthorized");

  // Update status ke rejected
  const updateData: any = {
    status: "sq_rejected",
    note: note
      ? `${quotation.note ? quotation.note + "\n" : ""}${note}`
      : quotation.note,
    revision_no: (quotation.revision_no ?? 0) + 1,
  };

  const updated = await updateQuotationDb(id, updateData);

  revalidatePath("/sales/quotations");
  return {
    success: true,
    message: "Quotation rejected successfully",
    data: {
      ...updated,
      total: updated.total ? Number(updated.total) : 0,
      shipping: updated.shipping ? Number(updated.shipping) : 0,
      discount: updated.discount ? Number(updated.discount) : 0,
      tax: updated.tax ? Number(updated.tax) : 0,
      grand_total: updated.grand_total ? Number(updated.grand_total) : 0,
    },
  };
}
