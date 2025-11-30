import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua leads
export async function GET() {
  try {
    const leads = await prisma.leads.findMany({
      include: {
        users_leads_assigned_toTousers: true,
        users_leads_id_userTousers: true,
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST: Tambah lead baru
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const lead = await prisma.leads.create({ data });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 400 }
    );
  }
}
