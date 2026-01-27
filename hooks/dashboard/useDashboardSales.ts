import { useCallback, useEffect, useState } from "react";

export interface DashboardSalesData {
  summary: {
    leads: { qty: number; byStatus: { status: string; count: number }[] };
    opportunities: {
      qty: number;
      rp: number;
      byStatus: { status: string; count: number; rp: number }[];
    };
    quotations: {
      qty: number;
      rp: number;
      waitingApproval: { qty: number; rp: number };
      approved: { qty: number; rp: number };
      byStatus: { status: string; count: number; rp: number }[];
    };
    salesOrders: { qty: number; rp: number; winrate: number };
  };
  charts: {
    pipeline: { status: string; count: number }[];
    funnel: { stage: string; count: number }[];
    leadSource: { source: string; count: number }[];
    lostReason: { reason: string; count: number }[];
    revenue: { month: string; qty: number; rp: number }[];
  };
  activities: { id: string; user: string; action: string; date: string }[];
  salesPerformance?: {
    sales_name: string;
    leads_qty: number;
    opp_qty: number;
    opp_rp: number;
    sq_qty: number;
    sq_rp: number;
    so_qty: number;
    so_rp: number;
    winrate: number;
  }[];
}


export function useDashboardSales(params?: {
  user_id?: string | number;
  start?: string;
  end?: string;
  year?: number;
}) {
  const [data, setData] = useState<DashboardSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/dashboard/sales", window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, String(value));
        });
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard sales data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
