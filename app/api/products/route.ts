import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";

// GET: Ambil semua products
export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const products = await prisma.products.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: Tambah product baru
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await req.json();

    // Validasi product_code unique
    const existingProduct = await prisma.products.findUnique({
      where: { product_code: data.product_code },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product code already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.products.create({ data });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 400 }
    );
  }
}
