import { NextResponse } from "next/server";
import { getAllCompaniesDb, createCompanyDb } from "@/data/companies";

export async function GET() {
  try {
    const companies = await getAllCompaniesDb();
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const company = await createCompanyDb(body);
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 400 }
    );
  }
}
