"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Warehouse as WarehouseIcon,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Tag,
  Truck,
  Info,
  BarChart3,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";

type Stock = {
  id: string;
  item_code: string;
  item_name: string;
  category: string;
  sku: string;
  warehouse: string;
  location: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  unit: string;
  unit_cost: number;
  total_value: number;
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  last_updated: string;
  status: string;
  supplier: string;
  batch_no: string | null;
  expiry_date: string | null;
};

interface StockDetailDrawerProps {
  stock: Stock | null;
  open: boolean;
  onClose: () => void;
}

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

function getStockLevelInfo(stock: Stock) {
  if (stock.current_stock === 0) {
    return {
      level: "Out of Stock",
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: AlertTriangle,
    };
  } else if (stock.current_stock <= stock.reorder_point) {
    return {
      level: "Low Stock",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      icon: TrendingDown,
    };
  } else {
    return {
      level: "In Stock",
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: TrendingUp,
    };
  }
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function StockDetailDrawer({
  stock,
  open,
  onClose,
}: StockDetailDrawerProps) {
  if (!stock) return null;

  const stockLevelInfo = getStockLevelInfo(stock);
  const StockIcon = stockLevelInfo.icon;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {stock.item_name}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                {stock.item_code} • {stock.sku}
              </SheetDescription>
            </div>
            <Badge className={getStatusBadgeClass(stock.status)}>
              {stock.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Stock Level Alert */}
        <div className={`${stockLevelInfo.bgColor} rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-3">
            <StockIcon className={`w-6 h-6 ${stockLevelInfo.color}`} />
            <div>
              <div className={`font-semibold ${stockLevelInfo.color}`}>
                {stockLevelInfo.level}
              </div>
              <div className="text-sm text-gray-600">
                Current: {stock.current_stock} {stock.unit} | Reorder Point:{" "}
                {stock.reorder_point} {stock.unit}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Item Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-500">Item Code</div>
                <div className="font-semibold">{stock.item_code}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">SKU</div>
                <div className="font-mono font-semibold">{stock.sku}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Category</div>
                <div className="font-semibold">{stock.category}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Unit</div>
                <div className="font-semibold">{stock.unit}</div>
              </div>
              {stock.batch_no && (
                <div>
                  <div className="font-medium text-gray-500">Batch No</div>
                  <div className="font-mono font-semibold">
                    {stock.batch_no}
                  </div>
                </div>
              )}
              {stock.expiry_date && (
                <div>
                  <div className="font-medium text-gray-500">Expiry Date</div>
                  <div className="font-semibold">
                    {formatDate(stock.expiry_date)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-500 flex items-center gap-2">
                  <WarehouseIcon className="w-4 h-4" />
                  Warehouse
                </div>
                <div className="font-semibold">{stock.warehouse}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">
                  Storage Location
                </div>
                <div className="font-mono font-semibold">{stock.location}</div>
              </div>
            </div>
          </div>

          {/* Stock Levels */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Stock Levels
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
                  <div className="text-2xl font-bold text-blue-600">
                    {stock.current_stock}
                  </div>
                  <div className="text-sm text-gray-500">Current Stock</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
                  <div className="text-2xl font-bold text-orange-600">
                    {stock.reserved_stock}
                  </div>
                  <div className="text-sm text-gray-500">Reserved</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
                  <div className="text-2xl font-bold text-green-600">
                    {stock.available_stock}
                  </div>
                  <div className="text-sm text-gray-500">Available</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-500">Min Stock</div>
                  <div className="font-semibold">
                    {stock.min_stock} {stock.unit}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-500">Reorder Point</div>
                  <div className="font-semibold">
                    {stock.reorder_point} {stock.unit}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-500">Max Stock</div>
                  <div className="font-semibold">
                    {stock.max_stock} {stock.unit}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-500">Unit Cost</div>
                <div className="font-semibold text-lg">
                  {formatCurrency(stock.unit_cost)}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Total Value</div>
                <div className="font-semibold text-lg text-green-600">
                  {formatCurrency(stock.total_value)}
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Supplier Information
            </h3>
            <div className="text-sm">
              <div className="font-medium text-gray-500">Supplier</div>
              <div className="font-semibold">{stock.supplier}</div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Last Updated
            </h3>
            <div className="text-sm">
              <div className="font-medium text-gray-500">Last Updated</div>
              <div className="font-semibold">
                {formatDate(stock.last_updated)}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
