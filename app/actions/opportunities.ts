"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import { revalidatePath } from "next/cache";

// Tipe data Opportunity (bisa disesuaikan dengan kebutuhan frontend)
export interface Opportunity {
  id: string;
  opportunity_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  potential_value: number;
  stage: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Helper function to calculate potential value from product interest
async function calculatePotentialValue(
  productInterest: string | null
): Promise<number> {
  if (!productInterest || productInterest.trim() === "") {
    return 0;
  }

  // Split product names by comma and trim whitespace
  const productNames = productInterest
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (productNames.length === 0) {
    return 0;
  }

  // Find products by name and sum their prices
  const products = await prisma.products.findMany({
    where: {
      name: {
        in: productNames,
      },
    },
    select: {
      name: true,
      price: true,
    },
  });

  // Calculate total price
  const totalPrice = products.reduce((sum, product) => {
    const price = product.price ? Number(product.price) : 0;
    return sum + price;
  }, 0);

  return totalPrice;
}

// Ambil semua leads yang sudah converted dan mapping ke opportunity
export async function getConvertedOpportunities(): Promise<Opportunity[]> {
  const session = await auth();
  const user = session?.user;

  // Query status: include "LeadQualified"
  let whereClause: any = {
    OR: [
      { status: "Converted" },
      { status: "converted" },
      { status: "CONVERTED" },
      { status: "Prospecting" },
      { status: "prospecting" },
      { status: "PROSPECTING" },
      { status: "OpportunityQualified" },
      { status: "opportunityqualified" },
      { status: "OPPORTUNITYQUALIFIED" },
      { status: "LeadQualified" },
      { status: "leadqualified" },
      { status: "LEADQUALIFIED" },
      { status: "Lost" },
      { status: "lost" },
      { status: "LOST" },
    ],
  };

  if (user && isSales(user)) {
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

  const opportunities = await Promise.all(
    leads.map(async (lead) => {
      const l = lead as any;
      const potentialValue = await calculatePotentialValue(l.product_interest);

      // Map stage berdasarkan status
      let stage = "Prospecting";
      if (l.status?.toLowerCase() === "converted") {
        stage = "Converted";
      } else if (l.status?.toLowerCase() === "opportunityqualified") {
        stage = "OpportunityQualified";
      } else if (l.status?.toLowerCase() === "leadqualified") {
        stage = "LeadQualified";
      } else if (l.status?.toLowerCase() === "lost") {
        stage = "Lost";
      }

      return {
        id: l.id.toString(),
        opportunity_no: l.reference_no ?? `OPP-${l.id}`,
        customer_name: l.lead_name,
        customer_email: l.email ?? "",
        sales_pic: l.users_leads_id_userTousers?.name ?? "",
        type: l.type ?? "",
        company: l.company ?? "",
        potential_value: potentialValue,
        stage: stage,
        status: l.status ?? "",
        created_at: l.created_at
          ? l.created_at.toISOString().split("T")[0]
          : "",
        updated_at: l.updated_at
          ? l.updated_at.toISOString().split("T")[0]
          : "",
      };
    })
  );

  return opportunities;
}

// Update status opportunity
export async function updateOpportunityStatus(id: string, newStatus: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  // Normalize status: if "Qualified", use "OpportunityQualified"
  if (newStatus === "Qualified") {
    newStatus = "OpportunityQualified";
  }

  const allowedStatuses = [
    "Converted",
    "Prospecting",
    "OpportunityQualified",
    "LeadQualified",
    "Qualified",
    "Lost",
  ];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error("Invalid status");
  }

  try {
    await prisma.leads.update({
      where: { id: Number(id) },
      data: {
        status: newStatus,
      },
    });

    revalidatePath("/crm/opportunities");
    revalidatePath(`/crm/opportunities/${id}`);

    return { success: true, message: `Status updated to ${newStatus}` };
  } catch (error) {
    console.error("Error updating opportunity status:", error);
    throw new Error("Failed to update status");
  }
}
