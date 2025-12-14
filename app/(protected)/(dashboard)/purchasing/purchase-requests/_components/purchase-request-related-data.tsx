"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";

interface PurchaseRequestRelatedDataProps {
  purchaseRequestId: string;
}

// Mock data - replace with actual API calls
const mockSalesOrder = {
  id: "SO-001",
  so_no: "SO-001",
  customer_name: "PT. ABC Technology",
  total_amount: 50000000,
  status: "Open",
};

const mockItems = [
  {
    id: "1",
    item_name: "Laptop Dell Inspiron 15",
    quantity: 5,
    unit_price: 8000000,
    total_price: 40000000,
  },
  {
    id: "2",
    item_name: "Mouse Wireless Logitech",
    quantity: 10,
    unit_price: 150000,
    total_price: 1500000,
  },
];

const mockPurchaseOrders = [
  {
    id: "PO-001",
    po_no: "PO-001",
    vendor_name: "PT. Supplier Tech",
    status: "Open",
    total_amount: 25000000,
    created_at: "2025-12-14",
  },
];

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "open":
      return "bg-blue-100 text-blue-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function PurchaseRequestRelatedData({
  purchaseRequestId,
}: PurchaseRequestRelatedDataProps) {
  return (
    <div className="space-y-6">
      {/* Source Sales Order */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Source Sales Order
          </CardTitle>
          <Link href={`/crm/sales-orders/${mockSalesOrder.id}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium text-sm">{mockSalesOrder.so_no}</p>
              <p className="text-sm text-gray-600">
                {mockSalesOrder.customer_name}
              </p>
              <p className="text-sm font-medium mt-1">
                {mockSalesOrder.total_amount.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </p>
            </div>
            <Badge className={getStatusColor(mockSalesOrder.status)}>
              {mockSalesOrder.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Requested Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Requested Items ({mockItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.item_name}</p>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} ×{" "}
                    {item.unit_price.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>
                <p className="font-medium text-sm">
                  {item.total_price.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Purchase Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Purchase Orders ({mockPurchaseOrders.length})
          </CardTitle>
          <Link href={`/purchasing/purchase-orders?pr=${purchaseRequestId}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {mockPurchaseOrders.length > 0 ? (
            <div className="space-y-3">
              {mockPurchaseOrders.map((po) => (
                <div
                  key={po.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{po.po_no}</p>
                    <p className="text-sm text-gray-600">{po.vendor_name}</p>
                    <p className="text-sm font-medium mt-1">
                      {po.total_amount.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(po.status)}>
                    {po.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No purchase orders created yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
