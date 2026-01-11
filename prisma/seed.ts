import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting seed...");

  // Seed roles
  const roles = await prisma.roles.createMany({
    data: [
      { id: 1, role_name: "Superuser" },
      { id: 2, role_name: "Sales" },
      { id: 3, role_name: "Warehouse" },
      { id: 4, role_name: "Finance" },
      { id: 5, role_name: "Purchasing" },
      { id: 6, role_name: "Manager Sales" },
    ],
    skipDuplicates: true,
  });
  console.log("Roles seeded:", roles);

  // Seed users
  const users = await prisma.users.createMany({
    data: [
      {
        id: 1,
        name: "Administrator",
        email: "applikasiindonesia@gmail.com",
        password_hash:
          "$2y$10$u1lM5VwcyNqz5vE8p5GoweCJcSksuWc2oS3R0YyqSfw1h3xwVQbdu",
        role_id: 1,
        created_at: new Date("2025-11-25T13:21:01.083Z"),
      },
      {
        id: 2,
        name: "muhar",
        email: "ferdiansyahmuh5@gmail.com",
        password_hash:
          "$2b$10$k5tDpjp1pR9FqjvGfP3FSe1oZPZJH0Bptn1e3J8pYcVJqf0TEUoX6",
        role_id: 1,
        created_at: new Date("2025-11-28T19:58:52.516Z"),
      },
      {
        id: 3,
        name: "CJ",
        email: "cj@ptpom.com",
        password_hash:
          "2$2b$10$k5tDpjp1pR9FqjvGfP3FSe1oZPZJH0Bptn1e3J8pYcVJqf0TEUoX62",
        role_id: 2,
        created_at: new Date("2025-11-28T19:58:52.516Z"),
      },
      {
        id: 4,
        name: "Rafdi Rafizan",
        email: "rafdyfarizan@gmail.com",
        password_hash:
          "2$2b$10$k5tDpjp1pR9FqjvGfP3FSe1oZPZJH0Bptn1e3J8pYcVJqf0TEUoX62",
        role_id: 1,
        created_at: new Date("2025-12-02T00:00:00.000Z"),
      },
      {
        id: 5,
        name: "Rezaly",
        email: "rezaly@hexadaya.id",
        password_hash:
          "2$2b$10$k5tDpjp1pR9FqjvGfP3FSe1oZPZJH0Bptn1e3J8pYcVJqf0TEUoX64",
        role_id: 1,
        created_at: new Date("2025-12-02T00:00:00.000Z"),
      },
      {
        id: 7,
        name: "Muhar Sales",
        email: "muharferdiansyah@gmail.com",
        password_hash: "",
        role_id: 2,
        created_at: new Date("2025-12-31T15:50:53.179Z"),
      },
    ],
    skipDuplicates: true,
  });
  console.log("Users seeded:", users);

  // Seed products
  const products = await prisma.products.createMany({
    data: [
      {
        product_code: "SCH-001",
        item_group: "IDMST",
        name: "MCB Schneider 2P 20A - Acti9 iC60N",
        unit: "pcs",
        part_number: "23232323",
        description: "MCB Schneider 2 Pole 20A Acti9 iC60N",
        price: 185000,
        stock: 100,
        brand: "Schneider",
        rack: "R-A1",
      },
      {
        product_code: "SCH-002",
        item_group: "IDMST",
        name: "MCB Schneider 1P 16A",
        unit: "pcs",
        part_number: "23232324",
        description: "MCB Schneider 1 Pole 16A",
        price: 95000,
        stock: 80,
        brand: "Schneider",
        rack: "R-A1",
      },
      {
        product_code: "SCH-003",
        item_group: "IDMST",
        name: "MCB Schneider 3P 32A",
        unit: "pcs",
        part_number: "23232325",
        description: "MCB Schneider 3 Pole 32A",
        price: 325000,
        stock: 60,
        brand: "Schneider",
        rack: "R-A2",
      },
      {
        product_code: "ABB-001",
        item_group: "IDMST",
        name: "MCB ABB 1P 10A",
        unit: "pcs",
        part_number: "23232326",
        description: "MCB ABB 1 Pole 10A",
        price: 85000,
        stock: 120,
        brand: "ABB",
        rack: "R-B1",
      },
      {
        product_code: "ABB-002",
        item_group: "IDMST",
        name: "MCB ABB 2P 25A",
        unit: "pcs",
        part_number: "23232327",
        description: "MCB ABB 2 Pole 25A",
        price: 165000,
        stock: 70,
        brand: "ABB",
        rack: "R-B1",
      },
      {
        product_code: "LS-001",
        item_group: "IDMST",
        name: "MCB LS 1P 6A",
        unit: "pcs",
        part_number: "23232328",
        description: "MCB LS 1 Pole 6A",
        price: 65000,
        stock: 150,
        brand: "LS",
        rack: "R-C1",
      },
      {
        product_code: "LS-002",
        item_group: "IDMST",
        name: "MCB LS 2P 20A",
        unit: "pcs",
        part_number: "23232329",
        description: "MCB LS 2 Pole 20A",
        price: 145000,
        stock: 90,
        brand: "LS",
        rack: "R-C1",
      },
      {
        product_code: "HGR-001",
        item_group: "IDMST",
        name: "MCB Hager 1P 16A",
        unit: "pcs",
        part_number: "23232330",
        description: "MCB Hager 1 Pole 16A",
        price: 90000,
        stock: 110,
        brand: "Hager",
        rack: "R-D1",
      },
      {
        product_code: "HGR-002",
        item_group: "IDMST",
        name: "MCB Hager 2P 32A",
        unit: "pcs",
        part_number: "23232331",
        description: "MCB Hager 2 Pole 32A",
        price: 210000,
        stock: 50,
        brand: "Hager",
        rack: "R-D1",
      },
      {
        product_code: "PANA-001",
        item_group: "IDMST",
        name: "MCB Panasonic 1P 20A",
        unit: "pcs",
        part_number: "23232332",
        description: "MCB Panasonic 1 Pole 20A",
        price: 88000,
        stock: 130,
        brand: "Panasonic",
        rack: "R-E1",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Products seeded:", products);

  // Seed company levels
  const companyLevels = await prisma.company_level.createMany({
    data: [
      { id_level: 1, level_name: "Platinum", disc1: 10, disc2: 5 },
      { id_level: 2, level_name: "Gold", disc1: 7.5, disc2: 3 },
      { id_level: 3, level_name: "Silver", disc1: 5, disc2: 2 },
      { id_level: 4, level_name: "Bronze", disc1: 2.5, disc2: 1 },
    ],
    skipDuplicates: true,
  });
  console.log("Company levels seeded:", companyLevels);

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
