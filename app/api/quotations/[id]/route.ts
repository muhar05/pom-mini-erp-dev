import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import {
  getQuotationByIdDb,
  updateQuotationDb,
  deleteQuotationDb,
} from "@/data/quotations";
import { users } from "@/types/models";
import {
  getQuotationPermissions,
  validateQuotationChange,
} from "@/utils/quotationPermissions";

// GET: Ambil quotation by ID
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const params = await Promise.resolve(context.params);
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quotationId = Number(params.id);
    if (isNaN(quotationId)) {
      return NextResponse.json(
        { error: "Invalid quotation ID" },
        { status: 400 },
      );
    }

    const quotation = await getQuotationByIdDb(quotationId);

    // Konversi Decimal ke number
    const safeQuotation = {
      ...quotation,
      total: quotation.total ? Number(quotation.total) : 0,
      shipping: quotation.shipping ? Number(quotation.shipping) : 0,
      discount: quotation.discount ? Number(quotation.discount) : 0,
      tax: quotation.tax ? Number(quotation.tax) : 0,
      grand_total: quotation.grand_total ? Number(quotation.grand_total) : 0,
    };
    return NextResponse.json(safeQuotation);
  } catch (error) {
    console.error("Error fetching quotation:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message === "Quotation not found") {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: 500 },
    );
  }
}

// PUT: Update quotation
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const params = await Promise.resolve(context.params);
  const session = await auth();
  const user = session?.user as unknown as users;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid quotation ID" },
        { status: 400 },
      );
    }

    // Get current quotation
    const currentQuotation = await getQuotationByIdDb(id);

    // Validate permissions
    const permissions = getQuotationPermissions(user);
    if (!permissions.canEdit) {
      return NextResponse.json(
        {
          error: "Insufficient permissions to edit quotation",
        },
        { status: 403 },
      );
    }

    if (data.status) {
      const newStatus = data.status || currentQuotation.status || "sq_draft";

      const validation = validateQuotationChange(
        user,
        currentQuotation.status || "sq_draft",
        newStatus,
      );

      if (!validation.valid) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.errors,
          },
          { status: 400 },
        );
      }
    }

    const quotation = await updateQuotationDb(id, data);

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    console.error("Quotation update error:", error);
    return NextResponse.json(
      {
        error: "Failed to update quotation",
      },
      { status: 400 },
    );
  }
}

// DELETE: Hapus quotation
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const params = await Promise.resolve(context.params);
  const session = await auth();
  const user = session?.user;
  if (!user || !isSuperuser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quotationId = Number(params.id);

    if (isNaN(quotationId)) {
      return NextResponse.json(
        { error: "Invalid quotation ID" },
        { status: 400 },
      );
    }

    // Directly try to delete - Prisma will throw P2025 if not found
    await deleteQuotationDb(quotationId);

    return NextResponse.json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    console.error("Quotation deletion error:", error);

    // Handle specific Prisma error codes
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete quotation" },
      { status: 500 },
    );
  }
}
