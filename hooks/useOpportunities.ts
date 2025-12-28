import { useEffect, useState } from "react";
import { Opportunity } from "@/types/models";

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/opportunities")
      .then((res) => res.json())
      .then(setOpportunities)
      .finally(() => setLoading(false));
  }, []);

  return { opportunities, loading, setOpportunities };
}
