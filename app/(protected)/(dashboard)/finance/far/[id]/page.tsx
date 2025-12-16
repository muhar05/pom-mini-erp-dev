"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/utils/formatDate";
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  FileText,
  DollarSign,
  TrendingDown,
  Building,
  User,
} from "lucide-react";

// Mock data for individual FAR - replace with actual API call
const mockFarData = {
  "1": {
    id: "1",
    asset_code: "FAR-001",
    asset_name: "Server Dell PowerEdge R740",
    category: "IT Equipment",
    subcategory: "Server",
    purchase_date: "2024-01-15",
    invoice_no: "INV-001",
    sales_order_no: "SO-001",
    supplier_name: "PT. Dell Indonesia",
    original_cost: 85000000,
    accumulated_depreciation: 10625000,
    net_book_value: 74375000,
    depreciation_method: "Straight Line",
    useful_life_years: 8,
    monthly_depreciation: 885417,
    location: "Data Center - Jakarta",
    condition: "Good",
    status: "Active",
    remarks: "Primary application server",
    created_at: "2024-01-15",
    updated_at: "2025-12-16",
  },
  // Add other mock data as needed...
};

export default function FarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const farId = params.id as string;

  // Get FAR data - replace with actual API call
  const farData = mockFarData[farId as keyof typeof mockFarData];

  if (!farData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Asset Not Found
        </h3>
        <p className="text-gray-500 mb-4">
          The requested fixed asset could not be found.
        </p>
        <Button onClick={() => router.push("/finance/far")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to FAR List
        </Button>
      </div>
    );
  }

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
    <>
      <DashboardBreadcrumb
        title={`FAR Detail - ${farData.asset_code}`}
        text={`View details for ${farData.asset_name}`}
      />

      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/finance/far")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to FAR List
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Purchase Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Purchase Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Location & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Location & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Remarks */}
          {farData.remarks && (
            <Card>
              <CardHeader>
                <CardTitle>Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm">{farData.remarks}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Original Cost</div>
                <div className="font-semibold text-lg">
                  {formatCurrency(farData.original_cost)}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Accumulated Depreciation
                </div>
                <div className="font-semibold text-red-600">
                  {formatCurrency(farData.accumulated_depreciation)}
                </div>
                <div className="text-xs text-gray-500">
                  {deprecationPercentage}% of original cost
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-gray-500">Net Book Value</div>
                <div className="font-semibold text-lg text-green-600">
                  {formatCurrency(farData.net_book_value)}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-gray-500">
                  Monthly Depreciation
                </div>
                <div className="font-semibold">
                  {formatCurrency(farData.monthly_depreciation)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Depreciation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Method</div>
                <div className="font-medium">{farData.depreciation_method}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Useful Life</div>
                <div className="font-medium">
                  {farData.useful_life_years} years
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Created At</div>
                <div className="text-sm">{formatDate(farData.created_at)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-sm">{formatDate(farData.updated_at)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
