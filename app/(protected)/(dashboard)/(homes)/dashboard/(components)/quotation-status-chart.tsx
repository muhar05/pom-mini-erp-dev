"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const QuotationStatusChart = () => {
  const { data: stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <Card className="card">
        <CardContent className="px-0">
          <div className="px-6">
            <div className="h-6 w-1/3 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-1/4 bg-muted animate-pulse rounded mb-4" />
          </div>
          <div className="mt-4 flex justify-center">
            <div className="h-64 w-64 bg-muted animate-pulse rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const series = [
    stats.quotationsByStatus.draft,
    stats.quotationsByStatus.sq_submitted,
    stats.quotationsByStatus.sq_approved,
    stats.quotationsByStatus.sq_rejected,
    stats.quotationsByStatus.converted,
  ];

  const total = series.reduce((a, b) => a + b, 0);

  const options: any = {
    chart: {
      type: "donut",
      height: 350,
    },
    labels: ["Draft", "Submitted", "Approved", "Rejected", "Converted"],
    colors: ["#94a3b8", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => stats.totalQuotations.toString(),
            },
          },
        },
      },
    },
  };

  return (
    <Card className="card">
      <CardContent className="px-0">
        <div className="px-6">
          <h6 className="text-lg mb-2">Quotation Status</h6>
          <p className="text-sm text-muted-foreground">
            Distribution by status
          </p>
        </div>

        <div className="mt-4">
          {total === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Tidak ada data
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

export default QuotationStatusChart;
