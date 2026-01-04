"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import { Progress } from "@/components/ui/progress";

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

const SalesOrderStatusChart = () => {
  const { data: stats, loading } = useDashboardStats();

  // Hitung total sales order untuk persentase
  const total =
    stats &&
    Object.values(stats.salesOrdersByStatus).reduce(
      (sum, val) => sum + (typeof val === "number" ? val : 0),
      0
    );

  return (
    <Card className="card">
      <CardContent className="px-0">
        <div className="px-6 pt-6">
          <h6 className="text-lg mb-2">Sales Order Status</h6>
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
          ) : (
            <div className="space-y-4">
              {STATUS.map((s) => {
                // 3. Pastikan akses dengan key bertipe StatusKey
                const value = stats.salesOrdersByStatus[s.key];
                const percent = total ? (value / total) * 100 : 0;
                return (
                  <div key={s.key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium">{s.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {value} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      className={`h-3 rounded-full ${s.color}`}
                      style={{ backgroundColor: "#e5e7eb" }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesOrderStatusChart;
