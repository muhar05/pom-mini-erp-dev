"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { PrintButton } from "@/components/quotations/PrintButton";
import {
  Edit,
  Trash2,
  ShoppingBag,
  Download,
  ArrowLeft,
  Copy,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Truck,
  Percent,
  Receipt,
  User,
  Mail,
  Building2,
  FileText,
  Clock,
  Tag,
  Package,
  CreditCard,
  MoreVertical,
  Printer,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useQuotationDetail } from "@/hooks/quotations/useQuotationDetail";
import { useProductById } from "@/hooks/products/useProductById";
import QuotationExport from "@/components/quotations/quotationExport";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const handleDelete = () => {
    if (!idParam) return;
    fetch(`/api/quotations/${idParam}`, { method: "DELETE" }).then(() => {
      setShowDeleteDialog(false);
      router.push("/crm/quotations");
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleCopyQuotationNo = () => {
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
          if (!item.product_id) return { ...item, unit: "" }; // kosong jika tidak ada product_id
          try {
            const res = await fetch(`/api/products/${item.product_id}`);
            const prod = await res.json();
            return { ...item, unit: prod.unit ?? "" }; // ambil langsung dari produk
          } catch {
            return { ...item, unit: "" };
          }
        })
      );
      setDetailWithUnit(results);
    }
    fetchUnits();
  }, [quotationDetail]); // dependency sudah stabil

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
                    {quotation.status}
                  </Badge>
                  {quotation.stage && (
                    <Badge
                      className={getStageBadgeClass(quotation.stage)}
                      variant="outline"
                    >
                      {quotation.stage}
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
                <DropdownMenuItem>
                  <PrintButton printRef={printRef} />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                      <span>Customer Name</span>
                    </div>
                    <p className="font-medium dark:text-gray-100">
                      {quotation.customer?.customer_name || "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium dark:text-gray-200">
                      {quotation.customer?.email || "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Building2 className="w-4 h-4" />
                      <span>Company</span>
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
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Item
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Qty
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Price
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotationDetail.map((item: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium dark:text-gray-200">
                                {item.product_name || "-"}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="dark:text-gray-200">
                                {item.quantity || 0}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="dark:text-gray-200">
                                {formatCurrency(item.unit_price || 0)}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium dark:text-gray-100">
                                {formatCurrency(item.total || 0)}
                              </div>
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
                      {formatCurrency(quotation.total || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Shipping
                      </span>
                    </div>
                    <span className="font-medium dark:text-gray-200">
                      {formatCurrency(quotation.shipping || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Discount
                      </span>
                    </div>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {/* Tampilkan persentase, fallback ke 0% jika tidak ada */}
                      - {quotation.discount ? `${quotation.discount}%` : "0%"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tax
                      </span>
                    </div>
                    <span className="font-medium dark:text-gray-200">
                      {formatCurrency(quotation.tax || 0)}
                    </span>
                  </div>

                  <Separator className="dark:bg-gray-700" />

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold dark:text-gray-100">
                      Grand Total
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary dark:text-blue-400">
                        {formatCurrency(quotation.grand_total || 0)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Including all charges
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
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Created Date</span>
                    </div>
                    <p className="font-medium dark:text-gray-200">
                      {formatDate(quotation.created_at)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Last Updated</span>
                    </div>
                    <p className="font-medium dark:text-gray-200">
                      {formatDate(quotation.updated_at)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Target Date</span>
                    </div>
                    <p className="font-medium dark:text-gray-200">
                      {quotation.target_date
                        ? formatDate(quotation.target_date)
                        : "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <CreditCard className="w-4 h-4" />
                      <span>Payment Terms</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      {quotation.top || "Not specified"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">
              Delete Quotation?
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete quotation{" "}
              <span className="font-semibold text-red-600 dark:text-red-400">
                {quotation.quotation_no}
              </span>
              ? This action cannot be undone. All related data will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Komponen yang akan di-print */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <QuotationExport
            sqNumber={quotation.quotation_no}
            date={formatDate(quotation.created_at)}
            paymentTerm={quotation.top || "-"}
            currency="IDR"
            customerName={quotation.customer?.customer_name || "-"}
            customerAddress={quotation.customer?.address || "-"}
            customerEmail={quotation.customer?.email}
            companyName={quotation.customer?.company?.company_name || ""}
            companyAddress={quotation.customer?.company?.address || ""}
            companyPhone={quotation.customer?.company?.phone}
            items={detailWithUnit.map((item: any) => ({
              partNo: item.product_code || "", // ambil dari product_code
              desc: item.product_name,
              qty: item.quantity,
              unit: item.unit, // ambil langsung dari hasil fetch, tanpa default "pcs"
              unitPrice: item.unit_price,
            }))}
            notes={quotation.note}
            project={quotation.project}
            signatureName={quotation.sales_name}
            fileName={`quotation_${quotation.quotation_no}.pdf`}
          />
        </div>
      </div>
    </>
  );
}
