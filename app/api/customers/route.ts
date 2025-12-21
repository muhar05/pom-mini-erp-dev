import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";

// GET: Ambil semua customers
export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const customers = await prisma.customers.findMany({
      include: {
        company: {
          include: {
            company_level: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST: Tambah customer baru
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Validasi email unique jika ada
    if (data.email) {
      const existingCustomer = await prisma.customers.findFirst({
        where: { email: data.email },
      });

      if (existingCustomer) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    const customer = await prisma.customers.create({ data });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Customer creation error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 400 }
    );
  }
}
