import { prisma } from "@/lib/prisma";
import { users, leads } from "@/types/models";
import { isSuperuser, isSales, isManagerSales } from "@/utils/leadHelpers";

export interface CreateLeadInput extends Omit<
  leads,
  | "id"
  | "created_at"
  | "users_leads_assigned_toTousers"
  | "users_leads_id_userTousers"
> { }
export interface UpdateLeadInput extends Partial<CreateLeadInput> { }

// CREATE
export async function createLeadDb(input: CreateLeadInput) {
  const cleanInput = Object.fromEntries(
    Object.entries(input).filter(([_, value]) => value !== undefined),
  ) as CreateLeadInput;

  return prisma.leads.create({
    data: cleanInput,
  });
}

// UPDATE
export async function updateLeadDb(id: number, data: UpdateLeadInput) {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );
  return prisma.leads.update({
    where: { id },
    data: cleanData,
  });
}

// DELETE
export async function deleteLeadDb(id: number) {
  return prisma.leads.delete({
    where: { id },
  });
}

// GET BY ID
export async function getLeadByIdDb(id: number) {
  const lead = await prisma.leads.findUnique({
    where: { id },
    include: {
      users_leads_assigned_toTousers: true,
      users_leads_id_userTousers: true,
    },
  });
  if (!lead) throw new Error("Lead not found");
  return lead;
}

// GET ALL
export async function getAllLeadsDb(
  user?: users | { id: string | number; role_name?: string },
  filters?: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    prefix?: string;
  }
) {
  if (!user) throw new Error("Unauthorized");

  const userId = typeof user.id === "string" ? Number(user.id) : user.id;

  // Build Filter Query
  const where: any = { AND: [] };

  // 1. Prefix filter (default to 'lead' if not specified to distinguish from opportunities)
  const statusPrefix = filters?.prefix || "lead";
  if (statusPrefix === "lead") {
    // For leads, include startsWith 'lead_', 'Open', or null
    where.AND.push({
      OR: [
        { status: { startsWith: "lead_" } },
        { status: "Open" },
        { status: null },
      ],
    });
  } else {
    where.AND.push({
      status: {
        startsWith: `${statusPrefix}_`,
      },
    });
  }

  // 2. Role-based filter
  if (!isSuperuser(user) && !isManagerSales(user)) {
    if (isSales(user)) {
      where.AND.push({
        OR: [
          { id_user: userId },
          { assigned_to: userId }
        ]
      });
    } else {
      throw new Error("Forbidden access");
    }
  }

  // 3. Search filter (lead_name or reference_no)
  if (filters?.search) {
    where.AND.push({
      OR: [
        { lead_name: { contains: filters.search, mode: 'insensitive' } },
        { reference_no: { contains: filters.search, mode: 'insensitive' } }
      ]
    });
  }

  // 4. Status filter (if specific status is chosen, it will override/refine the prefix filter if compatible)
  if (filters?.status && filters.status !== "all") {
    where.AND.push({ status: filters.status });
  }

  // 4. Date filter
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

  // Clean up where if AND is empty
  if (where.AND.length === 0) delete where.AND;

  return prisma.leads.findMany({
    where,
    include: {
      users_leads_assigned_toTousers: true,
      users_leads_id_userTousers: true,
    },
    orderBy: { created_at: "desc" },
  });
}
