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
export async function getAllQuotationsDb(user?: any) {
  if (!user) throw new Error("Unauthorized");

  const userId = typeof user.id === "string" ? Number(user.id) : user.id;
  const isManager = isSuperuser(user) || isManagerSales(user);

  let where: any = undefined;

  if (!isManager && isSales(user)) {
    where = { user_id: userId };
  } else if (!isManager) {
    throw new Error("Forbidden access");
  }

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
