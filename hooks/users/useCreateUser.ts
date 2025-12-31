import { useState } from "react";
import { useRouter } from "next/navigation";
import type { users } from "@/types/models";

interface CreateUserInput {
  name: string;
  email: string;
  role_id: string;
}

interface UseCreateUserResult {
  isLoading: boolean;
  error: string;
  createdUser?: users;
  createUser: (input: CreateUserInput) => Promise<void>;
}

export function useCreateUser(): UseCreateUserResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdUser, setCreatedUser] = useState<users>();
  const router = useRouter();

  const createUser = async (input: CreateUserInput) => {
    setIsLoading(true);
    setError("");
    setCreatedUser(undefined);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        const user: users = await response.json();
        setCreatedUser(user);
        router.push("/settings/users");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create user");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, createdUser, createUser };
}
