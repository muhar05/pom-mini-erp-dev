import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { isSuperuser, isManagerSales, isSales } from "@/utils/userHelpers";

// Gunakan tipe yang di-generate Prisma langsung
export type CreateQuotationInput = Prisma.quotationsCreateInput;
export type UpdateQuotationInput = Prisma.quotationsUpdateInput;

// CREATE
export async function createQuotationDb(input: CreateQuotationInput) {
  return prisma.quotations.create({
    data: input,
  });
}

// UPDATE
export async function updateQuotationDb(
  id: number,
  data: UpdateQuotationInput,
) {
  return prisma.quotations.update({
    where: { id },
    data,
  });
}

// DELETE - biarkan Prisma yang handle error P2025
export async function deleteQuotationDb(id: number) {
  return prisma.quotations.delete({
    where: { id },
  });
}

// GET BY ID
export async function getQuotationByIdDb(id: number) {
  const quotation = await prisma.quotations.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          company: {
            include: {
              company_level: true, // Include company level
            },
          },
        },
      },
      user: true, // <-- Include user/sales
      // lead: true, // <-- Include lead jika ada relasi di schema
    },
  });
  if (!quotation) throw new Error("Quotation not found");
  return quotation;
}


// GET ALL
export async function getAllQuotationsDb(
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

  let where: any = { AND: [] };

  if (!isManager && isSales(user)) {
    where.AND.push({ user_id: userId });
  } else if (!isManager) {
    throw new Error("Forbidden access");
  }

  // Search filter
  if (filters?.search) {
    where.AND.push({
      OR: [
        { quotation_no: { contains: filters.search, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { customer_name: { contains: filters.search, mode: "insensitive" } },
              {
                company: {
                  company_name: { contains: filters.search, mode: "insensitive" },
                },
              },
            ],
          },
        },
      ],
    });
  }

  // Status filter - Handle both prefixed and non-prefixed legacy data
  if (filters?.status && filters.status !== "all") {
    const statusVal = filters.status;
    const leanStatus = statusVal.startsWith("sq_")
      ? statusVal.replace("sq_", "")
      : statusVal;

    where.AND.push({
      OR: [{ status: statusVal }, { status: leanStatus }],
    });
  }

  // Date filter
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

  if (where.AND.length === 0) where = undefined;

  return prisma.quotations.findMany({
    orderBy: { created_at: "desc" },
    where,
    include: {
      customer: {
        include: {
          company: {
            include: {
              company_level: true,
            },
          },
        },
      },
      user: true,
    },
  });
}

// GET BY QUOTATION NO
export async function getQuotationByNoDb(quotation_no: string) {
  const quotation = await prisma.quotations.findFirst({
    where: { quotation_no },
  });
  if (!quotation) throw new Error("Quotation not found");
  return quotation;
}
