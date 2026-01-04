"use client";

import { useState, useEffect } from "react";
import { SalesOrder } from "./useSalesOrders";

export function useSalesOrderDetail(id: string) {
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sales-orders/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch sales order");
      }

      const data = await response.json();
      setSalesOrder(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSalesOrder();
    }
  }, [id]);

  const refresh = () => {
    if (id) {
      fetchSalesOrder();
    }
  };

  return {
    salesOrder,
    loading,
    error,
    refresh,
  };
}
