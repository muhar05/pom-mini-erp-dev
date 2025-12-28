import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import {
  getProductByIdDb,
  updateProductDb,
  deleteProductDb,
  getProductByCodeDb,
} from "@/data/products";

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
    const product = await getProductByIdDb(id);
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
    const oldProduct = await getProductByIdDb(id);

    const data = await req.json();

    // Validasi product_code unique jika diubah
    if (data.product_code && data.product_code !== oldProduct.product_code) {
      let existingProduct;
      try {
        existingProduct = await getProductByCodeDb(data.product_code);
      } catch {
        existingProduct = null;
      }
      if (existingProduct) {
        return NextResponse.json(
          { error: "Product code already exists" },
          { status: 400 }
        );
      }
    }

    const product = await updateProductDb(id, {
      ...data,
      updated_at: new Date(),
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
    await deleteProductDb(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 400 }
    );
  }
}
