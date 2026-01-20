import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales, isManagerSales } from "@/utils/leadHelpers";
import { getAllLeadsDb, createLeadDb } from "@/data/leads";

// GET: Ambil semua leads
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
    const leads = await getAllLeadsDb(user);
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 },
    );
  }
}

// POST: Tambah lead baru
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
    data.id_user = Number(user.id);
    data.status = "New";
    const lead = await createLeadDb(data);
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 400 },
    );
  }
}
