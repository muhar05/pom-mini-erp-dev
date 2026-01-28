import { prisma } from "@/lib/prisma";
import { leads } from "@/types/models";
import { isSuperuser, isManagerSales, isSales } from "@/utils/userHelpers";

// Tipe input untuk create/update opportunity
export type CreateOpportunityInput = Omit<
  leads,
  | "id"
  | "created_at"
  | "users_leads_assigned_toTousers"
  | "users_leads_id_userTousers"
>;
export type UpdateOpportunityInput = Partial<CreateOpportunityInput>;

// CREATE
export async function createOpportunityDb(input: CreateOpportunityInput) {
  const cleanInput = Object.fromEntries(
    Object.entries(input).filter(([_, value]) => value !== undefined)
  ) as CreateOpportunityInput;

  return prisma.leads.create({
    data: cleanInput,
  });
}

// UPDATE
export async function updateOpportunityDb(
  id: number,
  data: UpdateOpportunityInput
) {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );
  return prisma.leads.update({
    where: { id },
    data: cleanData,
  });
}

// DELETE
export async function deleteOpportunityDb(id: number) {
  return prisma.leads.delete({
    where: { id },
  });
}

// GET BY ID
export async function getOpportunityByIdDb(id: number) {
  return prisma.leads.findUnique({
    where: { id },
    include: { users_leads_id_userTousers: true },
  });
}

// GET ALL
export async function getAllOpportunitiesDb(
  user?: any,
  filters?: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }
) {
  if (!user) throw new Error("Unauthorized");

  const userId = typeof user.id === "string" ? Number(user.id) : user.id;
  const isManager = isSuperuser(user) || isManagerSales(user);

  const where: any = { AND: [] };

  // 1. Base status filter for opportunities
  where.AND.push({
    status: {
      in: [
        "lead_qualified",
        "opp_qualified",
        "opp_prospecting",
        "opp_lost",
        "opp_sq",
        "lead_converted",
        "converted",
      ],
    },
  });

  // 2. Role-based filter
  if (!isManager && isSales(user)) {
    where.AND.push({
      OR: [{ id_user: userId }, { assigned_to: userId }],
    });
  } else if (!isManager) {
    throw new Error("Forbidden access");
  }

  // 3. Search filter
  if (filters?.search) {
    where.AND.push({
      OR: [
        { lead_name: { contains: filters.search, mode: "insensitive" } },
        { reference_no: { contains: filters.search, mode: "insensitive" } },
        { company: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  // 4. Status override filter
  if (filters?.status && filters.status !== "all") {
    where.AND.push({ status: filters.status });
  }

  // 5. Date filters
  if (filters?.dateFrom || filters?.dateTo) {
    const dateRange: any = {};
    if (filters.dateFrom) dateRange.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      dateRange.lte = dateTo;
    }
    where.AND.push({ created_at: dateRange });
  }

  return prisma.leads.findMany({
    where: where.AND.length > 0 ? where : undefined,
    orderBy: { created_at: "desc" },
    include: {
      users_leads_id_userTousers: true,
      users_leads_assigned_toTousers: true,
    },
  });
}
