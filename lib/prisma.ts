import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// production aman kek gini
// const globalForPrisma = globalThis as unknown as {
//   prisma?: PrismaClient;
//   pool?: Pool;
// };

// // Create pool only once
// if (!globalForPrisma.pool) {
//   globalForPrisma.pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl:
//       process.env.NODE_ENV === "production"
//         ? { rejectUnauthorized: false }
//         : false, // Disable SSL in development
//   });
// }

// const adapter = new PrismaPg(globalForPrisma.pool);

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     adapter,
//     log:
//       process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }

// development aman kek gini
// Force SSL configuration
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

// Create pool only once
if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false, // Disable SSL completely for testing
  });
}

const adapter = new PrismaPg(globalForPrisma.pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}