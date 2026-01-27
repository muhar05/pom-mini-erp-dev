import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isSuperuser, isManagerSales, isSales } from "@/utils/leadHelpers";
import { SQ_STATUSES, SO_STATUSES, OPPORTUNITY_STATUSES, formatStatusDisplay } from "@/utils/statusHelpers";

function parseDate(dateStr?: string) {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;
  return d;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const start = parseDate(searchParams.get("start") || undefined);
    const end = parseDate(searchParams.get("end") || undefined);
    const yearStr = searchParams.get("year");
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

    let userIdStr = searchParams.get("user_id");
    let targetUserId: number | undefined = undefined;

    // Force Sales to only see their own data
    if (isSales(user)) {
      targetUserId = Number(user.id);
    } else if (userIdStr && userIdStr !== "all") {
      targetUserId = Number(userIdStr);
    }

    // --- Basic Where Clauses ---
    const dateFilter: any = {};
    if (start) dateFilter.gte = start;
    if (end) dateFilter.lte = end;

    const wrappedDateFilter = Object.keys(dateFilter).length > 0 ? { created_at: dateFilter } : {};

    const buildWhere = (idField: string = "user_id") => {
      const w: any = {};
      if (targetUserId) w[idField] = targetUserId;
      if (Object.keys(dateFilter).length > 0) w.created_at = dateFilter;
      return w;
    };

    const leadWhere = buildWhere("id_user");
    const quotationWhere = buildWhere("user_id");
    const soWhere = buildWhere("user_id");

    // --- LEADS ---
    const leadsRaw = await prisma.leads.findMany({
      where: leadWhere,
      select: { status: true, source: true, potential_value: true },
    });

    const totalLeads = leadsRaw.length;
    const leadsByStatus = Array.from(
      leadsRaw.reduce((acc, curr) => {
        const s = curr.status || "UNKNOWN";
        acc.set(s, (acc.get(s) || 0) + 1);
        return acc;
      }, new Map<string, number>())
    ).map(([status, count]) => ({ status, count }));

    const leadSourceData = Array.from(
      leadsRaw.reduce((acc, curr) => {
        const s = curr.source || "Unknown";
        acc.set(s, (acc.get(s) || 0) + 1);
        return acc;
      }, new Map<string, number>())
    ).map(([source, count]) => ({ source, count }));

    // --- OPPORTUNITIES ---
    // Defined as leads with status "opp_prospecting", "opp_qualified", "opp_sq", "opp_lost", or "lead_qualified"
    const oppsRaw = leadsRaw.filter(l =>
      l.status === OPPORTUNITY_STATUSES.PROSPECTING ||
      l.status === OPPORTUNITY_STATUSES.QUALIFIED ||
      l.status === OPPORTUNITY_STATUSES.SQ ||
      l.status === OPPORTUNITY_STATUSES.LOST ||
      l.status === "lead_qualified"
    );
    const totalOppQty = oppsRaw.length;
    const totalOppRp = oppsRaw.reduce((sum, curr) => sum + Number(curr.potential_value || 0), 0);

    const oppsByStatus = Array.from(
      oppsRaw.reduce((acc, curr) => {
        const s = curr.status || "UNKNOWN";
        const val = acc.get(s) || { count: 0, rp: 0 };
        acc.set(s, { count: val.count + 1, rp: val.rp + Number(curr.potential_value || 0) });
        return acc;
      }, new Map<string, { count: number, rp: number }>())
    ).map(([status, data]) => ({ status, ...data }));

    // --- QUOTATIONS ---
    const quotationsRaw = await prisma.quotations.findMany({
      where: quotationWhere,
      select: { status: true, grand_total: true, note: true },
    });

    const totalSqQty = quotationsRaw.length;
    const totalSqRp = quotationsRaw.reduce((sum, curr) => sum + Number(curr.grand_total || 0), 0);

    const sqByStatus = Array.from(
      quotationsRaw.reduce((acc, curr) => {
        const s = curr.status || "UNKNOWN";
        const val = acc.get(s) || { count: 0, rp: 0 };
        acc.set(s, { count: val.count + 1, rp: val.rp + Number(curr.grand_total || 0) });
        return acc;
      }, new Map<string, { count: number, rp: number }>())
    ).map(([status, data]) => ({ status, ...data }));

    const sqWaitingApproval = quotationsRaw.filter(q =>
      q.status === SQ_STATUSES.DRAFT || q.status === SQ_STATUSES.REVISED || q.status === SQ_STATUSES.WAITING_APPROVAL
    );
    const sqApproved = quotationsRaw.filter(q => q.status === SQ_STATUSES.APPROVED || q.status === SQ_STATUSES.SENT);

    // Lost Reason Pie Chart
    const lostSqRaw = quotationsRaw.filter(q => q.status === SQ_STATUSES.LOST);
    const lostReasonData = Array.from(
      lostSqRaw.reduce((acc, curr) => {
        const r = curr.note || "No reason given"; // Note usually contains the reason for lost
        acc.set(r, (acc.get(r) || 0) + 1);
        return acc;
      }, new Map<string, number>())
    ).map(([reason, count]) => ({ reason, count }));

    // --- SALES ORDERS (SO WON) ---
    const soRaw = await prisma.sales_orders.findMany({
      where: {
        ...soWhere,
        status: { not: SO_STATUSES.CANCELLED },
      },
      select: { grand_total: true, created_at: true },
    });

    const totalSoWonQty = soRaw.length;
    const totalSoWonRp = soRaw.reduce((sum, curr) => sum + Number(curr.grand_total || 0), 0);
    const winrate = totalSqQty > 0 ? (totalSoWonQty / totalSqQty) * 100 : 0;

    // --- CHARTS ---
    // Pipeline: SQ Status counts
    const pipelineData = Object.values(SQ_STATUSES).map(status => ({
      status: formatStatusDisplay(status),
      count: quotationsRaw.filter(q => q.status === status).length,
    })).filter(d => d.count > 0);

    // Funnel: Lead -> Opp -> SQ -> SO
    const funnelData = [
      { stage: "Lead", count: totalLeads },
      { stage: "Opportunity", count: totalOppQty },
      { stage: "Quotation", count: totalSqQty },
      { stage: "Sales Order", count: totalSoWonQty },
    ];

    // Revenue Chart (Monthly) - Filtered by Year
    const revenueWhere = { ...soWhere, created_at: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`), not: undefined } };
    const monthlyRaw = await prisma.sales_orders.groupBy({
      by: ["created_at"],
      where: {
        ...revenueWhere,
        status: { not: SO_STATUSES.CANCELLED },
      },
      _sum: { grand_total: true },
      _count: { id: true },
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = new Map<number, { qty: number, rp: number }>();
    for (let i = 0; i < 12; i++) monthlyMap.set(i, { qty: 0, rp: 0 });

    for (const row of monthlyRaw) {
      if (!row.created_at) continue;
      const m = new Date(row.created_at).getMonth();
      const val = monthlyMap.get(m)!;
      monthlyMap.set(m, {
        qty: val.qty + (row._count.id || 0),
        rp: val.rp + Number(row._sum.grand_total || 0)
      });
    }

    const revenueChartData = Array.from(monthlyMap.entries()).map(([idx, data]) => ({
      month: monthNames[idx],
      ...data
    }));

    // --- ACTIVITY USER ---
    const activityWhere: any = {};
    if (isSales(user)) {
      activityWhere.user_id = Number(user.id);
    } else if (targetUserId) {
      activityWhere.user_id = targetUserId;
    }

    const logsRaw = await prisma.user_logs.findMany({
      where: activityWhere,
      take: 20,
      orderBy: { created_at: "desc" },
      include: { users: { select: { name: true } } }
    });

    const activities = logsRaw.map(log => ({
      id: log.id.toString(),
      user: log.users.name,
      action: log.activity,
      date: log.created_at,
    }));

    // --- SALES PERFORMANCE (MANAGER ONLY) ---
    let salesPerformance: any[] = [];
    if (isSuperuser(user) || isManagerSales(user)) {
      const salesUsers = await prisma.users.findMany({
        where: { role_id: 2 },
        select: { id: true, name: true },
      });

      salesPerformance = await Promise.all(
        salesUsers.map(async (s) => {
          const sId = Number(s.id);
          const [lCount, oRaw, qRaw, soStats] = await Promise.all([
            prisma.leads.count({ where: { ...wrappedDateFilter, OR: [{ id_user: sId }, { assigned_to: sId }] } }),
            prisma.leads.findMany({
              where: { ...wrappedDateFilter, OR: [{ id_user: sId }, { assigned_to: sId }], status: { in: [OPPORTUNITY_STATUSES.PROSPECTING, OPPORTUNITY_STATUSES.QUALIFIED, OPPORTUNITY_STATUSES.SQ, OPPORTUNITY_STATUSES.LOST, "lead_qualified"] } },
              select: { potential_value: true }
            }),
            prisma.quotations.findMany({
              where: { ...wrappedDateFilter, user_id: sId },
              select: { grand_total: true }
            }),
            prisma.sales_orders.aggregate({
              where: { ...wrappedDateFilter, user_id: sId, status: { not: SO_STATUSES.CANCELLED } },
              _count: { id: true },
              _sum: { grand_total: true },
            }),
          ]);

          const oQty = oRaw.length;
          const oRp = oRaw.reduce((sum, curr) => sum + Number(curr.potential_value || 0), 0);
          const qQty = qRaw.length;
          const qRp = qRaw.reduce((sum, curr) => sum + Number(curr.grand_total || 0), 0);
          const soQty = soStats._count.id;
          const soRp = Number(soStats._sum.grand_total || 0);

          return {
            sales_name: s.name,
            leads_qty: lCount,
            opp_qty: oQty,
            opp_rp: oRp,
            sq_qty: qQty,
            sq_rp: qRp,
            so_qty: soQty,
            so_rp: soRp,
            winrate: qQty > 0 ? (soQty / qQty) * 100 : 0
          };
        })
      );
      salesPerformance.sort((a, b) => b.so_rp - a.so_rp);
    }

    return NextResponse.json({
      summary: {
        leads: { qty: totalLeads, byStatus: leadsByStatus },
        opportunities: { qty: totalOppQty, rp: totalOppRp, byStatus: oppsByStatus },
        quotations: {
          qty: totalSqQty,
          rp: totalSqRp,
          waitingApproval: { qty: sqWaitingApproval.length, rp: sqWaitingApproval.reduce((s, c) => s + Number(c.grand_total || 0), 0) },
          approved: { qty: sqApproved.length, rp: sqApproved.reduce((s, c) => s + Number(c.grand_total || 0), 0) },
          byStatus: sqByStatus
        },
        salesOrders: { qty: totalSoWonQty, rp: totalSoWonRp, winrate }
      },
      charts: {
        pipeline: pipelineData,
        funnel: funnelData,
        leadSource: leadSourceData,
        lostReason: lostReasonData,
        revenue: revenueChartData
      },
      activities,
      salesPerformance
    });

  } catch (error) {
    console.error("Dashboard sales API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard sales data" }, { status: 500 });
  }
}


