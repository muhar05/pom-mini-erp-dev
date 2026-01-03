import { useState } from "react";

export function useDeleteCustomer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCustomer = async (id: number | string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to delete customer");
      return data;
    } catch (e: any) {
      setError(e.message || "Failed to delete customer");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCustomer, loading, error };
}
