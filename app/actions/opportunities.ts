"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import { revalidatePath } from "next/cache";
import {
  LEAD_STATUSES,
  OPPORTUNITY_STATUSES,
  isValidStatusTransition,
  formatStatusDisplay,
} from "@/utils/statusHelpers";

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

// Helper to check if status indicates a converted opportunity
function isOpportunityStatus(status: string): boolean {
  const opportunityStatuses = [
    LEAD_STATUSES.CONVERTED,
    OPPORTUNITY_STATUSES.NEW,
    OPPORTUNITY_STATUSES.QUALIFIED,
    OPPORTUNITY_STATUSES.PROPOSAL,
    OPPORTUNITY_STATUSES.NEGOTIATION,
    OPPORTUNITY_STATUSES.WON,
    OPPORTUNITY_STATUSES.LOST,
    OPPORTUNITY_STATUSES.CANCELLED,
    // Legacy statuses for backward compatibility
    "Converted",
    "converted",
    "CONVERTED",
    "Prospecting",
    "prospecting",
    "PROSPECTING",
    "OpportunityQualified",
    "opportunityqualified",
    "OPPORTUNITYQUALIFIED",
    "LeadQualified",
    "leadqualified",
    "LEADQUALIFIED",
    "Lost",
    "lost",
    "LOST",
  ];

  return opportunityStatuses.includes(status);
}

// Map status to display stage
function mapStatusToStage(status: string): string {
  const statusLower = status.toLowerCase();

  // Handle prefixed statuses
  if (status === LEAD_STATUSES.CONVERTED) return "Converted";
  if (status === OPPORTUNITY_STATUSES.NEW) return "New Opportunity";
  if (status === OPPORTUNITY_STATUSES.QUALIFIED) return "Qualified";
  if (status === OPPORTUNITY_STATUSES.PROPOSAL) return "Proposal";
  if (status === OPPORTUNITY_STATUSES.NEGOTIATION) return "Negotiation";
  if (status === OPPORTUNITY_STATUSES.WON) return "Won";
  if (status === OPPORTUNITY_STATUSES.LOST) return "Lost";
  if (status === OPPORTUNITY_STATUSES.CANCELLED) return "Cancelled";

  // Handle legacy statuses
  switch (statusLower) {
    case "converted":
      return "Converted";
    case "opportunityqualified":
      return "Qualified";
    case "leadqualified":
      return "Lead Qualified";
    case "prospecting":
      return "Prospecting";
    case "lost":
      return "Lost";
    default:
      return formatStatusDisplay(status);
  }
}

// Ambil semua leads yang sudah converted dan mapping ke opportunity
export async function getConvertedOpportunities(): Promise<Opportunity[]> {
  const session = await auth();
  const user = session?.user;

  let whereClause: any = {
    OR: [
      // New prefixed statuses
      { status: LEAD_STATUSES.CONVERTED },
      { status: OPPORTUNITY_STATUSES.NEW },
      { status: OPPORTUNITY_STATUSES.QUALIFIED },
      { status: OPPORTUNITY_STATUSES.PROPOSAL },
      { status: OPPORTUNITY_STATUSES.NEGOTIATION },
      { status: OPPORTUNITY_STATUSES.WON },
      { status: OPPORTUNITY_STATUSES.LOST },
      { status: OPPORTUNITY_STATUSES.CANCELLED },

      // Legacy statuses for backward compatibility
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

      const stage = mapStatusToStage(l.status ?? "");

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

  // Validate new status
  const validOpportunityStatuses = [
    ...Object.values(OPPORTUNITY_STATUSES),
    // Legacy statuses for backward compatibility
    "Converted",
    "Prospecting",
    "OpportunityQualified",
    "LeadQualified",
    "Qualified",
    "Lost",
  ];

  if (!validOpportunityStatuses.includes(newStatus)) {
    throw new Error("Invalid status");
  }

  try {
    // Get current lead to validate transition
    const currentLead = await prisma.leads.findUnique({
      where: { id: Number(id) },
    });

    if (!currentLead) {
      throw new Error("Opportunity not found");
    }

    // For sales users, validate status transitions
    if (isSales(user)) {
      const currentStatus = currentLead.status || "";

      // Convert legacy status to new format for validation if needed
      const normalizedCurrentStatus = currentStatus.startsWith("opp_")
        ? currentStatus
        : currentStatus.toLowerCase() === "converted"
        ? OPPORTUNITY_STATUSES.NEW
        : currentStatus;

      const normalizedNewStatus = newStatus.startsWith("opp_")
        ? newStatus
        : newStatus === "Qualified"
        ? OPPORTUNITY_STATUSES.QUALIFIED
        : newStatus;

      if (
        !isValidStatusTransition(normalizedCurrentStatus, normalizedNewStatus)
      ) {
        throw new Error("Invalid status transition");
      }
    }

    await prisma.leads.update({
      where: { id: Number(id) },
      data: {
        status: newStatus,
      },
    });

    revalidatePath("/crm/opportunities");
    revalidatePath(`/crm/opportunities/${id}`);

    return {
      success: true,
      message: `Status updated to ${formatStatusDisplay(newStatus)}`,
    };
  } catch (error) {
    console.error("Error updating opportunity status:", error);
    throw new Error("Failed to update status");
  }
}
