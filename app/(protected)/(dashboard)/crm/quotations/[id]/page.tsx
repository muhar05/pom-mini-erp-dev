"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Copy,
  DollarSign,
  FileText,
  Mail,
  MoreVertical,
  Package,
  Printer,
  Share2,
  ShoppingBag,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useQuotationDetail } from "@/hooks/quotations/useQuotationDetail";
import { formatStatusDisplay } from "@/utils/statusHelpers";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import ConvertToSalesOrderButton from "../_components/convert-to-sales-order-button";

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    case "expired":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    case "converted to so":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
  }
}

function getStageBadgeClass(stage: string): string {
  switch (stage?.toLowerCase()) {
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    case "review":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "approved":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case "sent":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
}

export default function QuotationDetailPage() {
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { quotation, loading } = useQuotationDetail(idParam);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyQuotationNo = () => {
    if (!quotation?.quotation_no) return;
    navigator.clipboard.writeText(quotation.quotation_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd MMM yyyy", { locale: localeId });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const canConvertToSO = quotation?.status?.toLowerCase() === "confirmed";

  // Gunakan useMemo agar quotationDetail tidak berubah referensi setiap render
  const quotationDetail = useMemo(() => {
    if (Array.isArray(quotation?.quotation_detail)) {
      return quotation.quotation_detail;
    }
    if (quotation?.quotation_detail) {
      try {
        return JSON.parse(quotation.quotation_detail);
      } catch {
        return [];
      }
    }
    return [];
  }, [quotation?.quotation_detail]);

  const [detailWithUnit, setDetailWithUnit] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUnits() {
      if (!quotationDetail || quotationDetail.length === 0) {
        setDetailWithUnit([]);
        return;
      }
      const results = await Promise.all(
        quotationDetail.map(async (item: any) => {
          if (!item.product_id) return { ...item, unit: "" };
          try {
            const res = await fetch(`/api/products/${item.product_id}`);
            const prod = await res.json();
            return { ...item, unit: prod.unit ?? "" };
          } catch {
            return { ...item, unit: "" };
          }
        })
      );
      setDetailWithUnit(results);
    }
    fetchUnits();
  }, [quotationDetail]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16 w-full h-full">
        <div className="flex flex-col w-full justify-center items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">
          Quotation Not Found
        </h3>
        <p className="text-gray-500 mt-2">
          The quotation you're looking for doesn't exist.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/crm/quotations")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quotations
        </Button>
      </div>
    );
  }

  return (
    <>
      <DashboardBreadcrumb
        title={`Quotation - ${quotation.quotation_no}`}
        text="View quotation details"
      />

      <div className="w-full mx-auto py-4 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Button
              variant="outline"
              size="sm"
              className="mb-4 flex items-center gap-2 dark:border-gray-700"
              onClick={() => router.push("/crm/quotations")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Quotations
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {quotation.quotation_no}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusBadgeClass(quotation.status)}>
                    <span className="font-semibold">Status:</span>{" "}
                    {formatStatusDisplay(quotation.status)}
                  </Badge>
                  {quotation.stage && (
                    <Badge
                      className={getStageBadgeClass(quotation.stage)}
                      variant="outline"
                    >
                      <span className="font-semibold">Stage:</span>{" "}
                      {formatStatusDisplay(quotation.stage)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleCopyQuotationNo}
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy No"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Convert to Sales Order Button - dipindahkan ke sini */}
            <ConvertToSalesOrderButton
              quotationId={parseInt(idParam || "0")}
              quotationNo={quotation.quotation_no || ""}
              status={quotation.status || ""}
              stage={quotation.stage || ""}
              grandTotal={Number(quotation.grand_total) || 0}
              disabled={loading}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quotation Info & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Company Info Card */}
            <Card className="dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      Customer Name
                    </div>
                    <p className="font-medium dark:text-gray-100">
                      {quotation.customer?.customer_name || "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </div>
                    <p className="font-medium dark:text-gray-200">
                      {quotation.customer?.email || "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Building2 className="w-4 h-4" />
                      Company
                    </div>
                    <p className="font-medium dark:text-gray-200">
                      {quotation.customer?.company?.company_name || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quotation Items Card */}
            <Card className="dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
                  <Package className="w-5 h-5" />
                  Quotation Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quotationDetail.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            No
                          </th>
                          <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Description
                          </th>
                          <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Qty
                          </th>
                          <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Unit
                          </th>
                          <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Unit Price
                          </th>
                          <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailWithUnit.map((item: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b dark:border-gray-800"
                          >
                            <td className="py-3 text-sm dark:text-gray-300">
                              {index + 1}
                            </td>
                            <td className="py-3 text-sm dark:text-gray-300">
                              <div>
                                <p className="font-medium">
                                  {item.product_name}
                                </p>
                                {item.product_code && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Code: {item.product_code}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 text-sm text-right dark:text-gray-300">
                              {item.quantity}
                            </td>
                            <td className="py-3 text-sm text-right dark:text-gray-300">
                              {item.unit || "-"}
                            </td>
                            <td className="py-3 text-sm text-right dark:text-gray-300">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="py-3 text-sm text-right font-medium dark:text-gray-300">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No items in this quotation</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Card */}
            {quotation.note && (
              <Card className="dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
                    <FileText className="w-5 h-5" />
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border dark:border-gray-700">
                    <p className="whitespace-pre-line dark:text-gray-300">
                      {quotation.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Summary & Actions */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
                  <DollarSign className="w-5 h-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium dark:text-gray-200">
                      {formatCurrency(quotation.total)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Discount ({quotation.discount}%)
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -
                      {formatCurrency(
                        (quotation.total * quotation.discount) / 100
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Tax (11%)
                    </span>
                    <span className="font-medium dark:text-gray-200">
                      {formatCurrency(quotation.tax)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="font-medium dark:text-gray-200">
                      {formatCurrency(quotation.shipping)}
                    </span>
                  </div>

                  <Separator className="dark:bg-gray-700" />

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-lg dark:text-gray-100">
                      Grand Total
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary dark:text-blue-400">
                        {formatCurrency(quotation.grand_total)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline & Terms Card */}
            <Card className="dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
                  <Calendar className="w-5 h-5" />
                  Timeline & Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Created Date
                    </div>
                    <p className="font-medium dark:text-gray-200">
                      {formatDate(quotation.created_at)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated
                    </div>
                    <p className="font-medium dark:text-gray-200">
                      {formatDate(quotation.updated_at)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Target Date
                    </div>
                    <p className="font-medium dark:text-gray-200">
                      {quotation.target_date
                        ? formatDate(quotation.target_date)
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Terms of Payment
                    </div>
                    <p className="font-medium dark:text-gray-200">
                      {quotation.top || "Cash"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
