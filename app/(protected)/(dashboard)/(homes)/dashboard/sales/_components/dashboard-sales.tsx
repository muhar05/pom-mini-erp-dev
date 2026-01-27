"use client";

import { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useDashboardSales } from "@/hooks/dashboard/useDashboardSales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoadingSkeleton from "@/components/loading-skeleton";
import { Suspense } from "react";
import { Users, FileText, Medal, TrendingUp, AlertCircle, CheckCircle2, DollarSign, BarChart3, PieChart, Activity } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { isSuperuser, isManagerSales } from "@/utils/userHelpers";
import { useSession } from "@/contexts/session-context";
import toast from "react-hot-toast";

// Local Components
import SalesPerformanceTable from "./sales-performance-table";
import DashboardFilters from "./dashboard-filters";
import DashboardCharts from "./dashboard-charts";
import DashboardActivities from "./dashboard-activities";

export default function DashboardSales() {
  const { t } = useI18n();
  const session = useSession();
  const user = session?.user;

  const [filters, setFilters] = useState<{ start?: string; end?: string; year?: number }>({
    year: new Date().getFullYear()
  });

  const { data, loading, error, refetch } = useDashboardSales(filters);

  const isManager = isSuperuser(user) || isManagerSales(user);

  const formatCurrency = (val: number | undefined | null) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0).replace("IDR", "Rp");
  };

  const handleFilterChange = (newFilters: { start?: string; end?: string; year?: number }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    toast.success("Filters applied successfully!", {
      icon: '📊',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h3 className="text-xl font-bold">Failed to load dashboard data</h3>
        <p className="text-muted-foreground">{error}</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-all">
          Try Again
        </button>
      </div>
    );
  }

  const s = data?.summary;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div>
        <DashboardBreadcrumb
          title={isManager ? "Sales Manager Dashboard" : "Sales Dashboard"}
          text={t("sidebar.dashboard")}
        />
        <p className="text-muted-foreground text-sm mt-1">
          {isManager
            ? "Ringkasan performa tim Sales"
            : "Ringkasan performa penjualan Anda"}
        </p>
      </div>

      <DashboardFilters onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
          </div>
          <div className="flex justify-center">
            <div className="w-full md:w-1/2 lg:w-1/3 h-[250px] bg-muted animate-pulse rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-muted animate-pulse rounded-xl" />
            <div className="h-32 bg-muted animate-pulse rounded-xl" />
          </div>
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      ) : (
        <>
          {/* SECTION 1. SUMMARY CARDS (GRID ATAS) - 7 CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <SummaryCard
              title="Total Lead (Qty)"
              value={s?.leads.qty || 0}
              icon={Users}
              color="bg-blue-500"
            />
            <SummaryCard
              title="Total Opp (Qty)"
              value={s?.opportunities.qty || 0}
              icon={TrendingUp}
              color="bg-indigo-500"
            />
            <SummaryCard
              title="Total Opp (Rp)"
              value={formatCurrency(s?.opportunities.rp || 0)}
              icon={DollarSign}
              color="bg-indigo-600"
              valueClass="text-xs"
            />
            <SummaryCard
              title="Total SQ (Qty)"
              value={s?.quotations.qty || 0}
              icon={Medal}
              color="bg-amber-500"
            />
            <SummaryCard
              title="Total SQ (Rp)"
              value={formatCurrency(s?.quotations.rp || 0)}
              icon={DollarSign}
              color="bg-amber-600"
              valueClass="text-xs"
            />
            <SummaryCard
              title="Total SO Won (Qty)"
              value={s?.salesOrders.qty || 0}
              icon={CheckCircle2}
              color="bg-emerald-500"
            />
            <SummaryCard
              title="Total SO Won (Rp)"
              value={formatCurrency(s?.salesOrders.rp || 0)}
              icon={DollarSign}
              color="bg-emerald-600"
              valueClass="text-xs"
            />
          </div>

          {/* SECTION 2. WINRATE (Gauge) - One row middle */}
          <div className="flex justify-center">
            <Card className="w-full md:w-1/2 lg:w-1/3 border-none shadow-sm text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Overall Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  {data?.charts && (
                    <div className="w-full h-[200px]">
                      <DashboardCharts
                        variant="gauge"
                        winrate={data.summary.salesOrders.winrate}
                      />
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground italic mt-2">Total SO Won / Total SQ</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SECTION 3. QUOTATION STATUS - Two cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 border-l-4 border-l-amber-400">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">SQ Waiting Approval</p>
                  <h3 className="text-2xl font-black mt-1">{s?.quotations.waitingApproval.qty || 0}</h3>
                  <p className="text-xs text-amber-600 font-medium">{formatCurrency(s?.quotations.waitingApproval.rp || 0)}</p>
                </div>
                <Activity className="w-10 h-10 text-amber-100" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 border-l-4 border-l-emerald-400">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">SQ Approved</p>
                  <h3 className="text-2xl font-black mt-1">{s?.quotations.approved.qty || 0}</h3>
                  <p className="text-xs text-emerald-600 font-medium">{formatCurrency(s?.quotations.approved.rp || 0)}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-emerald-100" />
              </CardContent>
            </Card>
          </div>

          {/* SECTION 4 & 5 & 6 & 7 Integrated Visualization Area */}
          {data?.charts && (
            <DashboardCharts
              variant="full"
              funnelData={data.charts.funnel}
              pipelineData={data.charts.pipeline}
              leadSourceData={data.charts.leadSource}
              lostReasonData={data.charts.lostReason}
              revenueData={data.charts.revenue}
              winrate={data.summary.salesOrders.winrate}
            />
          )}

          {/* Activity Log Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardActivities activities={data?.activities || []} />
            </div>
            <div className="space-y-6">
              <Card className="shadow-sm border-none bg-gradient-to-b from-slate-900 to-slate-950 text-white h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Average Deal Size</p>
                    <span className="text-2xl font-black text-emerald-400">
                      {s?.salesOrders.qty ? formatCurrency(s.salesOrders.rp / s.salesOrders.qty) : "Rp 0"}
                    </span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Pipeline SQ Active</p>
                    <span className="text-2xl font-black text-amber-400">
                      {formatCurrency(s?.quotations.rp || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* SECTION KHUSUS MANAGER SALES - Bottom position */}
          {isManager && data?.salesPerformance && (
            <div className="mt-6 border-t pt-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                <h2 className="text-2xl font-black tracking-tight">Sales Performance Table</h2>
              </div>
              <SalesPerformanceTable data={data.salesPerformance} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Utility Summary Card Component for consistency
function SummaryCard({ title, value, icon: Icon, color, valueClass }: any) {
  return (
    <Card className="border-none shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col justify-center h-full">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 opacity-80">{title}</span>
        <h3 className={`font-black text-slate-800 dark:text-white truncate ${valueClass || 'text-lg'}`}>
          {value}
        </h3>
        <div className={`absolute -right-2 -bottom-2 w-12 h-12 ${color} opacity-10 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform`}>
          <Icon className="w-6 h-6 mr-1 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}
