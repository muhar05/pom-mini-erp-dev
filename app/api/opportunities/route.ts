import { NextResponse } from "next/server";
import { formatStatusDisplay } from "@/utils/statusHelpers";
import { getAllOpportunitiesDb } from "@/data/opportunities";

export async function GET() {
  // Ambil data dari data layer
  const opportunities = await getAllOpportunitiesDb();

  // Mapping ke struktur frontend, hitung total harga
  const data = await Promise.all(
    opportunities.map(async (opportunity) => ({
      id: opportunity.id.toString(),
      opportunity_no: opportunity.reference_no ?? `OPP-${opportunity.id}`,
      customer_name: opportunity.lead_name,
      customer_email: opportunity.email ?? "",
      id_user: opportunity.id_user ?? null,
      sales_pic: opportunity.users_leads_id_userTousers?.name ?? "",
      type: opportunity.type ?? "",
      company: opportunity.company ?? "",
      potential_value: opportunity.potential_value
        ? Number(opportunity.potential_value)
        : 0,
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
