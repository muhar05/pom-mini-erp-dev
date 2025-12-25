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
  data: Record<string, any>
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

  const deleted = await deleteOpportunityDb(id);

  return deleted;
}

// GET BY ID
export async function getOpportunityByIdAction(id: number) {
  const opportunity = await getOpportunityByIdDb(id);

  if (!opportunity) throw new Error("Opportunity not found");

  const potential_value = await calculatePotentialValue(
    opportunity.product_interest ?? ""
  );

  return {
    id: opportunity.id.toString(),
    opportunity_no: opportunity.reference_no ?? `OPP-${opportunity.id}`,
    lead_name: opportunity.lead_name ?? "",
    customer_name: opportunity.lead_name,
    customer_email: opportunity.email ?? "",
    sales_pic: opportunity.users_leads_id_userTousers?.name ?? "",
    type: opportunity.type ?? "",
    company: opportunity.company ?? "",
    potential_value,
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
    assigned_to: opportunity.assigned_to ?? null,
    // Tambahkan field lain dari leads jika ada
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
        opportunity.product_interest ?? ""
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
    }))
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
        opportunity.product_interest ?? ""
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
    }))
  );

  return NextResponse.json(data);
}
