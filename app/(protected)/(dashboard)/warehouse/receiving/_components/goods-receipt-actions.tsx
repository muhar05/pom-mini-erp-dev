"use client";

import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import GoodsReceiptDeleteDialog from "./goods-receipt-delete-dialog";

type GoodsReceipt = {
  id: string;
  gr_no: string;
  po_no: string;
  vendor_name: string;
  receiver_name: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  receipt_date: string;
  delivery_note: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface GoodsReceiptActionsProps {
  goodsReceipt: GoodsReceipt;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function GoodsReceiptActions({
  goodsReceipt,
  onEdit,
  onDelete,
}: GoodsReceiptActionsProps) {
  return (
    <div className="flex gap-2">
      {/* View */}
      <Link href={`/warehouse/receiving/${goodsReceipt.id}`}>
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
      <Link href={`/warehouse/receiving/${goodsReceipt.id}/edit`}>
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
      <GoodsReceiptDeleteDialog
        goodsReceipt={goodsReceipt}
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
