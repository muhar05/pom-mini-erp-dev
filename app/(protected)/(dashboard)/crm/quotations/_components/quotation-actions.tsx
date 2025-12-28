"use client";

import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import QuotationDeleteDialog from "./quotation-delete-dialog";

type Quotation = {
  id: string;
  quotation_no: string;
  customer_name: string;
  customer_email: string;
  type: string;
  company: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  opportunity_no: string;
};

interface QuotationActionsProps {
  quotation: Quotation;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function QuotationActions({
  quotation,
  onEdit,
  onDelete,
}: QuotationActionsProps) {
  if (!quotation) return null;
  return (
    <div className="flex gap-2">
      {/* View */}
      <Link href={`/crm/quotations/${quotation.id}`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </Link>

      {/* Edit */}
      <Link href={`/crm/quotations/${quotation.id}/edit`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </Link>

      {/* Delete */}
      <QuotationDeleteDialog
        quotation={quotation}
        trigger={
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        }
        onDelete={() => onDelete?.()}
      />
    </div>
  );
}
