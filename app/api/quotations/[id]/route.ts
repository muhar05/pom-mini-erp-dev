import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";

// GET: Ambil quotation by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quotation = await prisma.quotations.findUnique({
      where: { id: Number(params.id) },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(quotation);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}

// PUT: Update quotation
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const quotation = await prisma.quotations.update({
      where: { id: Number(params.id) },
      data,
    });

    return NextResponse.json(quotation);
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
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user;
  if (!user || !isSuperuser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.quotations.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Quotation deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete quotation" },
      { status: 400 }
    );
  }
}
