import { useState } from "react";
import { useRouter } from "next/navigation";

export function useUpdateOpportunityStatus(opportunityId: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/opportunities/${opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
      return true;
    } catch (error) {
      alert("Failed to update status. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStatus, isLoading };
}
