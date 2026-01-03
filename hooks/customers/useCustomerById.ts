import { useEffect, useState } from "react";
import type { customers } from "@/types/models";

export function useCustomerById(id: string | number | undefined) {
  const [customer, setCustomer] = useState<customers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/customers/${id}`)
      .then((res) => res.json())
      .then((data) => setCustomer(data.data || data))
      .catch((e) => setError(e.message || "Failed to fetch customer"))
      .finally(() => setLoading(false));
  }, [id]);

  return { customer, loading, error };
}
