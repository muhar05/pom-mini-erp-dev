"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface QuotationRelatedDataProps {
  quotationId: string;
}

// Mock data - replace with actual API calls
const mockOpportunity = {
  id: "OPP-001",
  opportunity_no: "OPP-001",
  customer_name: "PT. ABC Technology",
  status: "Won",
  potential_value: 50000000,
};

const mockSalesOrders = [
  {
    id: "SO-001",
    so_no: "SO-001",
    customer_name: "PT. ABC Technology",
    status: "Open",
    total_amount: 50000000,
    created_at: "2025-12-13",
  },
];

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "won":
      return "bg-green-100 text-green-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "lost":
      return "bg-red-100 text-red-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function QuotationRelatedData({
  quotationId,
}: QuotationRelatedDataProps) {
  return (
    <div className="space-y-6">
      {/* Source Opportunity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Source Opportunity
          </CardTitle>
          <Link href={`/crm/opportunities/${mockOpportunity.id}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium text-sm">
                {mockOpportunity.opportunity_no}
              </p>
              <p className="text-sm text-gray-600">
                {mockOpportunity.customer_name}
              </p>
              <p className="text-sm font-medium mt-1">
                {mockOpportunity.potential_value.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </p>
            </div>
            <Badge className={getStatusColor(mockOpportunity.status)}>
              {mockOpportunity.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Related Sales Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Sales Orders ({mockSalesOrders.length})
          </CardTitle>
          <Link href={`/sales/sales-orders?quotation=${quotationId}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {mockSalesOrders.length > 0 ? (
            <div className="space-y-3">
              {mockSalesOrders.map((so) => (
                <div
                  key={so.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{so.so_no}</p>
                    <p className="text-sm text-gray-600">{so.customer_name}</p>
                    <p className="text-sm font-medium mt-1">
                      {so.total_amount.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(so.status)}>
                    {so.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No sales orders created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
