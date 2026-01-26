import { useCallback, useEffect, useState } from "react";

export interface DashboardSalesData {
  totalRevenue: number;
  totalOrder: number;
  totalQuotation: number;
  monthlyRevenue: { month: string; total: number }[];
  orderStatus: { status: string; total: number }[];
  salesPerformance?: {
    sales_name: string;
    total_leads: number;
    total_quotations: number;
    total_orders: number;
    total_revenue: number;
  }[];
}

export function useDashboardSales(params?: {
  user_id?: string | number;
  start?: string;
  end?: string;
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
