// src/data/roles.ts
import { prisma } from "@/lib/prisma";

export async function getAllRolesDb() {
  return prisma.roles.findMany({
    orderBy: {
      id: "asc",
    },
  });
}
