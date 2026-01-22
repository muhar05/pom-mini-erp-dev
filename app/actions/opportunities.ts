import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createOpportunityDb,
  updateOpportunityDb,
  deleteOpportunityDb,
  getOpportunityByIdDb,
  getAllOpportunitiesDb,
} from "@/data/opportunities";
import { prisma } from "@/lib/prisma";
import { getUserByIdDb } from "@/data/users";
import { users } from "@/types/models";
import { isSuperuser } from "@/utils/userHelpers"; // Pastikan ini di-uncomment

// UPDATE OPPORTUNITY
export async function updateOpportunityAction(
  id: number,
  data: Record<string, any>,
) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  const opportunity = await getOpportunityByIdDb(id);
  if (!opportunity) throw new Error("Opportunity not found");

  // Perbandingan id_user, hanya owner yang boleh update
  if (Number(opportunity.id_user) !== Number(user.id)) {
    throw new Error("Unauthorized");
    // Jika ingin superuser bisa update semua, tambahkan:
    // if (!isSuperuser(user) && Number(opportunity.id_user) !== Number(user.id)) { ... }
  }

  const updated = await updateOpportunityDb(id, data);
  return updated;
}

// DELETE OPPORTUNITY
export async function deleteOpportunityAction(id: number) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  const opportunity = await getOpportunityByIdDb(id);
  if (!opportunity) throw new Error("Opportunity not found");

  // Superuser bisa delete semua, selain itu hanya owner
  if (!isSuperuser(user) && Number(opportunity.id_user) !== Number(user.id)) {
    throw new Error("Unauthorized");
  }

  try {
    const deleted = await deleteOpportunityDb(id);
    return deleted;
  } catch (error: any) {
    if (error.code === "P2025") {
      // Not found
      return null;
    }
    throw error;
  }
}

// GET BY ID
export async function getOpportunityByIdAction(id: number) {
  const opportunity = await getOpportunityByIdDb(id);
  if (!opportunity) throw new Error("Opportunity not found");

  // Ambil user dari id_user dan assigned_to
  const idUser = opportunity.id_user
    ? await getUserByIdDb(opportunity.id_user)
    : null;
  const assignedToUser = opportunity.assigned_to
    ? await getUserByIdDb(opportunity.assigned_to)
    : null;

  return {
    id: opportunity.id.toString(),
    opportunity_no: opportunity.reference_no ?? `OPP-${opportunity.id}`,
    lead_name: opportunity.lead_name ?? "",
    customer_name: opportunity.lead_name,
    customer_email: opportunity.email ?? "",
    sales_pic: opportunity.users_leads_id_userTousers?.name ?? "",
    type: opportunity.type ?? "",
    company: opportunity.company ?? "",
    potential_value: opportunity.potential_value
      ? Number(opportunity.potential_value)
      : 0,
    expected_close_date: "",
    notes: opportunity.note ?? "",
    status: opportunity.status ?? "",
    created_at: opportunity.created_at
      ? opportunity.created_at.toISOString().split("T")[0]
      : "",
    updated_at: opportunity.created_at
      ? opportunity.created_at.toISOString().split("T")[0]
      : "",
    contact: opportunity.contact ?? "",
    phone: opportunity.phone ?? "",
    location: opportunity.location ?? "",
    product_interest: opportunity.product_interest ?? "",
    source: opportunity.source ?? "",
    id_user: opportunity.id_user ?? null,
    id_user_name: idUser ? idUser.name : "",
    assigned_to: opportunity.assigned_to ?? null,
    assigned_to_name: assignedToUser ? assignedToUser.name : "",
  };
}

