"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";

export default function AddLeadButton() {
  const { t } = useI18n();
  return (
    <div className="flex justify-end mb-4">
      <Link href="/crm/leads/new">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t("page.leads.create")}
        </Button>
      </Link>
    </div>
  );
}
