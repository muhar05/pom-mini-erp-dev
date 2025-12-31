import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import {
  getQuotationByIdDb,
  updateQuotationDb,
  deleteQuotationDb,
} from "@/data/quotations";

// GET: Ambil quotation by ID
export async function GET(req: Request, context: { params: { id: string } }) {
  const { params } = context;
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quotation = await getQuotationByIdDb(Number(params.id));
    // Konversi Decimal ke number
    const safeQuotation = {
      ...quotation,
      total: quotation.total ? Number(quotation.total) : 0,
      shipping: quotation.shipping ? Number(quotation.shipping) : 0,
      discount: quotation.discount ? Number(quotation.discount) : 0,
      tax: quotation.tax ? Number(quotation.tax) : 0,
      grand_total: quotation.grand_total ? Number(quotation.grand_total) : 0,
    };
    return NextResponse.json(safeQuotation);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}

// PUT: Update quotation
export async function PUT(req: Request, context: { params: { id: string } }) {
  const { params } = context;
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const quotation = await updateQuotationDb(Number(params.id), data);
    // Konversi Decimal ke number
    const safeQuotation = {
      ...quotation,
      total: quotation.total ? Number(quotation.total) : 0,
      shipping: quotation.shipping ? Number(quotation.shipping) : 0,
      discount: quotation.discount ? Number(quotation.discount) : 0,
      tax: quotation.tax ? Number(quotation.tax) : 0,
      grand_total: quotation.grand_total ? Number(quotation.grand_total) : 0,
    };
    return NextResponse.json(safeQuotation);
  } catch (error) {
    console.error("Quotation update error:", error);
    return NextResponse.json(
      { error: "Failed to update quotation" },
      { status: 400 }
    );
  }
}

// DELETE: Hapus quotation
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const session = await auth();
  const user = session?.user;
  if (!user || !isSuperuser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Cek apakah quotation ada
    const quotation = await getQuotationByIdDb(Number(params.id));
    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }
    await deleteQuotationDb(Number(params.id));
    return NextResponse.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Quotation deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete quotation" },
      { status: 400 }
    );
  }
}
