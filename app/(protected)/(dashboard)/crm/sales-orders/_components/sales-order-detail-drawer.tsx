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
  Truck,
  CreditCard,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import SalesOrderRelatedData from "./sales-order-related-data";

type SalesOrder = {
  id: string;
  so_no: string;
  quotation_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  items_count: number;
  total_amount: number;
  payment_term: string;
  delivery_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface SalesOrderDetailDrawerProps {
  salesOrder: SalesOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function SalesOrderDetailDrawer({
  salesOrder,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: SalesOrderDetailDrawerProps) {
  if (!salesOrder) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {salesOrder.so_no}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                Sales Order Details
              </SheetDescription>
            </div>
            <Badge className={getStatusBadgeClass(salesOrder.status)}>
              {salesOrder.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link href={`/crm/sales-orders/${salesOrder.id}/edit`}>
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

        {/* Sales Order Information */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Order Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">SO Number</p>
                  <p className="font-medium">{salesOrder.so_no}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Quotation Reference</p>
                  <Link
                    href={`/crm/quotations/${salesOrder.quotation_no}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {salesOrder.quotation_no}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{salesOrder.customer_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer Email</p>
                  <p className="font-medium">
                    {salesOrder.customer_email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Sales PIC</p>
                  <p className="font-medium">{salesOrder.sales_pic || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="font-medium">{salesOrder.items_count} items</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">
                    {salesOrder.total_amount.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Payment Term</p>
                  <p className="font-medium">
                    {salesOrder.payment_term || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Delivery Date</p>
                  <p className="font-medium">
                    {formatDate(salesOrder.delivery_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {formatDate(salesOrder.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Update</p>
                  <p className="font-medium">
                    {formatDate(salesOrder.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Data */}
          <SalesOrderRelatedData salesOrderId={salesOrder.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
