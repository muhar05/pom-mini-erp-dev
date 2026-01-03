import { useState } from "react";

export function useCreateCustomer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCustomer = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create customer");
      return data;
    } catch (e: any) {
      setError(e.message || "Failed to create customer");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { createCustomer, loading, error };
}
