// src/data/roles.ts
import { prisma } from "@/lib/prisma";

export async function getAllRolesDb() {
  return prisma.roles.findMany({
    orderBy: {
      id: "asc",
    },
  });
}

export async function createRoleDb(role_name: string) {
  return prisma.roles.create({
    data: {
      role_name,
    },
  });
}
