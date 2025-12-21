import { NextResponse } from "next/server";
import {
  getCompanyByIdDb,
  updateCompanyDb,
  deleteCompanyDb,
} from "@/data/companies";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const company = await getCompanyByIdDb(Number(params.id));
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const company = await updateCompanyDb(Number(params.id), body);
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCompanyDb(Number(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 400 }
    );
  }
}
