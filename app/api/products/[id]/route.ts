import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";

// GET: Ambil product by ID
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
    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT: Update product
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
    const oldProduct = await prisma.products.findUnique({ where: { id } });
    if (!oldProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = await req.json();

    // Validasi product_code unique jika diubah
    if (data.product_code && data.product_code !== oldProduct.product_code) {
      const existingProduct = await prisma.products.findUnique({
        where: { product_code: data.product_code },
      });

      if (existingProduct) {
        return NextResponse.json(
          { error: "Product code already exists" },
          { status: 400 }
        );
      }
    }

    const product = await prisma.products.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 400 }
    );
  }
}

// DELETE: Hapus product
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
    const oldProduct = await prisma.products.findUnique({ where: { id } });
    if (!oldProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.products.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 400 }
    );
  }
}