export async function getAllOpportunitiesAction() {
  const opportunities = await getAllOpportunitiesDb();

  const data = await Promise.all(
    opportunities.map(async (opportunity) => ({
      id: opportunity.id.toString(),
      opportunity_no: opportunity.reference_no ?? `OPP-${opportunity.id}`,
      customer_name: opportunity.lead_name,
      customer_email: opportunity.email ?? "",
      sales_pic: opportunity.users_leads_id_userTousers?.name ?? "",
      type: opportunity.type ?? "",
      company: opportunity.company ?? "",
      potential_value: Number(opportunity.potential_value ?? 0),
      expected_close_date: "",
      notes: opportunity.note ?? "",
      status: opportunity.status ?? "",
      created_at: opportunity.created_at
        ? opportunity.created_at.toISOString().split("T")[0]
        : "",
      updated_at: opportunity.created_at
        ? opportunity.created_at.toISOString().split("T")[0]
        : "",
      contact: opportunity.contact ?? "",
      phone: opportunity.phone ?? "",
      location: opportunity.location ?? "",
      product_interest: opportunity.product_interest ?? "",
      source: opportunity.source ?? "",
      id_user: opportunity.id_user ?? null,
      assigned_to: opportunity.assigned_to ?? null,
    })),
  );

  return data;
}

export async function GET() {
  const opportunities = await getAllOpportunitiesDb();

  const data = await Promise.all(
    opportunities.map(async (opportunity: any) => ({
      id: opportunity.id.toString(),
      opportunity_no: opportunity.reference_no ?? `OPP-${opportunity.id}`,
      customer_name: opportunity.lead_name,
      customer_email: opportunity.email ?? "",
      sales_pic: "",
      type: opportunity.type ?? "",
      company: opportunity.company ?? "",
      potential_value: opportunity.potential_value
        ? Number(opportunity.potential_value)
        : 0,
      expected_close_date: "",
      notes: opportunity.note ?? "",
      status: opportunity.status ?? "",
      created_at: opportunity.created_at
        ? opportunity.created_at.toISOString().split("T")[0]
        : "",
      updated_at: opportunity.created_at
        ? opportunity.created_at.toISOString().split("T")[0]
        : "",
    })),
  );

  return NextResponse.json(data);
}

// Convert Opportunity to Sales Quotation
export async function convertOpportunityToSQ(
  opportunityId: number,
  customerId: number | null,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const opportunity = await getOpportunityByIdDb(opportunityId);
  if (!opportunity) throw new Error("Opportunity not found");

  // Perbandingan id_user, hanya owner yang boleh convert
  if (Number(opportunity.id_user) !== Number(session.user.id)) {
    throw new Error("Unauthorized");
    // Jika ingin superuser bisa convert semua, tambahkan:
    // if (!isSuperuser(session.user) && Number(opportunity.id_user) !== Number(session.user.id)) { ... }
  }

  // Ambil user_id dari session
  const userId = Number(session.user.id);

  // Ambil lead_id dari opportunity
  const leadId = opportunity.id;

  // Ambil daftar nama produk dari product_interest
  const productNames = (opportunity.product_interest || "")
    .split(",")
    .map((p: string) => p.trim())
    .filter(Boolean);

  // Query detail produk dari database
  let quotation_detail: any[] = [];
  if (productNames.length > 0) {
    const products = await prisma.products.findMany({
      where: { name: { in: productNames } },
    });
    quotation_detail = products.map((product) => ({
      product_id: product.id,
      product_name: product.name,
      product_code: product.product_code,
      quantity: 1,
      unit_price: Number(product.price ?? 0),
    }));
  }

  // Hitung total
  const total = quotation_detail.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  // Siapkan data quotation
  const baseQuotationData = {
    quotation_no: generateQuotationNo(),
    quotation_detail,
    total,
    shipping: 0,
    discount: 0,
    tax: 0,
    grand_total: total,
    status: "sq_draft",
    note: opportunity.note ?? "",
    target_date: null,
    lead_id: leadId,
    revision_no: 0,
    user: { connect: { id: userId } },
  };

  let newQuotation;
  if (customerId && customerId > 0) {
    newQuotation = await prisma.quotations.create({
      data: {
        ...baseQuotationData,
        customer: { connect: { id: customerId } },
      },
    });
  } else {
    newQuotation = await prisma.quotations.create({
      data: baseQuotationData,
    });
  }

  await updateOpportunityDb(opportunityId, { status: "opp_sq" });
  return newQuotation;
}

function generateQuotationNo(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `SQ${randomNum}`;
}
