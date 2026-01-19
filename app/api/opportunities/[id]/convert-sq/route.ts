import { NextResponse } from "next/server";
import { convertOpportunityToSQ } from "@/app/actions/opportunities";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(await params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  // Ambil customerId dari body - handle null dengan benar
  const body = await req.json();
  let customerId: number | null = null;

  if (
    body.customerId !== null &&
    body.customerId !== undefined &&
    body.customerId !== 0
  ) {
    const parsedId = Number(body.customerId);
    if (!isNaN(parsedId) && parsedId > 0) {
      customerId = parsedId;
    }
  }

  try {
    const quotation = await convertOpportunityToSQ(id, customerId);
    return NextResponse.json({ success: true, data: quotation });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
