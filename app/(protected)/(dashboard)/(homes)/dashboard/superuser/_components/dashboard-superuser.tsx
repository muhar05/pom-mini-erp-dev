'use client';

import CrmStatCard from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/crm-stat-card";
import QuotationStatusChart from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/quotation-status-chart";
import SalesOrderStatusChart from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/sales-order-status-chart";
import LeadSourceChart from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/lead-source-chart";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import { Suspense } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { useDashboardSales } from "@/hooks/dashboard/useDashboardSales";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import StatCard from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/stat-card";
import { Wallet, FileText, Medal, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardSuperuser() {
  const { t } = useI18n();
  const { data: salesData, loading: salesLoading } = useDashboardSales();
  const { data: statsData } = useDashboardStats();

  const businessStats = [
    {
      title: t("page.dashboard.revenue"),
      value: salesData ? `Rp ${salesData.summary.salesOrders.rp.toLocaleString("id-ID")}` : "-",
      icon: Wallet,
      iconBg: "bg-emerald-600",
      gradientFrom: "from-emerald-600/10",
    },
    {
      title: t("page.dashboard.stat_sales"),
      value: salesData ? salesData.summary.salesOrders.qty : "-",
      icon: FileText,
      iconBg: "bg-blue-600",
      gradientFrom: "from-blue-600/10",
    },
    {
      title: t("page.dashboard.stat_quotations"),
      value: salesData ? salesData.summary.quotations.qty : "-",
      icon: Medal,
      iconBg: "bg-amber-500",
      gradientFrom: "from-amber-600/10",
    },
  ];
  return (
    <>
      <DashboardBreadcrumb title={t("page.dashboard.superuser_title")} text={t("sidebar.dashboard")} />

      {/* High Level Business Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard data={businessStats} />
      </div>

      {/* Detailed CRM Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 mb-6">
        <Suspense
          fallback={<LoadingSkeleton height="h-28" text={t("common.loading")} />}
        >
          <CrmStatCard />
        </Suspense>
      </div>

      {/* Charts Row - 3 Columns Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Suspense
          fallback={<LoadingSkeleton height="h-80" text={t("common.loading")} />}
        >
          <QuotationStatusChart />
        </Suspense>

        <Suspense
          fallback={<LoadingSkeleton height="h-80" text={t("common.loading")} />}
        >
          <SalesOrderStatusChart />
        </Suspense>

        <Suspense
          fallback={<LoadingSkeleton height="h-80" text={t("common.loading")} />}
        >
          <LeadSourceChart />
        </Suspense>
      </div>

      {/* Operational Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-none shadow-sm h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {t("common.recent_activity") || "Recent Operations"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Operation</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!statsData?.recentLogs || statsData.recentLogs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      No recent activities found
                    </TableCell>
                  </TableRow>
                )}
                {statsData?.recentLogs?.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{log.activity}</TableCell>
                    <TableCell>{log.user_name}</TableCell>
                    <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-8 text-muted-foreground italic text-sm">
              Waiting for system health monitor...
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
