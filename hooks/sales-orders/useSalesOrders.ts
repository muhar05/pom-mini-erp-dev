"use client";

import { useState, useEffect } from "react";

export interface SalesOrder {
  id: string;
  sale_no: string;
  quotation_id?: string | null;
  customer_id?: number | null; // Add customer_id support
  total?: number | null;
  discount?: number | null;
  shipping?: number | null;
  tax?: number | null;
  grand_total?: number | null;
  status?: string | null;
  note?: string | null;
  sale_status?: string | null;
  payment_status?: string | null;
  file_po_customer?: string | null;
  created_at?: Date | null;
  // Quotation relation (for quotation-based sales orders)
  quotation?: {
    id: number;
    quotation_no: string;
    customer?: {
      id: number;
      customer_name: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      type?: string | null;
    } | null;
  } | null;
  // Direct customer relation (for direct sales orders)
  customers?: {
    id: number;
    customer_name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    type?: string | null;
  } | null;
  sale_order_detail?: {
    id: string;
    product_id?: string | null;
    product_name: string;
    price: number;
    qty: number;
    total?: number | null;
    status?: string | null;
  }[];
  user?: {
    id: number | string;
    name?: string | null;
    email?: string | null;
    role_id?: number | string | null;
    created_at?: Date | null;
  } | null;
}

export function useSalesOrders() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sales-orders");

      if (!response.ok) {
        throw new Error("Failed to fetch sales orders");
      }

      const data = await response.json();
      setSalesOrders(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const refresh = () => {
    fetchSalesOrders();
  };

  return {
    salesOrders,
    loading,
    error,
    refresh,
  };
}
