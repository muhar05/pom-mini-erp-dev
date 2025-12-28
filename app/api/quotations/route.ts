import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import { getAllQuotationsDb, createQuotationDb } from "@/data/quotations";

// GET: Ambil semua quotations
export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quotations = await getAllQuotationsDb();
    return NextResponse.json(quotations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}

// POST: Tambah quotation baru
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    // Tampilkan data ke terminal
    console.log("DATA DITERIMA DARI FRONTEND:", data);

    // Simpan ke database lewat data layer
    const quotation = await createQuotationDb(data);

    return NextResponse.json({
      success: true,
      message: "Quotation created successfully",
      data: quotation,
    });
  } catch (error) {
    console.error("Quotation creation error:", error);
    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 400 }
    );
  }
}
