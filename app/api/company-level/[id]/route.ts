import { NextResponse } from "next/server";
import {
  getCompanyLevelByIdDb,
  updateCompanyLevelDb,
  deleteCompanyLevelDb,
} from "@/data/company-level";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const level = await getCompanyLevelByIdDb(Number(params.id));
    if (!level) {
      return NextResponse.json(
        { error: "Company level not found" },
        { status: 404 }
      );
    }
    // Konversi Decimal ke number
    return NextResponse.json({
      ...level,
      disc1: level.disc1 != null ? Number(level.disc1) : undefined,
      disc2: level.disc2 != null ? Number(level.disc2) : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Company level not found" },
      { status: 404 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const level = await updateCompanyLevelDb(Number(params.id), body);
    // Konversi Decimal ke number sebelum return
    return NextResponse.json({
      ...level,
      disc1: level.disc1 != null ? Number(level.disc1) : undefined,
      disc2: level.disc2 != null ? Number(level.disc2) : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update company level" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCompanyLevelDb(Number(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete company level" },
      { status: 400 }
    );
  }
}
