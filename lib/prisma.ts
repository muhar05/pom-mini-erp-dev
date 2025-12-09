import { PrismaClient } from "@prisma/client";

// Set engine type via environment variable
if (!process.env.PRISMA_ENGINE_TYPE) {
  process.env.PRISMA_ENGINE_TYPE = "binary";
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
