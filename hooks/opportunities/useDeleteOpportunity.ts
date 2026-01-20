import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function useDeleteOpportunity() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const deleteOpportunity = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (
          data?.error === "Unauthorized" ||
          data?.message === "Unauthorized"
        ) {
          toast.error(
            "Anda tidak memiliki izin untuk menghapus opportunity ini.",
          );
        } else {
          toast.error("Failed to delete opportunity");
        }
        return false;
      }
      router.refresh();
      return true;
    } catch (error) {
      toast.error("Failed to delete opportunity. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteOpportunity, isLoading };
}
