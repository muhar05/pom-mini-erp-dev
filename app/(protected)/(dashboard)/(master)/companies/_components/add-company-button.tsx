"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AddCompanyButton() {
  return (
    <div className="mb-4 flex justify-end">
      <Link href="/crm/companies/new">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + Add Company
        </Button>
      </Link>
    </div>
  );
}
