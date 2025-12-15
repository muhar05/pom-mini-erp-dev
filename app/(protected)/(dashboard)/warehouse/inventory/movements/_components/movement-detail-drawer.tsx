"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Warehouse as WarehouseIcon,
  MapPin,
  FileText,
  User,
  Calendar,
  Hash,
  Tag,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Settings,
  Info,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";

type Movement = {
  id: string;
  movement_type: string;
  item_code: string;
  item_name: string;
  sku: string;
  quantity: number;
  unit: string;
  warehouse: string;
  location: string;
  reference_no: string;
  reference_type: string;
  batch_no: string | null;
  notes: string;
  created_by: string;
  movement_date: string;
  status: string;
};

interface MovementDetailDrawerProps {
  movement: Movement | null;
  open: boolean;
  onClose: () => void;
}

function getMovementTypeInfo(type: string) {
  switch (type.toLowerCase()) {
    case "in":
      return {
        class: "bg-green-100 text-green-800",
        icon: ArrowDownCircle,
        label: "Stock In",
        color: "text-green-600",
      };
    case "out":
      return {
        class: "bg-red-100 text-red-800",
        icon: ArrowUpCircle,
        label: "Stock Out",
        color: "text-red-600",
      };
    case "transfer":
      return {
        class: "bg-blue-100 text-blue-800",
        icon: ArrowLeftRight,
        label: "Stock Transfer",
        color: "text-blue-600",
      };
    case "adjustment":
      return {
        class: "bg-yellow-100 text-yellow-800",
        icon: Settings,
        label: "Stock Adjustment",
        color: "text-yellow-600",
      };
    default:
      return {
        class: "bg-gray-100 text-gray-800",
        icon: Settings,
        label: type,
        color: "text-gray-600",
      };
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

export default function MovementDetailDrawer({
  movement,
  open,
  onClose,
}: MovementDetailDrawerProps) {
  if (!movement) return null;

  const typeInfo = getMovementTypeInfo(movement.movement_type);
  const TypeIcon = typeInfo.icon;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                <TypeIcon className={`w-6 h-6 ${typeInfo.color}`} />
                {typeInfo.label}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500 mt-1">
                Movement ID: {movement.id}
              </SheetDescription>
            </div>
            <Badge className={getStatusBadgeClass(movement.status)}>
              {movement.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Movement Type Badge */}
        <div className={`${typeInfo.class} rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-3">
            <TypeIcon className="w-8 h-8" />
            <div>
              <div className="font-semibold text-lg">{typeInfo.label}</div>
              <div className="text-sm">
                <span
                  className={`font-bold text-2xl ${
                    movement.quantity > 0
                      ? "text-green-700"
                      : movement.quantity < 0
                      ? "text-red-700"
                      : "text-gray-700"
                  }`}
                >
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity}
                </span>
                <span className="ml-1 text-sm font-medium">
                  {movement.unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Item Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Item Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Item Code:</span>
                <span className="font-semibold">{movement.item_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Item Name:</span>
                <span className="font-semibold">{movement.item_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">SKU:</span>
                <span className="font-mono font-semibold">{movement.sku}</span>
              </div>
              {movement.batch_no && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Batch No:</span>
                  <span className="font-mono font-semibold">
                    {movement.batch_no}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <WarehouseIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-500">Warehouse:</span>
                <span className="font-semibold">{movement.warehouse}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-500">Location:</span>
                <span className="font-mono font-semibold">
                  {movement.location}
                </span>
              </div>
            </div>
          </div>

          {/* Reference Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Reference Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">
                  Reference Type:
                </span>
                <span className="font-semibold">{movement.reference_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Reference No:</span>
                <span className="font-mono font-semibold">
                  {movement.reference_no}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {movement.notes && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Notes
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {movement.notes}
              </p>
            </div>
          )}

          {/* Movement Details */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Movement Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-500">
                  Movement Date:
                </span>
                <span className="font-semibold">
                  {formatDate(movement.movement_date)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-500">Created By:</span>
                <span className="font-semibold">{movement.created_by}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
