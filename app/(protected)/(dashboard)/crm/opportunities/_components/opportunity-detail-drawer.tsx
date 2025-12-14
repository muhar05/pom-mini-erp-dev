"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import OpportunityRelatedData from "./opportunity-related-data";

type Opportunity = {
  id: string;
  opportunity_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  potential_value: number;
  stage: string;
  status: string;
  created_at: string;
  updated_at: string;
  expected_close_date?: string;
};

interface OpportunityDetailDrawerProps {
  opportunity: Opportunity | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

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

export default function OpportunityDetailDrawer({
  opportunity,
  open,
  onClose,
  onEdit,
  onDelete,
}: OpportunityDetailDrawerProps) {
  if (!opportunity) return null;

  const canConvertToQuotation = opportunity.stage.toLowerCase() === "qualified";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {opportunity.opportunity_no}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                Opportunity Details
              </SheetDescription>
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
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
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
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          {canConvertToQuotation && (
            <Link href={`/crm/quotations/new?opportunity_id=${opportunity.id}`}>
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
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Opportunity Number</p>
                  <p className="font-medium">{opportunity.opportunity_no}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Stage</p>
                  <Badge className={getStageBadgeClass(opportunity.stage)}>
                    {opportunity.stage}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{opportunity.customer_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer Email</p>
                  <p className="font-medium">
                    {opportunity.customer_email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer Type</p>
                  <p className="font-medium">{opportunity.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{opportunity.company || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Sales PIC</p>
                  <p className="font-medium">{opportunity.sales_pic || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
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
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Expected Close Date</p>
                    <p className="font-medium">
                      {formatDate(opportunity.expected_close_date)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {formatDate(opportunity.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Data */}
          <OpportunityRelatedData opportunityId={opportunity.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
