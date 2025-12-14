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
  Mail,
  Calendar,
  DollarSign,
  Building2,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import OpportunityRelatedData from "../_components/opportunity-related-data";

// Mock data - replace with actual API call
const mockOpportunity = {
  id: "1",
  opportunity_no: "OPP-001",
  customer_name: "PT. ABC",
  customer_email: "abc@email.com",
  sales_pic: "Sales 1",
  type: "Perusahaan",
  company: "PT. ABC",
  potential_value: 10000000,
  stage: "Qualified",
  status: "Open",
  created_at: "2025-12-10",
  updated_at: "2025-12-11",
  expected_close_date: "2025-12-31",
  notes: "High potential customer for Q4 2025",
};

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "in progress":
      return "bg-yellow-100 text-yellow-800";
    case "closed won":
      return "bg-green-100 text-green-800";
    case "closed lost":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStageBadgeClass(stage: string): string {
  switch (stage?.toLowerCase()) {
    case "prospecting":
      return "bg-purple-100 text-purple-800";
    case "qualified":
      return "bg-blue-100 text-blue-800";
    case "proposal":
      return "bg-yellow-100 text-yellow-800";
    case "negotiation":
      return "bg-orange-100 text-orange-800";
    case "won":
      return "bg-green-100 text-green-800";
    case "lost":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState(mockOpportunity);

  // TODO: Fetch opportunity detail by id
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching opportunity with id:", id);
    setOpportunity({ ...mockOpportunity, id: id as string });
  }, [id]);

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete opportunity:", id);
    router.push("/crm/opportunities");
  };

  const canConvertToQuotation = opportunity.stage.toLowerCase() === "qualified";

  return (
    <>
      <DashboardBreadcrumb
        title={`Opportunity - ${opportunity.opportunity_no}`}
        text="View opportunity details"
      />
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {opportunity.opportunity_no}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Opportunity Details
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Badge className={getStatusBadgeClass(opportunity.status)}>
                  {opportunity.status}
                </Badge>
                <Badge className={getStageBadgeClass(opportunity.stage)}>
                  {opportunity.stage}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Action Buttons */}
            <div className="flex gap-2 mb-6 pb-6 border-b">
              <Link href={`/crm/opportunities/${opportunity.id}/edit`}>
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
              {canConvertToQuotation && (
                <Link
                  href={`/crm/quotations/new?opportunity_id=${opportunity.id}`}
                >
                  <Button
                    size="sm"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <FileText className="w-4 h-4" />
                    Create Quotation
                  </Button>
                </Link>
              )}
            </div>

            {/* Opportunity Information */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Opportunity Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Opportunity Number
                      </p>
                      <p className="font-medium">
                        {opportunity.opportunity_no}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Stage</p>
                      <Badge className={getStageBadgeClass(opportunity.stage)}>
                        {opportunity.stage}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-medium">{opportunity.customer_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Customer Email</p>
                      <p className="font-medium">
                        {opportunity.customer_email || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Customer Type</p>
                      <p className="font-medium">{opportunity.type}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">
                        {opportunity.company || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Sales PIC</p>
                      <p className="font-medium">
                        {opportunity.sales_pic || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Potential Value</p>
                      <p className="font-medium text-lg">
                        {opportunity.potential_value.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </p>
                    </div>
                  </div>

                  {opportunity.expected_close_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">
                          Expected Close Date
                        </p>
                        <p className="font-medium">
                          {formatDate(opportunity.expected_close_date)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">
                        {formatDate(opportunity.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {opportunity.notes && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Notes</h3>
                  <p className="text-gray-700">{opportunity.notes}</p>
                </div>
              )}

              {/* Related Data */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Related Data</h3>
                <OpportunityRelatedData opportunityId={opportunity.id} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
