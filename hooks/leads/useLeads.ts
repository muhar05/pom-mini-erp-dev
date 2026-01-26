import { useEffect, useState, useCallback } from "react";
import { leads } from "@/types/models";

interface LeadFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useLeads(filters?: LeadFilters) {
  const [leads, setLeads] = useState<leads[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status && filters.status !== "all") params.append("status", filters.status);
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);

      const url = `/api/leads${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error("useLeads Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.status, filters?.dateFrom, filters?.dateTo]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { leads, loading, setLeads, refetch: fetchLeads };
}
