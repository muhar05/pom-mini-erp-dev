"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface GoodsReceiptRelatedDataProps {
  goodsReceiptId: string;
}

// Mock data - replace with actual API calls
const mockPurchaseOrder = {
  id: "PO-001",
  po_no: "PO-001",
  vendor_name: "PT. Supplier Tech",
  vendor_contact: "sales@suppliertech.com",
  total_amount: 50000000,
  status: "Received",
  order_date: "2025-12-08",
};

const mockReceivedItems = [
  {
    id: "1",
    item_name: "Laptop Dell Inspiron 15",
    item_code: "LPT-001",
    ordered_qty: 10,
    received_qty: 10,
    rejected_qty: 0,
    unit: "pcs",
    condition: "Good",
  },
  {
    id: "2",
    item_name: "Mouse Wireless Logitech",
    item_code: "MSE-002",
    ordered_qty: 20,
    received_qty: 18,
    rejected_qty: 2,
    unit: "pcs",
    condition: "2 units damaged",
  },
];

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "received":
      return "bg-purple-100 text-purple-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function GoodsReceiptRelatedData({
  goodsReceiptId,
}: GoodsReceiptRelatedDataProps) {
  const totalOrdered = mockReceivedItems.reduce(
    (sum, item) => sum + item.ordered_qty,
    0
  );
  const totalReceived = mockReceivedItems.reduce(
    (sum, item) => sum + item.received_qty,
    0
  );
  const totalRejected = mockReceivedItems.reduce(
    (sum, item) => sum + item.rejected_qty,
    0
  );

  return (
    <div className="space-y-6">
      {/* Source Purchase Order */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Source Purchase Order
          </CardTitle>
          <Link href={`/purchasing/purchase-orders/${mockPurchaseOrder.id}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{mockPurchaseOrder.po_no}</p>
                <p className="text-xs text-gray-600">
                  Order Date: {mockPurchaseOrder.order_date}
                </p>
              </div>
              <Badge className={getStatusColor(mockPurchaseOrder.status)}>
                {mockPurchaseOrder.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  {mockPurchaseOrder.vendor_name}
                </p>
                <p className="text-xs text-gray-600">
                  {mockPurchaseOrder.vendor_contact}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">
                {mockPurchaseOrder.total_amount.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Received Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Received Items ({mockReceivedItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockReceivedItems.map((item) => (
              <div key={item.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.item_name}</p>
                    <p className="text-xs text-gray-600">
                      Code: {item.item_code}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.unit}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">Ordered</p>
                    <p className="font-medium text-blue-600">
                      {item.ordered_qty}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Received
                    </p>
                    <p className="font-medium text-green-600">
                      {item.received_qty}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </p>
                    <p className="font-medium text-red-600">
                      {item.rejected_qty}
                    </p>
                  </div>
                </div>
                {item.condition && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      Condition: {item.condition}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Receipt Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Receipt Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Total Ordered</p>
              <p className="text-2xl font-bold text-blue-600">{totalOrdered}</p>
              <p className="text-xs text-gray-600">units</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-green-600">
                {totalReceived}
              </p>
              <p className="text-xs text-gray-600">units</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-gray-600">Total Rejected</p>
              <p className="text-2xl font-bold text-red-600">{totalRejected}</p>
              <p className="text-xs text-gray-600">units</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Receipt Completion</p>
              <p className="text-sm font-bold">
                {((totalReceived / totalOrdered) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${(totalReceived / totalOrdered) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
