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
  ShoppingBag,
  Clock,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import StockReservationRelatedData from "../_components/stock-reservation-related-data";

// Mock data - replace with actual API call
const mockStockReservation = {
  id: "1",
  sr_no: "SR-001",
  so_no: "SO-001",
  customer_name: "PT. ABC Technology",
  reserved_by: "John Doe",
  warehouse: "Main Warehouse",
  items_count: 5,
  total_qty: 25,
  reservation_date: "2025-12-10",
  expiry_date: "2025-12-20",
  status: "Reserved",
  created_at: "2025-12-10",
  updated_at: "2025-12-10",
  notes: "Urgent reservation for priority customer",
};

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "reserved":
      return "bg-blue-100 text-blue-800";
    case "fulfilled":
      return "bg-green-100 text-green-800";
    case "partially fulfilled":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "expired":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-purple-100 text-purple-800";
  }
}

export default function StockReservationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [stockReservation, setStockReservation] =
    useState(mockStockReservation);

  // TODO: Fetch stock reservation detail by id
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching stock reservation with id:", id);
    setStockReservation({ ...mockStockReservation, id: id as string });
  }, [id]);

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete stock reservation:", id);
    router.push("/warehouse/reservations");
  };

  const canFulfill = stockReservation.status.toLowerCase() === "reserved";

  return (
    <>
      <DashboardBreadcrumb
        title={`Stock Reservation - ${stockReservation.sr_no}`}
        text="View stock reservation details"
      />
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {stockReservation.sr_no}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Stock Reservation Details
                </p>
              </div>
              <Badge className={getStatusBadgeClass(stockReservation.status)}>
                {stockReservation.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Action Buttons */}
            <div className="flex gap-2 mb-6">
              <Link
                href={`/warehouse/reservations/${stockReservation.id}/edit`}
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
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
              {canFulfill && (
                <Button
                  size="sm"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Package className="w-4 h-4" />
                  Fulfill Reservation
                </Button>
              )}
            </div>

            {/* Stock Reservation Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">
                  Reservation Information
                </h3>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">SR Number</p>
                    <p className="font-medium">{stockReservation.sr_no}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShoppingBag className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">SO Reference</p>
                    <Link
                      href={`/crm/sales-orders/${stockReservation.so_no}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {stockReservation.so_no}
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">
                      {stockReservation.customer_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Reserved By</p>
                    <p className="font-medium">
                      {stockReservation.reserved_by}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <WarehouseIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Warehouse</p>
                    <p className="font-medium">{stockReservation.warehouse}</p>
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
                      {stockReservation.items_count} items
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Total Quantity</p>
                    <p className="font-medium text-lg">
                      {stockReservation.total_qty} units
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Reservation Date</p>
                    <p className="font-medium">
                      {formatDate(stockReservation.reservation_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="font-medium">
                      {formatDate(stockReservation.expiry_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">
                      {formatDate(stockReservation.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {formatDate(stockReservation.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {stockReservation.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-2">Notes</h3>
                <p className="text-gray-600">{stockReservation.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Data */}
        <div className="mt-6">
          <StockReservationRelatedData
            stockReservationId={stockReservation.id}
          />
        </div>
      </div>
    </>
  );
}
