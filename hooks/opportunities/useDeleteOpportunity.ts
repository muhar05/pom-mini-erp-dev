import { useState } from "react";
import { useRouter } from "next/navigation";

export function useDeleteOpportunity() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const deleteOpportunity = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete opportunity");
      router.refresh();
      return true;
    } catch (error) {
      alert("Failed to delete opportunity. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteOpportunity, isLoading };
}
