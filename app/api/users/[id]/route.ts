import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  const user = await prisma.users.update({
    where: { id: Number(params.id) },
    data,
  });
  return NextResponse.json(user);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.users.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}