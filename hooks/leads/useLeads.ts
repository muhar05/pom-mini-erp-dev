import { useEffect, useState } from "react";
import { leads } from "@/types/models";

export function useLeads() {
  const [leads, setLeads] = useState<leads[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/leads")
      .then((res) => res.json())
      .then(setLeads)
      .finally(() => setLoading(false));
  }, []);

  return { leads, loading, setLeads };
}
