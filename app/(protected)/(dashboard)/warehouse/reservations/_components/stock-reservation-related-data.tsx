"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  ShoppingBag,
  Package,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import Link from "next/link";

interface StockReservationRelatedDataProps {
  stockReservationId: string;
}

// Mock data - replace with actual API calls
const mockSalesOrder = {
  id: "SO-001",
  so_no: "SO-001",
  customer_name: "PT. ABC Technology",
  total_amount: 50000000,
  status: "Confirmed",
};

const mockReservedItems = [
  {
    id: "1",
    item_name: "Laptop Dell Inspiron 15",
    item_code: "LPT-001",
    reserved_qty: 10,
    available_stock: 50,
    warehouse_location: "A-01-05",
    unit: "pcs",
  },
  {
    id: "2",
    item_name: "Mouse Wireless Logitech",
    item_code: "MSE-002",
    reserved_qty: 15,
    available_stock: 100,
    warehouse_location: "B-03-12",
    unit: "pcs",
  },
];

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function StockReservationRelatedData({
  stockReservationId,
}: StockReservationRelatedDataProps) {
  return (
    <div className="space-y-6">
      {/* Source Sales Order */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
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

      {/* Reserved Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Reserved Items ({mockReservedItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockReservedItems.map((item) => (
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
                    <p className="text-gray-600 text-xs">Reserved</p>
                    <p className="font-medium text-blue-600">
                      {item.reserved_qty}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Available</p>
                    <p className="font-medium text-green-600">
                      {item.available_stock}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Location</p>
                    <p className="font-medium">{item.warehouse_location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <WarehouseIcon className="w-4 h-4" />
            Stock Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Total Reserved</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockReservedItems.reduce(
                  (sum, item) => sum + item.reserved_qty,
                  0
                )}
              </p>
              <p className="text-xs text-gray-600">units</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Total Available</p>
              <p className="text-2xl font-bold text-green-600">
                {mockReservedItems.reduce(
                  (sum, item) => sum + item.available_stock,
                  0
                )}
              </p>
              <p className="text-xs text-gray-600">units</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
