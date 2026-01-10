// filepath: app/api/opportunities/[id]/route.ts
import { NextResponse } from "next/server";
import {
  updateOpportunityAction,
  deleteOpportunityAction,
} from "@/app/actions/opportunities";
import type { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const params = await context.params;
  const id = Number(params.id);
  const data = await req.json();
  const updated = await updateOpportunityAction(id, data);
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const params = await context.params;
  const id = Number(params.id);
  const deleted = await deleteOpportunityAction(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deleted);
}
