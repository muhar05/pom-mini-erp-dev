import { useCallback, useEffect, useState } from "react";
import type { customers } from "@/types/models";

type Customer = customers & {
  status?: string | null;
  customer_type?: string | null;
  contact_person?: string | null;
  city?: string | null;
  country?: string | null;
  updated_at?: string | Date | null;
};

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data.data || data);
    } catch (e: any) {
      setError(e.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Untuk refresh data dari luar (setelah create/edit/delete)
  const refresh = fetchCustomers;

  return { customers, loading, error, refresh };
}
