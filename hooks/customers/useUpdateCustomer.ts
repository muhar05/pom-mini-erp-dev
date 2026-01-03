import { useState } from "react";

export function useUpdateCustomer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCustomer = async (id: string | number, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update customer");
      return data;
    } catch (e: any) {
      setError(e.message || "Failed to update customer");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { updateCustomer, loading, error };
}
