"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/utils/formatDate";
import {
  Package,
  Calendar,
  MapPin,
  FileText,
  DollarSign,
  TrendingDown,
  Building,
  User,
} from "lucide-react";

type FarData = {
  id: string;
  asset_code: string;
  asset_name: string;
  category: string;
  subcategory: string;
  purchase_date: string;
  invoice_no: string;
  sales_order_no: string;
  supplier_name: string;
  original_cost: number;
  accumulated_depreciation: number;
  net_book_value: number;
  depreciation_method: string;
  useful_life_years: number;
  monthly_depreciation: number;
  location: string;
  condition: string;
  status: string;
  remarks: string;
  created_at: string;
  updated_at: string;
};

interface FarDetailDrawerProps {
  farData: FarData | null;
  open: boolean;
  onClose: () => void;
}

export default function FarDetailDrawer({
  farData,
  open,
  onClose,
}: FarDetailDrawerProps) {
  if (!farData) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "disposed":
        return "destructive";
      case "maintenance":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getConditionBadgeVariant = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
        return "default";
      case "good":
        return "secondary";
      case "fair":
        return "outline";
      case "poor":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const deprecationPercentage = (
    (farData.accumulated_depreciation / farData.original_cost) *
    100
  ).toFixed(1);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {farData.asset_name}
          </SheetTitle>
          <SheetDescription>
            Asset Code: {farData.asset_code} • View fixed asset details and
            depreciation information
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Asset Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Asset Code</div>
                <div className="font-medium">{farData.asset_code}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Asset Name</div>
                <div className="font-medium">{farData.asset_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Category</div>
                <Badge variant="outline">{farData.category}</Badge>
              </div>
              <div>
                <div className="text-sm text-gray-500">Subcategory</div>
                <div className="font-medium">{farData.subcategory}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Purchase Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Purchase Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Invoice No</div>
                <div className="font-medium">{farData.invoice_no}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sales Order No</div>
                <div className="font-medium">{farData.sales_order_no}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Supplier</div>
                <div className="font-medium">{farData.supplier_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Purchase Date
                </div>
                <div className="font-medium">
                  {formatDate(farData.purchase_date)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financial Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Original Cost</div>
                <div className="font-medium text-lg">
                  {formatCurrency(farData.original_cost)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Net Book Value</div>
                <div className="font-medium text-lg text-green-600">
                  {formatCurrency(farData.net_book_value)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Accumulated Depreciation
                </div>
                <div className="font-medium text-red-600">
                  {formatCurrency(farData.accumulated_depreciation)}
                </div>
                <div className="text-xs text-gray-500">
                  {deprecationPercentage}% of original cost
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  Monthly Depreciation
                </div>
                <div className="font-medium">
                  {formatCurrency(farData.monthly_depreciation)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Depreciation Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Depreciation Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Depreciation Method</div>
                <div className="font-medium">{farData.depreciation_method}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Useful Life</div>
                <div className="font-medium">
                  {farData.useful_life_years} years
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location & Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Location & Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location
                </div>
                <div className="font-medium">{farData.location}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Condition</div>
                <Badge variant={getConditionBadgeVariant(farData.condition)}>
                  {farData.condition}
                </Badge>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">Status</div>
                <Badge variant={getStatusBadgeVariant(farData.status)}>
                  {farData.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Remarks */}
          {farData.remarks && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Remarks</h3>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm">{farData.remarks}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              System Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Created At</div>
                <div className="text-sm">{formatDate(farData.created_at)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-sm">{formatDate(farData.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
