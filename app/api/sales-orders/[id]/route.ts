import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  isSuperuser,
  isSales,
  isManagerSales,
  isPurchasing,
  isManagerPurchasing,
  isWarehouse,
  isManagerWarehouse,
  isFinance,
  isManagerFinance
} from "@/utils/userHelpers";
import {
  getSalesOrderByIdDb,
  updateSalesOrderDb,
  deleteSalesOrderDb,
} from "@/data/sales-orders";

// GET: Ambil sales order by ID
export async function GET(req: Request, context: { params: { id: string } }) {
  const { params } = context;
  const session = await auth();
  const user = session?.user;

  const hasAccess = user && (
    isSuperuser(user) ||
    isSales(user) ||
    isManagerSales(user) ||
    isPurchasing(user) ||
    isManagerPurchasing(user) ||
    isWarehouse(user) ||
    isManagerWarehouse(user) ||
    isFinance(user) ||
    isManagerFinance(user)
  );

  if (!hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const salesOrder = await getSalesOrderByIdDb(params.id);

    // Konversi BigInt dan Decimal ke format yang aman
    const safeSalesOrder = {
      ...salesOrder,
      id: salesOrder.id.toString(),
      quotation_id: salesOrder.quotation_id?.toString() || null,
      total: salesOrder.total ? Number(salesOrder.total) : 0,
      shipping: salesOrder.shipping ? Number(salesOrder.shipping) : 0,
      discount: salesOrder.discount ? Number(salesOrder.discount) : 0,
      tax: salesOrder.tax ? Number(salesOrder.tax) : 0,
      grand_total: salesOrder.grand_total ? Number(salesOrder.grand_total) : 0,
    };

    return NextResponse.json(safeSalesOrder);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sales order" },
      { status: 500 }
    );
  }
}

// PUT: Update sales order
export async function PUT(req: Request, context: { params: { id: string } }) {
  const { params } = context;
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user) && !isManagerSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const salesOrder = await updateSalesOrderDb(params.id, data);

    return NextResponse.json({
      success: true,
      data: salesOrder,
    });
  } catch (error) {
    console.error("Sales order update error:", error);
    return NextResponse.json(
      {
        error: "Failed to update sales order",
      },
      { status: 400 }
    );
  }
}

// DELETE: Hapus sales order
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user) && !isManagerSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteSalesOrderDb(params.id);

    return NextResponse.json({
      success: true,
      message: "Sales order deleted successfully",
    });
  } catch (error) {
    console.error("Sales order deletion error:", error);

    // Handle specific Prisma error codes
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Sales order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete sales order" },
      { status: 500 }
    );
  }
}
