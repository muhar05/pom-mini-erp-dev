import { NextResponse } from "next/server";
import { formatStatusDisplay } from "@/utils/statusHelpers";
import { getAllOpportunitiesDb } from "@/data/opportunities";
import { getAllProductsDb } from "@/data/products";

// Helper hitung total harga
async function calculatePotentialValue(productInterest: string | null) {
  if (!productInterest) return 0;
  const productNames = productInterest
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (productNames.length === 0) return 0;

  // Ambil semua produk dari data layer
  const allProducts = await getAllProductsDb();
  // Filter produk yang sesuai dengan productNames
  const products = allProducts.filter((p) => productNames.includes(p.name));

  return products.reduce((sum, p) => sum + Number(p.price ?? 0), 0);
}

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
      sales_pic: "",
      type: opportunity.type ?? "",
      company: opportunity.company ?? "",
      // Hitung total harga dari produk interest
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
