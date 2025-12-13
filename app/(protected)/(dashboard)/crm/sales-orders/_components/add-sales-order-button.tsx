"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function AddSalesOrderButton() {
  return (
    <div className="flex justify-end">
      <Link href="/crm/sales-orders/new">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Sales Order
        </Button>
      </Link>
    </div>
  );
}
