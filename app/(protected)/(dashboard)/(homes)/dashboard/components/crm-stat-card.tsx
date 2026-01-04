"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Users,
  ShoppingCart,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import React from "react";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";

interface StatCardData {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  gradientFrom: string;
  description: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const CrmStatCard = () => {
  const { data: stats, loading } = useDashboardStats();

  if (loading) {
    // Imitasi skeleton card
    return (
      <>
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className={`bg-gradient-to-r from-gray-100 to-white dark:from-slate-800 dark:to-slate-700 p-0 border border-gray-200 dark:border-neutral-700 rounded-md shadow-none`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                </div>
                <div className="w-12 h-12 bg-muted animate-pulse rounded-full" />
              </div>
              <div className="flex items-center gap-2 text-sm mt-4">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (!stats) {
    return null;
  }

  const cardsData: StatCardData[] = [
    {
      title: "Total Leads",
      value: stats.totalLeads.toLocaleString(),
      icon: Users,
      iconBg: "bg-blue-600",
      gradientFrom: "from-blue-600/10",
      description: `${stats.leadsByStatus.new} New, ${stats.leadsByStatus.qualified} Qualified`,
    },
    {
      title: "Total Quotations",
      value: stats.totalQuotations.toLocaleString(),
      icon: FileText,
      iconBg: "bg-purple-600",
      gradientFrom: "from-purple-600/10",
      description: `${stats.quotationsByStatus.sq_approved} Approved, ${stats.quotationsByStatus.draft} Draft`,
    },
    {
      title: "Sales Orders",
      value: stats.totalSalesOrders.toLocaleString(),
      icon: ShoppingCart,
      iconBg: "bg-green-600",
      gradientFrom: "from-green-600/10",
      description: `${stats.salesOrdersByStatus.open} Open, ${stats.salesOrdersByStatus.processing} Processing`,
    },
    {
      title: "Converted Leads",
      value: stats.leadsByStatus.prospecting?.toLocaleString?.() ?? "0",
      icon: TrendingUp,
      iconBg: "bg-cyan-600",
      gradientFrom: "from-cyan-600/10",
      description: "Successfully converted to opportunities",
    },
    {
      title: "Approved Quotations",
      value: stats.quotationsByStatus.sq_approved.toLocaleString(),
      icon: CheckCircle2,
      iconBg: "bg-emerald-600",
      gradientFrom: "from-emerald-600/10",
      description: "Ready to convert to SO",
    },
    {
      title: "Pending Quotations",
      value: stats.quotationsByStatus.sq_submitted.toLocaleString(),
      icon: Clock,
      iconBg: "bg-orange-600",
      gradientFrom: "from-orange-600/10",
      description: "Awaiting approval",
    },
  ];

  return (
    <>
      {cardsData.map((card, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-r ${card.gradientFrom} to-white dark:to-slate-700 p-0 border border-gray-200 dark:border-neutral-700 rounded-md shadow-none`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {card.value}
                </h3>
              </div>
              <div
                className={`w-12 h-12 ${card.iconBg} rounded-full flex items-center justify-center`}
              >
                <card.icon className="text-white" size={24} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm mt-4">
              <span className="text-neutral-500 dark:text-neutral-400 text-[13px]">
                {card.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default CrmStatCard;
