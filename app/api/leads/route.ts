import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";

// GET: Ambil semua leads
export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const where = isSales(user) ? { id_user: Number(user.id) } : {};
    const leads = await prisma.leads.findMany({
      where,
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
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await req.json();
    data.id_user = Number(user.id);
    data.status = "New";
    const lead = await prisma.leads.create({ data });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 400 }
    );
  }
}
