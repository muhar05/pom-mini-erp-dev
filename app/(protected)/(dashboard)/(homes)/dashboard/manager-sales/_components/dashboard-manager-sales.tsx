"use client";

import CrmStatCard from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/crm-stat-card";
import QuotationStatusChart from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/quotation-status-chart";
import SalesOrderStatusChart from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/sales-order-status-chart";
import LeadSourceChart from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/lead-source-chart";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useDashboardManagerSales } from "@/hooks/dashboard/useDashboardManagerSales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StatCard, {
  StatCardData,
} from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/stat-card";
import { Wallet, FileText, Medal } from "lucide-react";
import LoadingSkeleton from "@/components/loading-skeleton";
import { Suspense } from "react";
import { useI18n } from "@/contexts/i18n-context";

export default function DashboardManagerSales() {
  const { t } = useI18n();
  const { data, loading, error, refetch } = useDashboardManagerSales();

  // Siapkan data untuk StatCard
  const statCards: StatCardData[] = [
    {
      title: "Total Revenue",
      value: data ? `Rp ${data.totalRevenue.toLocaleString("id-ID")}` : "-",
      icon: Wallet,
      iconBg: "bg-green-600",
      gradientFrom: "from-green-600/10",
      description: "Total revenue dari sales order",
    },
    {
      title: "Total Orders",
      value: data ? data.totalOrder : "-",
      icon: FileText,
      iconBg: "bg-blue-600",
      gradientFrom: "from-blue-600/10",
      description: "Jumlah sales order",
    },
    {
      title: "Total Quotations",
      value: data ? data.totalQuotation : "-",
      icon: Medal,
      iconBg: "bg-yellow-600",
      gradientFrom: "from-yellow-600/10",
      description: "Jumlah quotation",
    },
  ];

  function StatCardSkeleton() {
    return (
      <div className="animate-pulse flex flex-col gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 mb-2" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  function SummarySkeleton() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <Separator className="my-4" />
          <div className="mb-4">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="flex flex-wrap gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-2 border rounded min-w-[100px] text-center"
                >
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-4" />
          <div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="flex flex-wrap gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-2 border rounded min-w-[100px] text-center"
                >
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
                  <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>{t("page.dashboard.manager_sales_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[...Array(3)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
        <SummarySkeleton />
      </>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("page.dashboard.manager_sales_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-red-500">{error}</div>
          <button onClick={refetch} className="mt-2 underline text-blue-600">
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <>
      <DashboardBreadcrumb title={t("page.dashboard.manager_sales_title")} text={t("sidebar.dashboard")} />

      {/* CRM Highlight Stats - Team Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6 mb-6">
        <Suspense
          fallback={<LoadingSkeleton height="h-32" text={t("common.loading")} />}
        >
          <CrmStatCard />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard data={statCards} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Suspense
          fallback={<LoadingSkeleton height="h-96" text={t("common.loading")} />}
        >
          <QuotationStatusChart />
        </Suspense>

        <Suspense
          fallback={<LoadingSkeleton height="h-96" text={t("common.loading")} />}
        >
          <SalesOrderStatusChart />
        </Suspense>

        <Suspense
          fallback={<LoadingSkeleton height="h-96" text={t("common.loading")} />}
        >
          <LeadSourceChart />
        </Suspense>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            {t("page.dashboard.revenue")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {data.monthlyRevenue.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                {t("common.no_data")}
              </div>
            )}
            {data.monthlyRevenue.map((item) => (
              <div
                key={item.month}
                className="group relative overflow-hidden p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all hover:shadow-md hover:border-primary/20"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {item.month}
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Rp {item.total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  <Wallet className="w-12 h-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
