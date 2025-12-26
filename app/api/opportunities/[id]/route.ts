// filepath: app/api/opportunities/[id]/route.ts
import { NextResponse } from "next/server";
import { updateOpportunityAction } from "@/app/actions/opportunities";
import type { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = await context;
  const id = Number(params.id);
  const data = await req.json();
  const updated = await updateOpportunityAction(id, data);
  return NextResponse.json(updated);
}
