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
  MapPin,
  Clock,
  Truck,
  MessageCircle,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import DeliveryRequestRelatedData from "./delivery-request-related-data";

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

interface DeliveryRequestDetailDrawerProps {
  deliveryRequest: DeliveryRequest | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-blue-100 text-blue-800";
    case "in progress":
      return "bg-purple-100 text-purple-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function DeliveryRequestDetailDrawer({
  deliveryRequest,
  open,
  onClose,
  onEdit,
  onDelete,
}: DeliveryRequestDetailDrawerProps) {
  if (!deliveryRequest) return null;

  const canEdit = ["pending", "approved"].includes(
    deliveryRequest.status.toLowerCase()
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {deliveryRequest.dr_no}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                Delivery Request Details
              </SheetDescription>
            </div>
            <Badge className={getStatusBadgeClass(deliveryRequest.status)}>
              {deliveryRequest.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link
            href={`/warehouse/delivery/requests/${deliveryRequest.id}/edit`}
          >
            <Button
              size="sm"
              className="flex items-center gap-2"
              disabled={!canEdit}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            className="flex items-center gap-2"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>

        {/* Basic Information */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-500">DR Number</div>
                <div className="font-semibold">{deliveryRequest.dr_no}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">SO Reference</div>
                <div className="font-semibold">{deliveryRequest.so_no}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">SR Reference</div>
                <div className="font-semibold">{deliveryRequest.sr_no}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Customer</div>
                <div className="font-semibold">
                  {deliveryRequest.customer_name}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Information
            </h3>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </div>
                <div className="font-semibold">
                  {deliveryRequest.delivery_address}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-gray-500">Delivery Type</div>
                  <div className="font-semibold">
                    {deliveryRequest.delivery_type}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-500">Warehouse</div>
                  <div className="font-semibold">
                    {deliveryRequest.warehouse}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Request Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-500">Requested By</div>
                <div className="font-semibold">
                  {deliveryRequest.requested_by}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Items Count</div>
                <div className="font-semibold">
                  {deliveryRequest.items_count}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Total Quantity</div>
                <div className="font-semibold">{deliveryRequest.total_qty}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Request Date</div>
                <div className="font-semibold">
                  {formatDate(deliveryRequest.request_date)}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Required Date</div>
                <div className="font-semibold">
                  {formatDate(deliveryRequest.required_date)}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {deliveryRequest.notes && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Notes
              </h3>
              <div className="text-sm">{deliveryRequest.notes}</div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timestamps
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-500">Created</div>
                <div>{formatDate(deliveryRequest.created_at)}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Last Updated</div>
                <div>{formatDate(deliveryRequest.updated_at)}</div>
              </div>
            </div>
          </div>

          {/* Related Data */}
          <DeliveryRequestRelatedData deliveryRequest={deliveryRequest} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
