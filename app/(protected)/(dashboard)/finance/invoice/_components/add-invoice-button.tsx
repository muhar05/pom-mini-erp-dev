"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddInvoiceButton() {
  const router = useRouter();

  const handleAddInvoice = () => {
    router.push("/finance/invoice/new");
  };

  return (
    <div className="flex justify-end mb-6">
      <Button onClick={handleAddInvoice} className="gap-2">
        <Plus className="w-4 h-4" />
        Add Invoice
      </Button>
    </div>
  );
}
