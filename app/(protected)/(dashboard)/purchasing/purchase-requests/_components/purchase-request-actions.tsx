"use client";

import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import PurchaseRequestDeleteDialog from "./purchase-request-delete-dialog";

type PurchaseRequest = {
  id: string;
  pr_no: string;
  so_no: string;
  requested_by: string;
  department: string;
  items_count: number;
  total_amount: number;
  request_date: string;
  required_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface PurchaseRequestActionsProps {
  purchaseRequest: PurchaseRequest;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PurchaseRequestActions({
  purchaseRequest,
  onEdit,
  onDelete,
}: PurchaseRequestActionsProps) {
  return (
    <div className="flex gap-2">
      {/* View */}
      <Link href={`/purchasing/purchase-requests/${purchaseRequest.id}`}>
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
      <Link href={`/purchasing/purchase-requests/${purchaseRequest.id}/edit`}>
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
      <PurchaseRequestDeleteDialog
        purchaseRequest={purchaseRequest}
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
