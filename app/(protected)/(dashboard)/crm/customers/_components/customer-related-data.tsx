"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, DollarSign, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface CustomerRelatedDataProps {
  customerId: string;
}

// Mock data - replace with actual API calls
const mockOpportunities = [
  {
    id: "OPP-001",
    title: "Website Development Project",
    status: "Prospecting",
    value: 50000000,
    created_at: "2025-12-01",
  },
  {
    id: "OPP-002",
    title: "Mobile App Development",
    status: "Proposal",
    value: 75000000,
    created_at: "2025-12-05",
  },
];

const mockQuotations = [
  {
    id: "SQ-001",
    title: "Software License Quotation",
    status: "Sent",
    value: 25000000,
    created_at: "2025-12-03",
  },
];

const mockSalesOrders = [
  {
    id: "SO-001",
    title: "Annual Software License",
    status: "Confirmed",
    value: 100000000,
    created_at: "2025-11-15",
  },
];

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "prospecting":
      return "bg-blue-100 text-blue-800";
    case "proposal":
      return "bg-orange-100 text-orange-800";
    case "sent":
      return "bg-purple-100 text-purple-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function CustomerRelatedData({
  customerId,
}: CustomerRelatedDataProps) {
  return (
    <div className="space-y-6">
      {/* Opportunities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Opportunities ({mockOpportunities.length})
          </CardTitle>
          <Link href={`/crm/opportunities?customer=${customerId}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {mockOpportunities.length > 0 ? (
            <div className="space-y-3">
              {mockOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{opp.id}</p>
                    <p className="text-sm text-gray-600">{opp.title}</p>
                    <p className="text-xs text-gray-500">
                      Created: {opp.created_at}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(opp.status)}>
                      {opp.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">
                      {opp.value.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No opportunities found</p>
          )}
        </CardContent>
      </Card>

      {/* Quotations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Quotations ({mockQuotations.length})
          </CardTitle>
          <Link href={`/crm/quotations?customer=${customerId}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {mockQuotations.length > 0 ? (
            <div className="space-y-3">
              {mockQuotations.map((quot) => (
                <div
                  key={quot.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{quot.id}</p>
                    <p className="text-sm text-gray-600">{quot.title}</p>
                    <p className="text-xs text-gray-500">
                      Created: {quot.created_at}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(quot.status)}>
                      {quot.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">
                      {quot.value.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No quotations found</p>
          )}
        </CardContent>
      </Card>

      {/* Sales Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Sales Orders ({mockSalesOrders.length})
          </CardTitle>
          <Link href={`/crm/sales-orders?customer=${customerId}`}>
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
                    <p className="font-medium text-sm">{so.id}</p>
                    <p className="text-sm text-gray-600">{so.title}</p>
                    <p className="text-xs text-gray-500">
                      Created: {so.created_at}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(so.status)}>
                      {so.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">
                      {so.value.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No sales orders found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
