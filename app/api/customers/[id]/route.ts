import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";

// GET: Ambil customer by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number(params.id);
    const customer = await prisma.customers.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            company_level: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT: Update customer
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number(params.id);
    const oldCustomer = await prisma.customers.findUnique({ where: { id } });

    if (!oldCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const data = await req.json();

    // Validasi email unique jika diubah
    if (data.email && data.email !== oldCustomer.email) {
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

    const customer = await prisma.customers.update({
      where: { id },
      data,
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Customer update error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 400 }
    );
  }
}

// DELETE: Hapus customer
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user;
  if (!user || !isSuperuser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number(params.id);
    const oldCustomer = await prisma.customers.findUnique({ where: { id } });

    if (!oldCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    await prisma.customers.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Customer deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 400 }
    );
  }
}
