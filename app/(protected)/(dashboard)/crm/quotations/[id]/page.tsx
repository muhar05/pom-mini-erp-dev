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
  ShoppingBag,
  Truck,
  Percent,
  Receipt,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import QuotationRelatedData from "../_components/quotation-related-data";

// Mock data - replace with actual API call
const mockQuotation = {
  id: "1",
  quotation_no: "QT-001",
  opportunity_no: "OPP-001",
  customer_name: "PT. XYZ",
  customer_email: "xyz@email.com",
  sales_pic: "Sales 1",
  type: "Perusahaan",
  company: "PT. XYZ",
  total_amount: 20000000,
  shipping: 500000,
  discount: 1000000,
  tax: 2000000,
  grand_total: 21500000,
  status: "Open",
  stage: "draft",
  target_date: "2025-12-31",
  top: "net30",
  created_at: "2025-12-10",
  updated_at: "2025-12-11",
  valid_until: "2025-12-31",
  notes: "Initial quotation for customer requirements",
};

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

function getStageBadgeClass(stage: string): string {
  switch (stage?.toLowerCase()) {
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "review":
      return "bg-blue-100 text-blue-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "sent":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function QuotationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState(mockQuotation);

  // TODO: Fetch quotation detail by id
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching quotation with id:", id);
    setQuotation({ ...mockQuotation, id: id as string });
  }, [id]);

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete quotation:", id);
    router.push("/crm/quotations");
  };

  const canConvertToSO = quotation.status.toLowerCase() === "confirmed";

  return (
    <>
      <DashboardBreadcrumb
        title={`Quotation - ${quotation.quotation_no}`}
        text="View quotation details"
      />
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {quotation.quotation_no}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Quotation Details</p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusBadgeClass(quotation.status)}>
                  {quotation.status}
                </Badge>
                {quotation.stage && (
                  <Badge className={getStageBadgeClass(quotation.stage)}>
                    {quotation.stage}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Action Buttons */}
            <div className="flex gap-2 mb-6 pb-6 border-b">
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
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
              {canConvertToSO && (
                <Link
                  href={`/crm/sales-orders/new?quotation_id=${quotation.id}`}
                >
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Quotation Number</p>
                      <p className="font-medium font-mono">
                        {quotation.quotation_no}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Opportunity Reference
                      </p>
                      <Link
                        href={`/crm/opportunities/${quotation.opportunity_no}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {quotation.opportunity_no}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-medium">{quotation.customer_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Customer Email</p>
                      <p className="font-medium">
                        {quotation.customer_email || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Customer Type</p>
                      <p className="font-medium">{quotation.type}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{quotation.company || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Sales PIC</p>
                      <p className="font-medium">
                        {quotation.sales_pic || "-"}
                      </p>
                    </div>
                  </div>

                  {quotation.top && (
                    <div className="flex items-start gap-3">
                      <Receipt className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">
                          Terms of Payment
                        </p>
                        <p className="font-medium">{quotation.top}</p>
                      </div>
                    </div>
                  )}

                  {quotation.target_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Target Date</p>
                        <p className="font-medium">
                          {formatDate(quotation.target_date)}
                        </p>
                      </div>
                    </div>
                  )}

                  {quotation.valid_until && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Valid Until</p>
                        <p className="font-medium">
                          {formatDate(quotation.valid_until)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">
                        {formatDate(quotation.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Financial Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Subtotal</p>
                      <p className="font-medium">
                        {quotation.total_amount.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Shipping Cost</p>
                      <p className="font-medium">
                        {quotation.shipping.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Percent className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Discount</p>
                      <p className="font-medium text-red-600">
                        -
                        {quotation.discount.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Receipt className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tax</p>
                      <p className="font-medium">
                        {quotation.tax.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:col-span-2">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Grand Total</p>
                      <p className="font-bold text-lg text-green-600">
                        {quotation.grand_total.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {quotation.notes && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {quotation.notes}
                  </p>
                </div>
              )}

              {/* Related Data */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Related Data</h3>
                <QuotationRelatedData quotationId={quotation.id} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
