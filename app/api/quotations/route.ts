import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";

// GET: Ambil semua quotations
export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quotations = await prisma.quotations.findMany({
      orderBy: { created_at: "desc" },
    });
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
    const quotation = await prisma.quotations.create({ data });
    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error("Quotation creation error:", error);
    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 400 }
    );
  }
}
