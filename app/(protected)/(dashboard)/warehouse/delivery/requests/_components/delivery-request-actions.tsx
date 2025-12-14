"use client";

import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import DeliveryRequestDeleteDialog from "./delivery-request-delete-dialog";

type DeliveryRequest = {
  id: string;
  dr_no: string;
  so_no: string;
  sr_no: string;
  customer_name: string;
  delivery_address: string;
  requested_by: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  request_date: string;
  required_date: string;
  delivery_type: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

interface DeliveryRequestActionsProps {
  deliveryRequest: DeliveryRequest;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DeliveryRequestActions({
  deliveryRequest,
  onEdit,
  onDelete,
}: DeliveryRequestActionsProps) {
  return (
    <div className="flex gap-2">
      {/* View */}
      <Link href={`/warehouse/delivery/requests/${deliveryRequest.id}`}>
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
      <Link href={`/warehouse/delivery/requests/${deliveryRequest.id}/edit`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </Link>

      {/* Delete */}
      <DeliveryRequestDeleteDialog
        deliveryRequest={deliveryRequest}
        onSuccess={() => {
          if (onDelete) onDelete();
        }}
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
      />
    </div>
  );
}
