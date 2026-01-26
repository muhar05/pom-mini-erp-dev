import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSuperuser, isManagerSales, isSales } from "@/utils/leadHelpers";

export async function GET() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(user.id);
  const isManager = isSuperuser(user) || isManagerSales(user);

  // Define where clauses
  const leadWhere: any = !isManager && isSales(user) ? {
    OR: [
      { id_user: userId },
      { assigned_to: userId }
    ]
  } : {};

  const quotationWhere: any = !isManager && isSales(user) ? { user_id: userId } : {};
  const soWhere: any = !isManager && isSales(user) ? { user_id: userId } : {};

  try {
    // Get total counts
    const [totalLeads, totalQuotations, totalSalesOrders] = await Promise.all([
      prisma.leads.count({ where: leadWhere }),
      prisma.quotations.count({ where: quotationWhere }),
      prisma.sales_orders.count({ where: soWhere }),
    ]);

    // Get quotations by status
    const quotationsByStatus = await prisma.quotations.groupBy({
      by: ["status"],
      where: quotationWhere,
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
      where: soWhere,
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
      where: leadWhere,
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

    // Get leads by source
    const leadsBySourceGrouped = await prisma.leads.groupBy({
      by: ["source"],
      where: leadWhere,
      _count: {
        id: true,
      },
    });

    const leadsBySource: Record<string, number> = {};
    leadsBySourceGrouped.forEach((item) => {
      const source = item.source || "Others";
      leadsBySource[source] = (leadsBySource[source] || 0) + item._count.id;
    });

    // Get recent logs
    const recentLogsRaw = await prisma.user_logs.findMany({
      where: isManager ? {} : { user_id: userId },
      take: 5,
      orderBy: { created_at: "desc" },
      include: {
        users: {
          select: { name: true },
        },
      },
    });

    const recentLogs = recentLogsRaw.map((log) => ({
      id: log.id.toString(),
      activity: log.activity,
      user_name: log.users.name,
      created_at: log.created_at,
    }));

    return NextResponse.json({
      totalLeads,
      totalQuotations,
      totalSalesOrders,
      quotationsByStatus: quotationsStatusMap,
      salesOrdersByStatus: salesOrdersStatusMap,
      leadsByStatus: leadsStatusMap,
      leadsBySource,
      recentLogs,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
