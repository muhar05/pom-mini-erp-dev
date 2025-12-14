"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function AddPurchaseOrderButton() {
  return (
    <div className="flex justify-end mb-4">
      <Link href="/purchasing/purchase-orders/new">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Purchase Order
        </Button>
      </Link>
    </div>
  );
}
