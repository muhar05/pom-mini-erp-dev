import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentTermByIdAction,
  updatePaymentTermAction,
  deletePaymentTermAction,
} from "@/app/actions/payment-terms";

// GET BY ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }
  const result = await getPaymentTermByIdAction(id);
  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 404 });
  }
  return NextResponse.json(result.data);
}

// UPDATE
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const result = await updatePaymentTermAction(id, body);
    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { message: "Invalid request or server error" },
      { status: 500 },
    );
  }
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }
  const result = await deletePaymentTermAction(id);
  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
