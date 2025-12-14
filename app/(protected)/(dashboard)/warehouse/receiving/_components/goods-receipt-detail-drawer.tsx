"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  FileText,
  User,
  Calendar,
  Package,
  Warehouse as WarehouseIcon,
  ShoppingCart,
  Truck,
  CheckCircle,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import GoodsReceiptRelatedData from "./goods-receipt-related-data";

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

interface GoodsReceiptDetailDrawerProps {
  goodsReceipt: GoodsReceipt | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "received":
      return "bg-blue-100 text-blue-800";
    case "quality check":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "partial":
      return "bg-orange-100 text-orange-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-purple-100 text-purple-800";
  }
}

export default function GoodsReceiptDetailDrawer({
  goodsReceipt,
  open,
  onClose,
  onEdit,
  onDelete,
}: GoodsReceiptDetailDrawerProps) {
  if (!goodsReceipt) return null;

  const canComplete =
    goodsReceipt.status.toLowerCase() === "received" ||
    goodsReceipt.status.toLowerCase() === "quality check";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {goodsReceipt.gr_no}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                Goods Receipt Details
              </SheetDescription>
            </div>
            <Badge className={getStatusBadgeClass(goodsReceipt.status)}>
              {goodsReceipt.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link href={`/warehouse/receiving/${goodsReceipt.id}/edit`}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          {canComplete && (
            <Button
              size="sm"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Receipt
            </Button>
          )}
        </div>

        {/* Goods Receipt Information */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Receipt Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">GR Number</p>
                  <p className="font-medium">{goodsReceipt.gr_no}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">PO Reference</p>
                  <Link
                    href={`/purchasing/purchase-orders/${goodsReceipt.po_no}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {goodsReceipt.po_no}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p className="font-medium">{goodsReceipt.vendor_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Delivery Note</p>
                  <p className="font-medium">{goodsReceipt.delivery_note}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Received By</p>
                  <p className="font-medium">{goodsReceipt.receiver_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <WarehouseIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Warehouse</p>
                  <p className="font-medium">{goodsReceipt.warehouse}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="font-medium">
                    {goodsReceipt.items_count} items
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Quantity</p>
                  <p className="font-medium text-lg">
                    {goodsReceipt.total_qty} units
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Receipt Date</p>
                  <p className="font-medium">
                    {formatDate(goodsReceipt.receipt_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {formatDate(goodsReceipt.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {formatDate(goodsReceipt.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Data */}
          <GoodsReceiptRelatedData goodsReceiptId={goodsReceipt.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
