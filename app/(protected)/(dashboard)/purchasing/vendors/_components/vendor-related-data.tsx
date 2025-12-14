"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface VendorRelatedDataProps {
  vendorId: string;
}

// Mock data - replace with actual API calls
const mockPurchaseOrders = [
  {
    id: "PO-001",
    po_no: "PO-001",
    pr_no: "PR-001",
    status: "Open",
    total_amount: 25000000,
    order_date: "2025-12-13",
    delivery_date: "2025-12-25",
  },
  {
    id: "PO-002",
    po_no: "PO-002",
    pr_no: "PR-002",
    status: "Confirmed",
    total_amount: 15000000,
    order_date: "2025-12-10",
    delivery_date: "2025-12-20",
  },
  {
    id: "PO-003",
    po_no: "PO-003",
    pr_no: "PR-003",
    status: "Received",
    total_amount: 30000000,
    order_date: "2025-12-08",
    delivery_date: "2025-12-18",
  },
];

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "open":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "received":
      return "bg-purple-100 text-purple-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function VendorRelatedData({
  vendorId,
}: VendorRelatedDataProps) {
  const totalValue = mockPurchaseOrders.reduce(
    (sum, po) => sum + po.total_amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Purchase Orders Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Purchase Orders ({mockPurchaseOrders.length})
          </CardTitle>
          <Link href={`/purchasing/purchase-orders?vendor=${vendorId}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-green-600">
              {totalValue.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </p>
          </div>
          {mockPurchaseOrders.length > 0 ? (
            <div className="space-y-3">
              {mockPurchaseOrders.map((po) => (
                <div
                  key={po.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <Link
                      href={`/purchasing/purchase-orders/${po.id}`}
                      className="font-medium text-sm text-blue-600 hover:underline"
                    >
                      {po.po_no}
                    </Link>
                    <p className="text-xs text-gray-600">
                      Ref: {po.pr_no} • {po.order_date}
                    </p>
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
