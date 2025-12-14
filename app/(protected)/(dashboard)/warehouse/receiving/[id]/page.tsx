"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import GoodsReceiptRelatedData from "../_components/goods-receipt-related-data";

// Mock data - replace with actual API call
const mockGoodsReceipt = {
  id: "1",
  gr_no: "GR-001",
  po_no: "PO-001",
  vendor_name: "PT. Supplier Tech",
  receiver_name: "John Doe",
  warehouse: "Main Warehouse",
  items_count: 5,
  total_qty: 50,
  receipt_date: "2025-12-10",
  delivery_note: "DN-001",
  status: "Received",
  created_at: "2025-12-10",
  updated_at: "2025-12-10",
  notes: "All items in good condition",
};

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

export default function GoodsReceiptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [goodsReceipt, setGoodsReceipt] = useState(mockGoodsReceipt);

  // TODO: Fetch goods receipt detail by id
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching goods receipt with id:", id);
    setGoodsReceipt({ ...mockGoodsReceipt, id: id as string });
  }, [id]);

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete goods receipt:", id);
    router.push("/warehouse/receiving");
  };

  const canComplete =
    goodsReceipt.status.toLowerCase() === "received" ||
    goodsReceipt.status.toLowerCase() === "quality check";

  return (
    <>
      <DashboardBreadcrumb
        title={`Goods Receipt - ${goodsReceipt.gr_no}`}
        text="View goods receipt details"
      />
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {goodsReceipt.gr_no}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Goods Receipt Details
                </p>
              </div>
              <Badge className={getStatusBadgeClass(goodsReceipt.status)}>
                {goodsReceipt.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
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
                onClick={handleDelete}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">
                  Receipt Information
                </h3>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">GR Number</p>
                    <p className="font-medium">{goodsReceipt.gr_no}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShoppingCart className="w-5 h-5 text-gray-400 mt-0.5" />
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

                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Vendor</p>
                    <p className="font-medium">{goodsReceipt.vendor_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Note</p>
                    <p className="font-medium">{goodsReceipt.delivery_note}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Received By</p>
                    <p className="font-medium">{goodsReceipt.receiver_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <WarehouseIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Warehouse</p>
                    <p className="font-medium">{goodsReceipt.warehouse}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">
                  Item & Date Information
                </h3>

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Total Items</p>
                    <p className="font-medium">
                      {goodsReceipt.items_count} items
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Total Quantity</p>
                    <p className="font-medium text-lg">
                      {goodsReceipt.total_qty} units
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Receipt Date</p>
                    <p className="font-medium">
                      {formatDate(goodsReceipt.receipt_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">
                      {formatDate(goodsReceipt.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {formatDate(goodsReceipt.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {goodsReceipt.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-2">Notes</h3>
                <p className="text-gray-600">{goodsReceipt.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Data */}
        <div className="mt-6">
          <GoodsReceiptRelatedData goodsReceiptId={goodsReceipt.id} />
        </div>
      </div>
    </>
  );
}
