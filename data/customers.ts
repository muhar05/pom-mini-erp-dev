import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Gunakan tipe yang di-generate Prisma langsung
export type CreateCustomerInput = Prisma.customersCreateInput;
export type UpdateCustomerInput = Prisma.customersUpdateInput;

// CREATE
export async function createCustomerDb(input: CreateCustomerInput) {
  return prisma.customers.create({
    data: input,
  });
}

// UPDATE
export async function updateCustomerDb(id: number, data: UpdateCustomerInput) {
  return prisma.customers.update({
    where: { id },
    data,
  });
}

// DELETE
export async function deleteCustomerDb(id: number) {
  return prisma.customers.delete({
    where: { id },
  });
}

// GET BY ID
export async function getCustomerByIdDb(id: number) {
  const customer = await prisma.customers.findUnique({
    where: { id },
    include: {
      company: {
        include: {
          company_level: true,
        },
      },
    },
  });
  if (!customer) throw new Error("Customer not found");
  return customer;
}

// GET ALL
export async function getAllCustomersDb() {
  return prisma.customers.findMany({
    include: {
      company: {
        include: {
          company_level: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

// GET BY EMAIL
export async function getCustomerByEmailDb(email: string) {
  const customer = await prisma.customers.findFirst({
    where: { email },
    include: {
      company: {
        include: {
          company_level: true,
        },
      },
    },
  });
  if (!customer) throw new Error("Customer not found");
  return customer;
}
