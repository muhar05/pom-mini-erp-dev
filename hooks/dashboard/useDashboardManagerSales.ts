import { useCallback, useEffect, useState } from "react";

export interface DashboardManagerSalesData {
  totalRevenue: number;
  totalOrder: number;
  totalQuotation: number;
  monthlyRevenue: { month: string; total: number }[];
  orderStatus: { status: string; total: number }[];
}

export function useDashboardManagerSales(params?: {
  start?: string;
  end?: string;
}) {
  const [data, setData] = useState<DashboardManagerSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(
        "/api/dashboard/manager-sales",
        window.location.origin,
      );
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
      setError(err.message || "Failed to fetch dashboard manager sales data");
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
