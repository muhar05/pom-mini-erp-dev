import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { formatStatusDisplay } from "@/utils/statusHelpers";
import {
  createOpportunityDb,
  updateOpportunityDb,
  deleteOpportunityDb,
  getOpportunityByIdDb,
  getAllOpportunitiesDb,
} from "@/data/opportunities";
import { prisma } from "@/lib/prisma"; // untuk query produk
import { getUserByIdDb } from "@/data/users";
// import { createQuotationDb } from "@/data/quotations"; // COMMENT OUT untuk bypass

// Helper untuk hitung total harga dari product_interest
async function calculatePotentialValue(productInterest: string | null) {
  if (!productInterest) return 0;
  const productNames = productInterest
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (productNames.length === 0) return 0;

  const products = await prisma.products.findMany({
    where: { name: { in: productNames } },
    select: { price: true },
  });

  return products.reduce((sum, p) => sum + Number(p.price ?? 0), 0);
}

// UPDATE OPPORTUNITY
export async function updateOpportunityAction(
  id: number,
  data: Record<string, any>,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const updated = await updateOpportunityDb(id, data);

  return updated;
}

// DELETE OPPORTUNITY
export async function deleteOpportunityAction(id: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

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
    expected_close_date: "", // jika ada field di leads, isi sesuai
    notes: opportunity.note ?? "",
    status: opportunity.status ?? "",
    stage: formatStatusDisplay(opportunity.status ?? ""),
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
      potential_value: await calculatePotentialValue(
        opportunity.product_interest ?? "",
      ),
      expected_close_date: "",
      notes: opportunity.note ?? "",
      status: opportunity.status ?? "",
      stage: formatStatusDisplay(opportunity.status ?? ""),
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
      // Tambahkan field lain dari leads jika ada
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
      potential_value: await calculatePotentialValue(
        opportunity.product_interest ?? "",
      ),
      expected_close_date: "",
      notes: opportunity.note ?? "",
      status: opportunity.status ?? "",
      stage: formatStatusDisplay(opportunity.status ?? ""),
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

  // Ambil user_id dari session
  const userId = Number(session.user.id); // Pastikan number

  // Ambil lead_id dari opportunity
  const leadId = opportunity.id; // atau opportunity.lead_id jika ada field khusus

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
      quantity: 1, // Default 1, bisa diubah jika ada info qty di opportunity
      unit_price: Number(product.price ?? 0),
    }));
  }

  // Hitung total
  const total = quotation_detail.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  // Siapkan data quotation - LANGSUNG KE PRISMA
  const baseQuotationData = {
    quotation_no: generateQuotationNo(),
    quotation_detail,
    total,
    shipping: 0,
    discount: 0,
    tax: 0,
    grand_total: total,
    status: "draft",
    stage: "draft",
    note: opportunity.note ?? "",
    target_date: null,
    top: "",
    lead_id: leadId, // <-- Tambahkan lead_id
    user_id: userId, // <-- Tambahkan user_id
  };

  let newQuotation;
  if (customerId && customerId > 0) {
    newQuotation = await prisma.quotations.create({
      data: {
        ...baseQuotationData,
        customer_id: customerId,
      },
    });
  } else {
    // Jangan kirim customer_id sama sekali!
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
