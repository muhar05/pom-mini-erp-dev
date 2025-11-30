import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all users
export async function GET() {
  const users = await prisma.users.findMany({
    include: { roles: true },
  });
  return NextResponse.json(users);
}

// CREATE user
export async function POST(req: Request) {
  const data = await req.json();
  const user = await prisma.users.create({ data });
  return NextResponse.json(user);
}
