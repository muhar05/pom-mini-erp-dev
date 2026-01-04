"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  totalLeads: number;
  totalQuotations: number;
  totalSalesOrders: number;
  quotationsByStatus: {
    draft: number;
    sq_submitted: number;
    sq_approved: number;
    sq_rejected: number;
    converted: number;
  };
  salesOrdersByStatus: {
    draft: number;
    open: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  leadsByStatus: {
    prospecting: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    unqualified: number;
  };
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { data, loading, error, refetch: fetchStats };
}
