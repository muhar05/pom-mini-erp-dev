"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useDashboardSales } from "@/hooks/dashboard/useDashboardSales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StatCard, {
  StatCardData,
} from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/stat-card";
import { Wallet, FileText, Medal } from "lucide-react";

export default function DashboardSales() {
  const { data, loading, error, refetch } = useDashboardSales();

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Sales</CardTitle>
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
      <DashboardBreadcrumb title="Dashboard Sales" text="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard data={statCards} />
      </div>

      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Ringkasan Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          <div className="mb-4">
            <div className="font-semibold mb-2">Monthly Revenue</div>
            <div className="flex flex-wrap gap-4">
              {data.monthlyRevenue.length === 0 && (
                <span className="text-muted-foreground">No data</span>
              )}
              {data.monthlyRevenue.map((item) => (
                <div
                  key={item.month}
                  className="p-2 border rounded min-w-[100px] text-center"
                >
                  <div className="text-xs text-muted-foreground">
                    {item.month}
                  </div>
                  <div className="font-bold">
                    Rp {item.total.toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-4" />
          <div>
            <div className="font-semibold mb-2">Order Status</div>
            <div className="flex flex-wrap gap-4">
              {data.orderStatus.length === 0 && (
                <span className="text-muted-foreground">No data</span>
              )}
              {data.orderStatus.map((item) => (
                <div
                  key={item.status}
                  className="p-2 border rounded min-w-[100px] text-center"
                >
                  <div className="text-xs text-muted-foreground">
                    {item.status}
                  </div>
                  <div className="font-bold">{item.total}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
