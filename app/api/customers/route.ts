import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import {
  getAllCustomersDb,
  createCustomerDb,
  getCustomerByEmailDb,
} from "@/data/customers";

// GET: Ambil semua customers
export async function GET(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const unassigned = url.searchParams.get("unassigned");
  try {
    let customers = await getAllCustomersDb();
    if (unassigned) {
      customers = customers.filter((c) => !c.company_id);
    }
    // Return only id, customer_name, email for select
    if (unassigned) {
      return NextResponse.json(
        customers.map((c) => ({
          id: c.id,
          customer_name: c.customer_name,
          email: c.email,
        }))
      );
    }
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
