"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { useI18n } from "@/contexts/i18n-context";

// 1. Definisikan union type untuk key status
type StatusKey = "draft" | "open" | "processing" | "completed" | "cancelled";

// 2. Tipekan array STATUS dengan StatusKey
const STATUS: { key: StatusKey; label: string; color: string }[] = [
  { key: "draft", label: "Draft", color: "bg-slate-400" },
  { key: "open", label: "Open", color: "bg-blue-500" },
  { key: "processing", label: "Processing", color: "bg-amber-400" },
  { key: "completed", label: "Completed", color: "bg-emerald-500" },
  { key: "cancelled", label: "Cancelled", color: "bg-red-500" },
];

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SalesOrderStatusChart = () => {
  const { t } = useI18n();
  const { data: stats, loading } = useDashboardStats();

  // Hitung total sales order untuk persentase
  const total =
    stats &&
    Object.values(stats.salesOrdersByStatus).reduce(
      (sum, val) => sum + (typeof val === "number" ? val : 0),
      0
    );

  const options = {
    labels: STATUS.map((s) => s.label),
    colors: STATUS.map((s) => s.color),
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const series = STATUS.map((s) => {
    const value = stats?.salesOrdersByStatus[s.key] || 0;
    return total ? (value / total) * 100 : 0;
  });

  return (
    <Card className="card">
      <CardContent className="px-0">
        <div className="px-6 pt-6">
          <h6 className="text-lg mb-2">{t("page.dashboard.sales_status")}</h6>
          <p className="text-sm text-muted-foreground mb-6">
            Distribution by status
          </p>
          {loading || !stats ? (
            <div className="space-y-4">
              {STATUS.map((s) => (
                <div key={s.key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">{s.label}</span>
                    <span className="text-xs text-muted-foreground">...</span>
                  </div>
                  <Progress value={0} className="h-3 rounded-full" />
                </div>
              ))}
            </div>
          ) : total === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {t("common.no_data")}
            </div>
          ) : (
            <Chart
              options={options}
              series={series}
              type="donut"
              height={350}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesOrderStatusChart;
