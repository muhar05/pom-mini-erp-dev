import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const lead = await prisma.leads.update({
      where: { id: Number(params.id) },
      data,
    });
    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.leads.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 400 }
    );
  }
}
