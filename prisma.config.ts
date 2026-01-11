import { defineConfig } from "@prisma/config";
import "dotenv/config";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL, // <--- Tambahkan ini
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
// SET DUULU ENV DATABASE_URL BIAR KEBACAK DI PRISMA CONFIG
// echo $env:DATABASE_URL NAMPILINNNYA Kalon udh set
// $env:DATABASE_URL = "pake di env"
