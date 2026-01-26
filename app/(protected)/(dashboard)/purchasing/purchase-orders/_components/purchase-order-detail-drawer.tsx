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
  Mail,
  Calendar,
  Package,
  DollarSign,
  Building2,
  CreditCard,
  Truck,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import PurchaseOrderRelatedData from "./purchase-order-related-data";

type PurchaseOrder = {
  id: string;
  po_no: string;
  pr_id?: string | null;
  user_id?: number | null;
  supplier_id?: string | null;
  assigned_to?: number | null;
  po_detail_items: any[];
  total: number;
  status: string;
  created_at: string;
  supplier?: {
    supplier_name: string;
    email?: string | null;
    phone?: string | null;
  } | null;
  vendor_name?: string; // For compatibility with table mapping
  total_amount?: number; // For compatibility with table mapping
};

interface PurchaseOrderDetailDrawerProps {
  purchaseOrder: PurchaseOrder | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRefresh?: () => Promise<void>;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "received":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function PurchaseOrderDetailDrawer({
  purchaseOrder,
  open,
  onClose,
  onEdit,
  onDelete,
}: PurchaseOrderDetailDrawerProps) {
  if (!purchaseOrder) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {purchaseOrder.po_no}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                Purchase Order Details
              </SheetDescription>
            </div>
            <Badge className={getStatusBadgeClass(purchaseOrder.status)}>
              {purchaseOrder.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link href={`/purchasing/purchase-orders/${purchaseOrder.id}/edit`}>
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
        </div>

        {/* Purchase Order Information */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Order Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">PO Number</p>
                  <p className="font-medium">{purchaseOrder.po_no}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">PR Reference</p>
                  <Link
                    href={`/purchasing/purchase-requests/${purchaseOrder.pr_id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {purchaseOrder.pr_id || "-"}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Vendor Name</p>
                  <p className="font-medium">{purchaseOrder.vendor_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Vendor Email</p>
                  <p className="font-medium">
                    {purchaseOrder.supplier?.email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">
                    {purchaseOrder.supplier?.phone || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="font-medium">
                    {purchaseOrder.po_detail_items?.length || 0} items
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">
                    {(purchaseOrder.total || 0).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {formatDate(purchaseOrder.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {formatDate(purchaseOrder.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Data */}
          <PurchaseOrderRelatedData purchaseOrderId={purchaseOrder.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
