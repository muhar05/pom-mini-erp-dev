"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Calendar } from "lucide-react";
import Link from "next/link";

interface OpportunityRelatedDataProps {
  opportunityId: string;
}

// Mock data - replace with actual API calls
const mockQuotations = [
  {
    id: "QT-001",
    quotation_no: "QT-001",
    customer_name: "PT. ABC",
    status: "Open",
    total_amount: 20000000,
    created_at: "2025-12-10",
  },
];

const mockActivities = [
  {
    id: "1",
    date: "2025-12-13",
    type: "Call",
    description: "Follow up call with customer",
    user: "Sales 1",
  },
  {
    id: "2",
    date: "2025-12-12",
    type: "Email",
    description: "Sent proposal document",
    user: "Sales 1",
  },
];

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function OpportunityRelatedData({
  opportunityId,
}: OpportunityRelatedDataProps) {
  return (
    <div className="space-y-6">
      {/* Related Quotations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Quotations ({mockQuotations.length})
          </CardTitle>
          <Link href={`/crm/quotations?opportunity=${opportunityId}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {mockQuotations.length > 0 ? (
            <div className="space-y-3">
              {mockQuotations.map((qt) => (
                <div
                  key={qt.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{qt.quotation_no}</p>
                    <p className="text-sm text-gray-600">{qt.customer_name}</p>
                    <p className="text-sm font-medium mt-1">
                      {qt.total_amount.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(qt.status)}>
                    {qt.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No quotations created yet</p>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Recent Activities ({mockActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{activity.type}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
