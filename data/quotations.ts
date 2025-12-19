import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
  data: UpdateQuotationInput
) {
  return prisma.quotations.update({
    where: { id },
    data,
  });
}

// DELETE
export async function deleteQuotationDb(id: number) {
  return prisma.quotations.delete({
    where: { id },
  });
}

// GET BY ID
export async function getQuotationByIdDb(id: number) {
  const quotation = await prisma.quotations.findUnique({
    where: { id },
  });
  if (!quotation) throw new Error("Quotation not found");
  return quotation;
}

// GET ALL
export async function getAllQuotationsDb() {
  return prisma.quotations.findMany({
    orderBy: { created_at: "desc" },
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
