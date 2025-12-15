"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  MapPin,
  Warehouse as WarehouseIcon,
  FileText,
  User,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Settings,
  Info,
  Hash,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";

const mockMovement = {
  id: "1",
  movement_type: "In",
  item_code: "ITM-001",
  item_name: "Laptop Dell XPS 13",
  sku: "DELL-XPS13-001",
  quantity: 10,
  unit: "pcs",
  warehouse: "Main Warehouse",
  location: "A1-B2-C3",
  reference_no: "PO-2025-001",
  reference_type: "Purchase Order",
  batch_no: "BATCH-001",
  notes: "Purchase from PT. Dell Indonesia",
  created_by: "John Doe",
  movement_date: "2025-12-14T10:30:00",
  status: "Completed",
};

function getMovementTypeInfo(type: string) {
  switch (type.toLowerCase()) {
    case "in":
      return {
        class: "bg-green-100 text-green-800",
        icon: ArrowDownCircle,
        label: "Stock In",
        color: "text-green-600",
        bg: "bg-green-50",
      };
    case "out":
      return {
        class: "bg-red-100 text-red-800",
        icon: ArrowUpCircle,
        label: "Stock Out",
        color: "text-red-600",
        bg: "bg-red-50",
      };
    case "transfer":
      return {
        class: "bg-blue-100 text-blue-800",
        icon: ArrowLeftRight,
        label: "Stock Transfer",
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    case "adjustment":
      return {
        class: "bg-yellow-100 text-yellow-800",
        icon: Settings,
        label: "Stock Adjustment",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    default:
      return {
        class: "bg-gray-100 text-gray-800",
        icon: Settings,
        label: type,
        color: "text-gray-600",
        bg: "bg-gray-50",
      };
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

export default function MovementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [movement, setMovement] = useState(mockMovement);

  useEffect(() => {
    setMovement({ ...mockMovement, id: id as string });
  }, [id]);

  const handleBack = () => {
    router.push("/warehouse/inventory/movements");
  };

  const typeInfo = getMovementTypeInfo(movement.movement_type);
  const TypeIcon = typeInfo.icon;

  return (
    <>
      <DashboardBreadcrumb
        title={`Movement Details - ${movement.reference_no}`}
        text="View detailed stock movement information"
      />

      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Movement History
        </Button>
      </div>

      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <TypeIcon className={`w-7 h-7 ${typeInfo.color}`} />
                  {typeInfo.label}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <span className="font-mono">{movement.reference_no}</span>
                  <span>•</span>
                  <span>{movement.reference_type}</span>
                  {movement.batch_no && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                        Batch: {movement.batch_no}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <Badge className={getStatusBadgeClass(movement.status)}>
                {movement.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Quantity Display */}
            <div className={`${typeInfo.bg} rounded-lg p-6 mb-8`}>
              <div className="flex items-center justify-center gap-4">
                <TypeIcon className={`w-12 h-12 ${typeInfo.color}`} />
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Quantity</div>
                  <div
                    className={`text-5xl font-bold ${
                      movement.quantity > 0
                        ? "text-green-600"
                        : movement.quantity < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {movement.quantity > 0 ? "+" : ""}
                    {movement.quantity}
                  </div>
                  <div className="text-lg font-medium text-gray-700 mt-1">
                    {movement.unit}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Item Information
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Item Code:</span>
                    <span className="font-medium">{movement.item_code}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Item Name:</span>
                    <span className="font-medium">{movement.item_name}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">SKU:</span>
                    <span className="font-mono font-medium">
                      {movement.sku}
                    </span>
                  </div>
                  {movement.batch_no && (
                    <div className="flex items-center gap-3 mb-2">
                      <Hash className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500 text-sm">Batch No:</span>
                      <span className="font-mono font-medium">
                        {movement.batch_no}
                      </span>
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Information
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <WarehouseIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Warehouse:</span>
                    <span className="font-medium">{movement.warehouse}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Location:</span>
                    <span className="font-mono font-medium">
                      {movement.location}
                    </span>
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Reference Information
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">
                      Reference Type:
                    </span>
                    <span className="font-medium">
                      {movement.reference_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Reference No:</span>
                    <span className="font-mono font-medium">
                      {movement.reference_no}
                    </span>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Movement Details
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">
                      Movement Date:
                    </span>
                    <span className="font-medium">
                      {formatDate(movement.movement_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Created By:</span>
                    <span className="font-medium">{movement.created_by}</span>
                  </div>
                </section>

                {movement.notes && (
                  <section>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Notes
                    </h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {movement.notes}
                    </p>
                  </section>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
