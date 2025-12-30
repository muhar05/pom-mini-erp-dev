import { useState } from "react";

export function useDeleteQuotation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteQuotation = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete quotation");
      }
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete quotation");
      setLoading(false);
      return false;
    }
  };

  return { deleteQuotation, loading, error };
}
