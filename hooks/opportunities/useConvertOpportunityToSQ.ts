import { useState } from "react";

export function useConvertOpportunityToSQ() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const convert = async (
    opportunityId: string | number,
    customerId: number | null
  ) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/opportunities/${opportunityId}/convert-sq`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to convert opportunity to SQ");
        setLoading(false);
        return false;
      }
      setResult(data.data);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to convert opportunity to SQ");
      setLoading(false);
      return false;
    }
  };

  return { convert, loading, error, result };
}
