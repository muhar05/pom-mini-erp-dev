import { useEffect, useState } from "react";
import type { roles } from "@/types/models";

export function useRoles() {
  const [rolesList, setRolesList] = useState<roles[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError("");
    fetch("/api/users/roles")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch roles");
        return res.json();
      })
      .then((data: roles[]) => setRolesList(data))
      .catch(() => setError("Failed to load roles"))
      .finally(() => setIsLoading(false));
  }, []);

  return { roles: rolesList, isLoading, error };
}
