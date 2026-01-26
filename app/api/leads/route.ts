import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales, isManagerSales } from "@/utils/leadHelpers";
import { getAllLeadsDb, createLeadDb } from "@/data/leads";

// GET: Ambil semua leads
export async function GET(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (
    !user ||
    (!isSuperuser(user) && !isSales(user) && !isManagerSales(user))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = {
    search: searchParams.get("search") || undefined,
    status: searchParams.get("status") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    prefix: searchParams.get("prefix") || undefined,
  };

  try {
    const leads = await getAllLeadsDb(user, filters);
    return NextResponse.json(leads);
  } catch (error) {
    console.error("GET /api/leads Error:", error);
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
