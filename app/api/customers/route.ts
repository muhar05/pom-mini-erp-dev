import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import {
  getAllCustomersDb,
  createCustomerDb,
  getCustomerByEmailDb,
} from "@/data/customers";

// GET: Ambil semua customers
export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const customers = await getAllCustomersDb();
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST: Tambah customer baru
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Validasi email unique jika ada
    if (data.email) {
      let existingCustomer;
      try {
        existingCustomer = await getCustomerByEmailDb(data.email);
      } catch {
        existingCustomer = null;
      }

      if (existingCustomer) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    const customer = await createCustomerDb(data);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Customer creation error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 400 }
    );
  }
}
