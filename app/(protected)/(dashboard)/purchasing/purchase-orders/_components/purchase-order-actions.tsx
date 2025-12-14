"use client";

import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import PurchaseOrderDeleteDialog from "./purchase-order-delete-dialog";

type PurchaseOrder = {
  id: string;
  po_no: string;
  pr_no: string;
  vendor_name: string;
  vendor_email: string;
  contact_person: string;
  items_count: number;
  total_amount: number;
  order_date: string;
  delivery_date: string;
  payment_term: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface PurchaseOrderActionsProps {
  purchaseOrder: PurchaseOrder;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PurchaseOrderActions({
  purchaseOrder,
  onEdit,
  onDelete,
}: PurchaseOrderActionsProps) {
  return (
    <div className="flex gap-2">
      {/* View */}
      <Link href={`/purchasing/purchase-orders/${purchaseOrder.id}`}>
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
      <Link href={`/purchasing/purchase-orders/${purchaseOrder.id}/edit`}>
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
      <PurchaseOrderDeleteDialog
        purchaseOrder={purchaseOrder}
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
