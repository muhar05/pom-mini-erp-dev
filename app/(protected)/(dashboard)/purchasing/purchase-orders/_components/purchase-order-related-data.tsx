"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Package, Truck } from "lucide-react";
import Link from "next/link";

interface PurchaseOrderRelatedDataProps {
  purchaseOrderId: string;
}

// Mock data - replace with actual API calls
const mockPurchaseRequest = {
  id: "PR-001",
  pr_no: "PR-001",
  so_no: "SO-001",
  requested_by: "John Doe",
  status: "Converted to PO",
  total_amount: 25000000,
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

const mockGoodsReceipts = [
  {
    id: "GR-001",
    gr_no: "GR-001",
    status: "Completed",
    received_date: "2025-12-14",
    items: 5,
  },
];

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "converted to po":
      return "bg-purple-100 text-purple-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function PurchaseOrderRelatedData({
  purchaseOrderId,
}: PurchaseOrderRelatedDataProps) {
  return (
    <div className="space-y-6">
      {/* Source Purchase Request */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Source Purchase Request
          </CardTitle>
          <Link
            href={`/purchasing/purchase-requests/${mockPurchaseRequest.id}`}
          >
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium text-sm">{mockPurchaseRequest.pr_no}</p>
              <p className="text-sm text-gray-600">
                SO: {mockPurchaseRequest.so_no} • By:{" "}
                {mockPurchaseRequest.requested_by}
              </p>
              <p className="text-sm font-medium mt-1">
                {mockPurchaseRequest.total_amount.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </p>
            </div>
            <Badge className={getStatusColor(mockPurchaseRequest.status)}>
              {mockPurchaseRequest.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Ordered Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Ordered Items ({mockItems.length})
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

      {/* Goods Receipts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Goods Receipts ({mockGoodsReceipts.length})
          </CardTitle>
          <Link href={`/warehouse/goods-receipts?po=${purchaseOrderId}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {mockGoodsReceipts.length > 0 ? (
            <div className="space-y-3">
              {mockGoodsReceipts.map((gr) => (
                <div
                  key={gr.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{gr.gr_no}</p>
                    <p className="text-sm text-gray-600">
                      {gr.items} items - Received: {gr.received_date}
                    </p>
                  </div>
                  <Badge className={getStatusColor(gr.status)}>
                    {gr.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No goods receipts recorded yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
