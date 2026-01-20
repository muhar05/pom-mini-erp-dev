import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales, isManagerSales } from "@/utils/leadHelpers";
import { getAllQuotationsDb, createQuotationDb } from "@/data/quotations";

// GET: Ambil semua quotations
export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (
    !user ||
    (!isSuperuser(user) && !isSales(user) && !isManagerSales(user))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quotations = await getAllQuotationsDb();

    // Konversi Decimal ke number
    const safeQuotations = quotations.map((q) => ({
      ...q,
      total: q.total ? Number(q.total) : 0,
      shipping: q.shipping ? Number(q.shipping) : 0,
      discount: q.discount ? Number(q.discount) : 0,
      tax: q.tax ? Number(q.tax) : 0,
      grand_total: q.grand_total ? Number(q.grand_total) : 0,
      // Jika ada nested object (misal: customer.company.disc1), konversi juga di sini
    }));

    return NextResponse.json(safeQuotations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 },
    );
  }
}

// POST: Tambah quotation baru
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (
    !user ||
    (!isSuperuser(user) && !isSales(user) && !isManagerSales(user))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const quotation = await createQuotationDb(data);

    // Konversi Decimal ke number sebelum dikirim ke client
    const safeQuotation = {
      ...quotation,
      total: quotation.total ? Number(quotation.total) : 0,
      shipping: quotation.shipping ? Number(quotation.shipping) : 0,
      discount: quotation.discount ? Number(quotation.discount) : 0,
      tax: quotation.tax ? Number(quotation.tax) : 0,
      grand_total: quotation.grand_total ? Number(quotation.grand_total) : 0,
    };

    return NextResponse.json({
      success: true,
      message: "Quotation created successfully",
      data: safeQuotation,
    });
  } catch (error) {
    console.error("Quotation creation error:", error);
    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 400 },
    );
  }
}
