import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    ...(process.env.NODE_ENV === "production" && {
      datasourceUrl: process.env.DATABASE_URL,
    }),
  } as any);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
