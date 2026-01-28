import { useEffect, useState } from "react";
import { Opportunity } from "@/types/models";

export interface OpportunityFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useOpportunities(filters?: OpportunityFilters) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);

      const url = `/api/opportunities${params.toString() ? `?${params.toString()}` : ""
        }`;
      const res = await fetch(url);
      const data = await res.json();
      setOpportunities(data);
    } catch (error) {
      console.error("useOpportunities Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [
    filters?.search,
    filters?.status,
    filters?.dateFrom,
    filters?.dateTo,
  ]);

  return {
    opportunities,
    loading,
    setOpportunities,
    refresh: fetchOpportunities
  };
}
