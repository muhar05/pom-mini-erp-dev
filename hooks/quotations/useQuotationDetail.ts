// hooks/useQuotationDetail.ts
import { useEffect, useState } from "react";

export function useQuotationDetail(id: string | number | undefined) {
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/quotations/${id}`)
      .then((res) => res.json())
      .then((data) => setQuotation(data))
      .finally(() => setLoading(false));
  }, [id]);

  return { quotation, loading, setQuotation };
}
