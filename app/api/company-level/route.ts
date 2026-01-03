import { NextResponse } from "next/server";
import {
  getAllCompanyLevelsDb,
  createCompanyLevelDb,
} from "@/data/company-level";

export async function GET() {
  try {
    const levels = await getAllCompanyLevelsDb();
    return NextResponse.json(levels);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch company levels" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const level = await createCompanyLevelDb(body);
    return NextResponse.json(level, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create company level" },
      { status: 400 }
    );
  }
}
