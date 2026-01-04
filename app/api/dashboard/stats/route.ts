import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get total counts
    const [totalLeads, totalQuotations, totalSalesOrders] = await Promise.all([
      prisma.leads.count(),
      prisma.quotations.count(),
      prisma.sales_orders.count(),
    ]);

    // Get quotations by status
    const quotationsByStatus = await prisma.quotations.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const quotationsStatusMap = {
      draft: 0,
      sq_submitted: 0,
      sq_approved: 0,
      sq_rejected: 0,
      converted: 0,
    };

    quotationsByStatus.forEach((item) => {
      const status = (item.status || "draft").toLowerCase();
      if (status in quotationsStatusMap) {
        quotationsStatusMap[status as keyof typeof quotationsStatusMap] =
          item._count.id;
      }
    });

    // Get sales orders by status
    const salesOrdersByStatus = await prisma.sales_orders.groupBy({
      by: ["sale_status"],
      _count: {
        id: true,
      },
    });

    const salesOrdersStatusMap = {
      draft: 0,
      open: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    };

    salesOrdersByStatus.forEach((item) => {
      const status = (item.sale_status || "open").toLowerCase();
      if (status in salesOrdersStatusMap) {
        salesOrdersStatusMap[status as keyof typeof salesOrdersStatusMap] =
          Number(item._count.id);
      }
    });

    // Get leads by status
    const leadsByStatus = await prisma.leads.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const leadsStatusMap = {
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      unqualified: 0,
      prospecting: 0,
    };

    leadsByStatus.forEach((item) => {
      const status = (item.status || "new").toLowerCase();
      if (status in leadsStatusMap) {
        leadsStatusMap[status as keyof typeof leadsStatusMap] = item._count.id;
      }
    });

    return NextResponse.json({
      totalLeads,
      totalQuotations,
      totalSalesOrders,
      quotationsByStatus: quotationsStatusMap,
      salesOrdersByStatus: salesOrdersStatusMap,
      leadsByStatus: leadsStatusMap,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
