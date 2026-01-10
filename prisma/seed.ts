import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed roles
  await prisma.roles.createMany({
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

  // Seed users
  await prisma.users.createMany({
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
