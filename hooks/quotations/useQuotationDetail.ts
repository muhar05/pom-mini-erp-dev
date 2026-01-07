// hooks/useQuotationDetail.ts
import { useEffect, useState } from "react";

export function useQuotationDetail(id: string | number | undefined) {
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/quotations/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setQuotation(data);
      })
      .catch((err) => {
        console.error("Error fetching quotation:", err);
        setError(err.message || "Failed to fetch quotation");
        setQuotation(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { quotation, loading, error, setQuotation };
}
