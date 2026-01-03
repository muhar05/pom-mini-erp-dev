import { useEffect, useState } from "react";

export function useCompanyLevelById(id: string | number) {
  const [level, setLevel] = useState<{
    level_name: string;
    disc1?: number;
    disc2?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/company-level/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setLevel({
            level_name: data.level_name,
            disc1: data.disc1 != null ? Number(data.disc1) : undefined,
            disc2: data.disc2 != null ? Number(data.disc2) : undefined,
          });
        } else {
          setLevel(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { level, loading };
}
