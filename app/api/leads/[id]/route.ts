import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import { getLeadByIdDb, updateLeadDb, deleteLeadDb } from "@/data/leads";

// PUT: Update lead
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const id = Number(params.id);
    const oldLead = await getLeadByIdDb(id);
    if (!oldLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (isSales(user) && oldLead.id_user !== Number(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await req.json();

    // Validasi status transition (hanya untuk sales)
    if (isSales(user) && data.status && data.status !== oldLead.status) {
      if (["Converted", "Invalid", "Unqualified"].includes(data.status)) {
        return NextResponse.json(
          { error: "Unauthorized status change." },
          { status: 403 }
        );
      }
      if (oldLead.status === "New" && data.status === "Converted") {
        return NextResponse.json(
          { error: "Invalid status transition" },
          { status: 403 }
        );
      }
      const allowedTransitions: Record<string, string[]> = {
        New: ["Contacted"],
        Contacted: ["Qualified", "Nurturing", "Unqualified", "Invalid"],
        Qualified: ["Converted"],
        Nurturing: [],
        Unqualified: [],
        Invalid: [],
        Converted: [],
      };
      if (
        oldLead.status &&
        (!allowedTransitions[oldLead.status] ||
          !allowedTransitions[oldLead.status].includes(data.status))
      ) {
        return NextResponse.json(
          { error: "Invalid status transition" },
          { status: 403 }
        );
      }
    }

    const lead = await updateLeadDb(id, data);
    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 400 }
    );
  }
}

// DELETE: Hapus lead
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const id = Number(params.id);
    const oldLead = await getLeadByIdDb(id);
    if (!oldLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (isSales(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await deleteLeadDb(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 400 }
    );
  }
}
