import { useEffect, useState } from "react";
import { leads } from "@/types/models";

export function useLeadById(id?: number | string) {
  const [lead, setLead] = useState<leads | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    fetch(`/api/leads/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          await res.text();
          return null;
        }
        const text = await res.text();
        if (!text) {
          return null;
        }
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })
      .then((data) => {
        setLead(data);
      })
      .catch(() => {
        setLead(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { lead, loading };
}
