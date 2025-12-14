"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Info,
  MapPin,
  Warehouse as WarehouseIcon,
  BarChart3,
  DollarSign,
  Truck,
  Calendar,
  ArrowLeft,
  Tag,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Package,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";

const mockStock = {
  id: "1",
  item_code: "ITM-001",
  item_name: "Laptop Dell XPS 13",
  category: "Electronics",
  sku: "DELL-XPS13-001",
  warehouse: "Main Warehouse",
  location: "A1-B2-C3",
  current_stock: 25,
  reserved_stock: 5,
  available_stock: 20,
  unit: "pcs",
  unit_cost: 15000000,
  total_value: 375000000,
  min_stock: 10,
  max_stock: 50,
  reorder_point: 15,
  last_updated: "2025-12-14",
  status: "Active",
  supplier: "PT. Dell Indonesia",
  batch_no: "BATCH-001",
  expiry_date: null,
};

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "low stock":
      return "bg-yellow-100 text-yellow-800";
    case "out of stock":
      return "bg-red-100 text-red-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

function getStockLevelInfo(stock: typeof mockStock) {
  if (stock.current_stock === 0) {
    return {
      label: "Out of Stock",
      color: "text-red-600",
      bg: "bg-red-50",
      icon: AlertTriangle,
    };
  } else if (stock.current_stock <= stock.reorder_point) {
    return {
      label: "Low Stock",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      icon: TrendingDown,
    };
  } else {
    return {
      label: "In Stock",
      color: "text-green-600",
      bg: "bg-green-50",
      icon: TrendingUp,
    };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [stock, setStock] = useState(mockStock);

  useEffect(() => {
    setStock({ ...mockStock, id: id as string });
  }, [id]);

  const handleBack = () => {
    router.push("/warehouse/inventory/stocks");
  };

  const stockLevel = getStockLevelInfo(stock);
  const StockLevelIcon = stockLevel.icon;

  return (
    <>
      <DashboardBreadcrumb
        title={`Stock Details - ${stock.item_name}`}
        text="View detailed stock information"
      />

      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stock List
        </Button>
      </div>

      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Package className="w-7 h-7 text-blue-500" />
                  {stock.item_name}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <span className="font-mono">{stock.item_code}</span>
                  <span>•</span>
                  <span className="font-mono">{stock.sku}</span>
                  {stock.batch_no && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                        Batch: {stock.batch_no}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusBadgeClass(stock.status)}>
                  {stock.status}
                </Badge>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${stockLevel.bg} ${stockLevel.color}`}
                >
                  <StockLevelIcon className="w-4 h-4" />
                  {stockLevel.label}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Item & Location */}
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Item Information
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <Tag className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Category:</span>
                    <span className="font-medium">{stock.category}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <WarehouseIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Warehouse:</span>
                    <span className="font-medium">{stock.warehouse}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Location:</span>
                    <span className="font-mono font-medium">
                      {stock.location}
                    </span>
                  </div>
                  {stock.expiry_date && (
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500 text-sm">
                        Expiry Date:
                      </span>
                      <span className="font-medium">
                        {formatDate(stock.expiry_date)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Supplier:</span>
                    <span className="font-medium">{stock.supplier}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <Layers className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 text-sm">Unit:</span>
                    <span className="font-medium">{stock.unit}</span>
                  </div>
                </section>
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Last Updated
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm">Last Updated:</span>
                    <span className="font-medium">
                      {formatDate(stock.last_updated)}
                    </span>
                  </div>
                </section>
              </div>
              {/* Right: Stock & Financial */}
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Stock Levels
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {stock.current_stock}
                      </div>
                      <div className="text-xs text-gray-500">Current</div>
                    </div>
                    <div className="rounded-lg bg-orange-50 p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {stock.reserved_stock}
                      </div>
                      <div className="text-xs text-gray-500">Reserved</div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3 text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {stock.available_stock}
                      </div>
                      <div className="text-xs text-gray-500">Available</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>
                      <span className="font-semibold">{stock.min_stock}</span>{" "}
                      Min
                    </span>
                    <span>
                      <span className="font-semibold">{stock.max_stock}</span>{" "}
                      Max
                    </span>
                    <span>
                      <span className="font-semibold">
                        {stock.reorder_point}
                      </span>{" "}
                      Reorder
                    </span>
                  </div>
                </section>
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-500 text-sm">Unit Cost:</span>
                    <span className="font-semibold">
                      {formatCurrency(stock.unit_cost)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-500 text-sm">Total Value:</span>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(stock.total_value)}
                    </span>
                  </div>
                </section>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
