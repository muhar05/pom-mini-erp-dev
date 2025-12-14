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
  DollarSign,
  Building2,
  ShoppingCart,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import PurchaseRequestRelatedData from "./purchase-request-related-data";

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

interface PurchaseRequestDetailDrawerProps {
  purchaseRequest: PurchaseRequest | null;
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
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "converted to po":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

export default function PurchaseRequestDetailDrawer({
  purchaseRequest,
  open,
  onClose,
  onEdit,
  onDelete,
}: PurchaseRequestDetailDrawerProps) {
  if (!purchaseRequest) return null;

  const canConvertToPO = purchaseRequest.status.toLowerCase() === "approved";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {purchaseRequest.pr_no}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                Purchase Request Details
              </SheetDescription>
            </div>
            <Badge className={getStatusBadgeClass(purchaseRequest.status)}>
              {purchaseRequest.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link
            href={`/purchasing/purchase-requests/${purchaseRequest.id}/edit`}
          >
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
          {canConvertToPO && (
            <Link
              href={`/purchasing/purchase-orders/new?pr_id=${purchaseRequest.id}`}
            >
              <Button
                size="sm"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="w-4 h-4" />
                Create PO
              </Button>
            </Link>
          )}
        </div>

        {/* Purchase Request Information */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Request Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">PR Number</p>
                  <p className="font-medium">{purchaseRequest.pr_no}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">SO Reference</p>
                  <Link
                    href={`/crm/sales-orders/${purchaseRequest.so_no}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {purchaseRequest.so_no}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Requested By</p>
                  <p className="font-medium">{purchaseRequest.requested_by}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{purchaseRequest.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="font-medium">
                    {purchaseRequest.items_count} items
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">
                    {purchaseRequest.total_amount.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Request Date</p>
                  <p className="font-medium">
                    {formatDate(purchaseRequest.request_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Required Date</p>
                  <p className="font-medium">
                    {formatDate(purchaseRequest.required_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {formatDate(purchaseRequest.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Data */}
          <PurchaseRequestRelatedData purchaseRequestId={purchaseRequest.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
