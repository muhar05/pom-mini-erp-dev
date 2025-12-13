import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

// Buat Pool sekali saja, gunakan connection string khusus runtime (tanpa sslmode)
if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString: process.env.DATABASE_URL_POOL ?? process.env.DATABASE_URL,
    ssl: {
      // Tanpa CA: matikan verifikasi agar self-signed chain tidak memblok koneksi
      rejectUnauthorized: false,
    },
    // Optional: pastikan SNI servername benar (kadang membantu)
    // host di connectionString sudah benar; jika perlu, bisa tambahkan:
    // ssl: { rejectUnauthorized: false, servername: "db-postgresql-sgp1-79578-do-user-15434388-0.d.db.ondigitalocean.com" }
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
