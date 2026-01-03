import { useEffect, useState } from "react";

export type CompanyLevel = {
  id_level: number;
  level_name: string;
  disc1?: number | null;
  disc2?: number | null;
};

export function useCompanyLevels() {
  const [levels, setLevels] = useState<CompanyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/company-level")
      .then((res) => res.json())
      .then((data) => {
        setLevels(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => setError("Failed to fetch company levels"))
      .finally(() => setLoading(false));
  }, []);

  return { levels, loading, error };
}
