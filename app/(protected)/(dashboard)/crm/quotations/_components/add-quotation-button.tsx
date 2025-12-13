"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function AddQuotationButton() {
  return (
    <div className="flex justify-end">
      <Link href="/crm/quotations/new">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Quotation
        </Button>
      </Link>
    </div>
  );
}
