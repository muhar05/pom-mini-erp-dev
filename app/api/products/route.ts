import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import {
  getAllProductsDb,
  createProductDb,
  getProductByCodeDb,
} from "@/data/products";

// GET: Ambil semua products
export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const products = await getAllProductsDb();
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

    const product = await createProductDb(data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 400 }
    );
  }
}
