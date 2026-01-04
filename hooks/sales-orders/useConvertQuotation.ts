"use client";

import { useState } from "react";
import { convertQuotationToSalesOrderAction } from "@/app/actions/sales-orders";

export function useConvertQuotation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertQuotation = async (quotationId: number) => {
    try {
      setLoading(true);
      setError(null);

      const result = await convertQuotationToSalesOrderAction(quotationId);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to convert quotation";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    convertQuotation,
    loading,
    error,
  };
}
