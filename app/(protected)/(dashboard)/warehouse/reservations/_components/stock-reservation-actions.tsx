"use client";

import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import StockReservationDeleteDialog from "./stock-reservation-delete-dialog";

type StockReservation = {
  id: string;
  sr_no: string;
  so_no: string;
  customer_name: string;
  reserved_by: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  reservation_date: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface StockReservationActionsProps {
  stockReservation: StockReservation;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function StockReservationActions({
  stockReservation,
  onEdit,
  onDelete,
}: StockReservationActionsProps) {
  return (
    <div className="flex gap-2">
      {/* View */}
      <Link href={`/warehouse/reservations/${stockReservation.id}`}>
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
      <Link href={`/warehouse/reservations/${stockReservation.id}/edit`}>
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
      <StockReservationDeleteDialog
        stockReservation={stockReservation}
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
