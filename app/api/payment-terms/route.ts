import { NextRequest, NextResponse } from "next/server";
import {
  createPaymentTermAction,
  getAllPaymentTermsAction,
} from "@/app/actions/payment-terms";

// GET ALL
export async function GET() {
  const result = await getAllPaymentTermsAction();
  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 500 });
  }
  return NextResponse.json(result.data);
}

// CREATE
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createPaymentTermAction(body);
    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid request or server error" },
      { status: 500 },
    );
  }
}
