"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import { Badge } from "@/components/ui/badge";

const LeadStatusOverview = () => {
  const { data: stats, loading } = useDashboardStats();

  if (loading) {
    // Imitasi card skeleton
    return (
      <Card className="card">
        <CardContent className="p-6">
          <div className="h-6 w-1/3 bg-muted animate-pulse rounded mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                  <div className="h-7 w-10 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-5 w-10 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              <div className="h-7 w-14 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statusData = [
    {
      label: "New",
      count: stats.leadsByStatus.new,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      percentage: ((stats.leadsByStatus.new / stats.totalLeads) * 100).toFixed(
        1
      ),
    },
    {
      label: "Contacted",
      count: stats.leadsByStatus.contacted,
      color:
        "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      percentage: (
        (stats.leadsByStatus.contacted / stats.totalLeads) *
        100
      ).toFixed(1),
    },
    {
      label: "Qualified",
      count: stats.leadsByStatus.qualified,
      color:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      percentage: (
        (stats.leadsByStatus.qualified / stats.totalLeads) *
        100
      ).toFixed(1),
    },
    {
      label: "Converted",
      count: stats.leadsByStatus.converted,
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
      percentage: (
        (stats.leadsByStatus.converted / stats.totalLeads) *
        100
      ).toFixed(1),
    },
    {
      label: "Unqualified",
      count: stats.leadsByStatus.unqualified,
      color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      percentage: (
        (stats.leadsByStatus.unqualified / stats.totalLeads) *
        100
      ).toFixed(1),
    },
  ];

  return (
    <Card className="card">
      <CardContent className="p-6">
        <h6 className="text-lg mb-4">Lead Status Overview</h6>
        <div className="space-y-4">
          {statusData.map((status, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={`${status.color} px-3 py-1`}>
                  {status.label}
                </Badge>
                <span className="text-2xl font-bold">{status.count}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {status.percentage}%
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Leads</span>
            <span className="text-2xl font-bold text-primary">
              {stats.totalLeads}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadStatusOverview;
