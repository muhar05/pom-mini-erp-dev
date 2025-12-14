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
  ShoppingBag,
  Clock,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import StockReservationRelatedData from "./stock-reservation-related-data";

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

interface StockReservationDetailDrawerProps {
  stockReservation: StockReservation | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "reserved":
      return "bg-blue-100 text-blue-800";
    case "fulfilled":
      return "bg-green-100 text-green-800";
    case "partially fulfilled":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "expired":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-purple-100 text-purple-800";
  }
}

export default function StockReservationDetailDrawer({
  stockReservation,
  open,
  onClose,
  onEdit,
  onDelete,
}: StockReservationDetailDrawerProps) {
  if (!stockReservation) return null;

  const canFulfill = stockReservation.status.toLowerCase() === "reserved";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {stockReservation.sr_no}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                Stock Reservation Details
              </SheetDescription>
            </div>
            <Badge className={getStatusBadgeClass(stockReservation.status)}>
              {stockReservation.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link href={`/warehouse/reservations/${stockReservation.id}/edit`}>
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
          {canFulfill && (
            <Button
              size="sm"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Package className="w-4 h-4" />
              Fulfill
            </Button>
          )}
        </div>

        {/* Stock Reservation Information */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">
              Reservation Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">SR Number</p>
                  <p className="font-medium">{stockReservation.sr_no}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">SO Reference</p>
                  <Link
                    href={`/crm/sales-orders/${stockReservation.so_no}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {stockReservation.so_no}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">
                    {stockReservation.customer_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Reserved By</p>
                  <p className="font-medium">{stockReservation.reserved_by}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <WarehouseIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Warehouse</p>
                  <p className="font-medium">{stockReservation.warehouse}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="font-medium">
                    {stockReservation.items_count} items
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Quantity</p>
                  <p className="font-medium text-lg">
                    {stockReservation.total_qty} units
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Reservation Date</p>
                  <p className="font-medium">
                    {formatDate(stockReservation.reservation_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">
                    {formatDate(stockReservation.expiry_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {formatDate(stockReservation.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {formatDate(stockReservation.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Data */}
          <StockReservationRelatedData
            stockReservationId={stockReservation.id}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
