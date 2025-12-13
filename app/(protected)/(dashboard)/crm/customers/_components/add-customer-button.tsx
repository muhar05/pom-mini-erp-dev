"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function AddCustomerButton() {
  return (
    <div className="flex justify-end">
      <Link href="/crm/customers/new">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Customer
        </Button>
      </Link>
    </div>
  );
}
