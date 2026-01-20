import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseDate(dateStr?: string) {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;
  return d;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const start = parseDate(searchParams.get("start") || undefined);
    const end = parseDate(searchParams.get("end") || undefined);

    // Build where clause for sales_orders
    const salesOrderWhere: any = {
      status: { not: "CANCELLED" },
    };
    if (start || end) {
      salesOrderWhere.created_at = {};
      if (start) salesOrderWhere.created_at.gte = start;
      if (end) salesOrderWhere.created_at.lte = end;
    }

    // Build where clause for quotations
    const quotationWhere: any = {};
    if (start || end) {
      quotationWhere.created_at = {};
      if (start) quotationWhere.created_at.gte = start;
      if (end) quotationWhere.created_at.lte = end;
    }

    // Aggregate total revenue
    const totalRevenueResult = await prisma.sales_orders.aggregate({
      _sum: { grand_total: true },
      where: salesOrderWhere,
    });

    // Count total orders
    const totalOrder = await prisma.sales_orders.count({
      where: salesOrderWhere,
    });

    // Count total quotations
    const totalQuotation = await prisma.quotations.count({
      where: quotationWhere,
    });

    // Monthly revenue
    const monthlyRaw = await prisma.sales_orders.groupBy({
      by: ["created_at"],
      where: salesOrderWhere,
      _sum: { grand_total: true },
    });

    // Format monthly revenue: group by month
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyMap: Record<string, number> = {};
    for (const row of monthlyRaw) {
      const date = new Date(row.created_at as Date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyMap[key] =
        (monthlyMap[key] || 0) + Number(row._sum.grand_total || 0);
    }
    const monthlyRevenue = Object.entries(monthlyMap).map(([key, total]) => {
      const [year, monthIdx] = key.split("-");
      return {
        month: `${monthNames[Number(monthIdx)]} ${year}`,
        total,
      };
    });

    // Order status
    const orderStatusRaw = await prisma.sales_orders.groupBy({
      by: ["sale_status"],
      where: salesOrderWhere,
      _count: { sale_status: true },
    });
    const orderStatus = orderStatusRaw.map((row) => ({
      status: row.sale_status || "UNKNOWN",
      total: row._count.sale_status,
    }));

    return NextResponse.json(
      {
        totalRevenue: Number(totalRevenueResult._sum.grand_total || 0),
        totalOrder,
        totalQuotation,
        monthlyRevenue,
        orderStatus,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Dashboard manager sales API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard manager sales data" },
      { status: 500 },
    );
  }
}
