import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type CreatePaymentTermInput = Prisma.payment_termsCreateInput;
export type UpdatePaymentTermInput = Prisma.payment_termsUpdateInput;

// CREATE
export async function createPaymentTermDb(input: CreatePaymentTermInput) {
  return prisma.payment_terms.create({ data: input });
}

// UPDATE
export async function updatePaymentTermDb(
  id: number,
  data: UpdatePaymentTermInput,
) {
  return prisma.payment_terms.update({ where: { id }, data });
}

// DELETE
export async function deletePaymentTermDb(id: number) {
  return prisma.payment_terms.delete({ where: { id } });
}

// GET BY ID
export async function getPaymentTermByIdDb(id: number) {
  const paymentTerm = await prisma.payment_terms.findUnique({ where: { id } });
  if (!paymentTerm) throw new Error("Payment term not found");
  return paymentTerm;
}

// GET ALL
export async function getAllPaymentTermsDb() {
  return prisma.payment_terms.findMany({ orderBy: { name: "asc" } });
}
