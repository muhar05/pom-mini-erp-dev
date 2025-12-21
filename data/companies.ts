import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type CreateCompanyInput = Prisma.companyCreateInput;
export type UpdateCompanyInput = Prisma.companyUpdateInput;

export async function createCompanyDb(input: CreateCompanyInput) {
  return prisma.company.create({ data: input });
}

export async function updateCompanyDb(id: number, data: UpdateCompanyInput) {
  return prisma.company.update({ where: { id }, data });
}

export async function deleteCompanyDb(id: number) {
  return prisma.company.delete({ where: { id } });
}

export async function getCompanyByIdDb(id: number) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: { company_level: true, customers: true },
  });
  if (!company) throw new Error("Company not found");
  return company;
}

export async function getAllCompaniesDb() {
  return prisma.company.findMany({
    include: { company_level: true, customers: true },
    orderBy: { created_at: "desc" },
  });
}
