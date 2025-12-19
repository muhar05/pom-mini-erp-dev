"use client";

import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import OpportunityDeleteDialog from "./opportunity-delete-dialog";

type Opportunity = {
  id: string;
  opportunity_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  potential_value: number;
  stage: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface OpportunityActionsProps {
  opportunity: Opportunity;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function OpportunityActions({
  opportunity,
  onEdit,
  onDelete,
}: OpportunityActionsProps) {
  if (!opportunity) return null;

  return (
    <div className="flex gap-2">
      {/* View */}
      <Link href={`/crm/opportunities/${opportunity.id}`}>
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
      {/* <Link href={`/crm/opportunities/${opportunity.id}/edit`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </Link> */}

      {/* Delete */}
      {/* <OpportunityDeleteDialog
        opportunity={opportunity}
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
      /> */}
    </div>
  );
}
