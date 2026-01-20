import { useEffect, useState, useCallback } from "react";
import { quotations } from "@/types/models";

export function useQuotationsWaitingApproval() {
  const [quotations, setQuotations] = useState<quotations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = useCallback(() => {
    setLoading(true);
    fetch("/api/quotations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch quotations");
        return res.json();
      })
      .then((data: quotations[]) => {
        setQuotations(
          data.filter((q) =>
            ["sq_waiting_approval", "sq_review"].includes(q.status ?? ""),
          ),
        );
      })
      .catch(() => setQuotations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  return { quotations, loading, refetch: fetchQuotations };
}
