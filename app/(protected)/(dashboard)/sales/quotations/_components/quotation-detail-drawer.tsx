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
  ShoppingBag,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import QuotationRelatedData from "./quotation-related-data";

type Quotation = {
  id: string;
  quotation_no: string;
  opportunity_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  valid_until?: string;
};

interface QuotationDetailDrawerProps {
  quotation: Quotation | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "expired":
      return "bg-gray-100 text-gray-800";
    case "converted to so":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

export default function QuotationDetailDrawer({
  quotation,
  open,
  onClose,
  onEdit,
  onDelete,
}: QuotationDetailDrawerProps) {
  if (!quotation) return null;

  const canConvertToSO = quotation.status.toLowerCase() === "confirmed";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {quotation.quotation_no}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                Quotation Details
              </SheetDescription>
            </div>
            <Badge className={getStatusBadgeClass(quotation.status)}>
              {quotation.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link href={`/crm/quotations/${quotation.id}/edit`}>
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
          {canConvertToSO && (
            <Link href={`/crm/sales-orders/new?quotation_id=${quotation.id}`}>
              <Button
                size="sm"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <ShoppingBag className="w-4 h-4" />
                Create SO
              </Button>
            </Link>
          )}
        </div>

        {/* Quotation Information */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">
              Quotation Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Quotation Number</p>
                  <p className="font-medium">{quotation.quotation_no}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Opportunity Reference</p>
                  <Link
                    href={`/crm/opportunities/${quotation.opportunity_no}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {quotation.opportunity_no}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{quotation.customer_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer Email</p>
                  <p className="font-medium">
                    {quotation.customer_email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer Type</p>
                  <p className="font-medium">{quotation.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{quotation.company || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Sales PIC</p>
                  <p className="font-medium">{quotation.sales_pic || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">
                    {quotation.total_amount.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>
              </div>

              {quotation.valid_until && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Valid Until</p>
                    <p className="font-medium">
                      {formatDate(quotation.valid_until)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {formatDate(quotation.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Data */}
          <QuotationRelatedData quotationId={quotation.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
