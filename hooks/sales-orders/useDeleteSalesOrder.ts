"use client";

import { useState } from "react";

export function useDeleteSalesOrder() {
  const [loading, setLoading] = useState(false);

  const deleteSalesOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sales-orders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete sales order");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteSalesOrder,
    loading,
  };
}
