import { prisma } from "@/lib/prisma";

export async function getAllCompanyLevelsDb() {
  return prisma.company_level.findMany({ orderBy: { id_level: "asc" } });
}

export async function getCompanyLevelByIdDb(id_level: number) {
  return prisma.company_level.findUnique({ where: { id_level } });
}

export async function createCompanyLevelDb(data: any) {
  return prisma.company_level.create({ data });
}

export async function updateCompanyLevelDb(id_level: number, data: any) {
  return prisma.company_level.update({ where: { id_level }, data });
}

export async function deleteCompanyLevelDb(id_level: number) {
  return prisma.company_level.delete({ where: { id_level } });
}
