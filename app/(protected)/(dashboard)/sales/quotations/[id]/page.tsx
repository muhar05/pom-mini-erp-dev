"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, FileText, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import { useQuotationDetail } from "@/hooks/quotations/useQuotationDetail";
import { useLeadById } from "@/hooks/leads/useLeadsById";
import QuotationExport from "@/components/quotations/quotationExport";
import { convertQuotationToSalesOrderAction } from "@/app/actions/sales-orders";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useCustomerById } from "@/hooks/customers/useCustomerById";
import { PrintButton } from "@/components/quotations/PrintButton";
import QuotationDetailSkeleton from "../_components/quotationDetailSkeleton";
import { usePaymentTermById } from "@/hooks/payment-terms/usePaymentTerms";
import { formatCurrency } from "@/utils/formatCurrency";

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
  const [converting, setConverting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Ambil detail customer dari API (untuk company level & diskon)
  const { customer: customerDetail } = useCustomerById(quotation?.customer_id);
  const { paymentTerm } = usePaymentTermById(quotation?.payment_term_id);

  // Company level & diskon
  const companyLevel = customerDetail?.company?.company_level;
  const companyLevelDiscount1 = companyLevel?.disc1 ?? 0;
  const companyLevelDiscount2 = companyLevel?.disc2 ?? 0;
  const companyLevelName = companyLevel?.level_name ?? "";

  // Quotation detail (BOQ)
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

  // Perhitungan pricing summary (sama seperti form)
  const subtotal = quotationDetail.reduce(
    (sum: number, item: any) =>
      sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 0),
    0,
  );
  const discount1Amount = (subtotal * companyLevelDiscount1) / 100;
  const afterDiscount1 = subtotal - discount1Amount;
  const discount2Amount =
    companyLevelDiscount2 > 0
      ? (afterDiscount1 * companyLevelDiscount2) / 100
      : 0;
  const afterDiscount2 = afterDiscount1 - discount2Amount;
  const additionalDiscountPercent = Number(quotation?.discount) || 0;
  const additionalDiscountAmount =
    additionalDiscountPercent > 0
      ? (afterDiscount2 * additionalDiscountPercent) / 100
      : 0;
  const afterAllDiscount = afterDiscount2 - additionalDiscountAmount;
  const tax = afterAllDiscount * 0.11;
  const grandTotal = afterAllDiscount + tax;

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd MMM yyyy");
  };

  const handleCopyQuotationNo = () => {
    navigator.clipboard.writeText(quotation.quotation_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (!idParam) return;
    fetch(`/api/quotations/${idParam}`, { method: "DELETE" }).then(() => {
      setShowDeleteDialog(false);
      router.push("/sales/quotations");
    });
  };

  const handleConvertToSO = async () => {
    if (!quotation?.id) return;
    setConverting(true);
    try {
      const result = await convertQuotationToSalesOrderAction(
        Number(quotation.id),
      );
      if (result.success) {
        toast.success(
          result.message || "Quotation successfully converted to Sales Order!",
          {
            duration: 4000,
            icon: "🎉",
          },
        );
        if (result.data?.id) {
          router.push(`/sales/sales-orders/${result.data.id}/edit`);
        } else {
          router.push("/sales/sales-orders");
        }
      } else {
        toast.error(
          result.message || "Failed to convert quotation to Sales Order",
          {
            duration: 5000,
          },
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while converting quotation",
        { duration: 5000 },
      );
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return <QuotationDetailSkeleton />;
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
          onClick={() => router.push("/sales/quotations")}
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
            <h1 className="text-2xl font-bold tracking-tight">
              Quotation Detail
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="font-mono text-base">
                {quotation.quotation_no}
              </Badge>
              <span
                className={`px-2 py-1 rounded text-xs border ${getStatusBadgeClass(
                  quotation.status,
                )}`}
              >
                {quotation.status}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs border ${getStageBadgeClass(
                  quotation.stage,
                )}`}
              >
                {quotation.stage}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopyQuotationNo}
                title="Copy Quotation No"
              >
                <FileText className="w-4 h-4" />
              </Button>
              {copied && (
                <span className="text-xs text-green-600 ml-2">Copied!</span>
              )}
              {/* Tambahkan button Convert to SO */}
              <Button
                variant="secondary"
                onClick={() =>
                  router.push(`/sales/quotations/${quotation.id}/edit`)
                }
                className="ml-2"
                title="Edit Quotation"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
              {quotation.status === "sq_approved" && (
                <Button
                  variant="default"
                  disabled={converting}
                  onClick={handleConvertToSO}
                  className="ml-2"
                >
                  {converting ? "Converting..." : "Convert to SO"}
                </Button>
              )}
              {/* Tambahkan tombol print di sini */}
              <PrintButton printRef={printRef} />
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Created at: {formatDate(quotation.created_at)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Customer Information */}
          <div className="space-y-6">
            <Card className="dark:bg-gray-800 border dark:border-gray-700 h-full">
              <CardHeader className="pb-4 border-b dark:border-gray-700">
                <CardTitle className="text-lg font-medium flex items-center gap-3 dark:text-white">
                  <Calendar className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs mb-1 font-semibold">
                      Customer Name
                    </span>
                    <div className="bg-gray-100 dark:bg-gray-800/40 rounded px-3 py-2">
                      {customerDetail?.customer_name || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs mb-1 font-semibold">
                      Company
                    </span>
                    <div className="bg-gray-100 dark:bg-gray-800/40 rounded px-3 py-2">
                      {customerDetail?.company?.company_name || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs mb-1 font-semibold">
                      Company Level
                    </span>
                    <div className="bg-gray-100 dark:bg-gray-800/40 rounded px-3 py-2">
                      {companyLevelName || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs mb-1 font-semibold">
                      Type
                    </span>
                    <div className="bg-gray-100 dark:bg-gray-800/40 rounded px-3 py-2">
                      {customerDetail?.type || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs mb-1 font-semibold">
                      Email
                    </span>
                    <div className="bg-gray-100 dark:bg-gray-800/40 rounded px-3 py-2">
                      {customerDetail?.email || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs mb-1 font-semibold">
                      Phone
                    </span>
                    <div className="bg-gray-100 dark:bg-gray-800/40 rounded px-3 py-2">
                      {customerDetail?.phone || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs mb-1 font-semibold">
                      Address
                    </span>
                    <div className="bg-gray-100 dark:bg-gray-800/40 rounded px-3 py-2">
                      {customerDetail?.address || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Payment Term</span>
                    <div className="font-medium">
                      {paymentTerm
                        ? `${paymentTerm.name}${
                            paymentTerm.days
                              ? ` (${paymentTerm.days} hari)`
                              : ""
                          }`
                        : "-"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle: BOQ Table */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Bill of Quantity (BOQ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left">#</th>
                        <th className="px-2 py-1 text-left">Product</th>
                        <th className="px-2 py-1 text-right">Qty</th>
                        <th className="px-2 py-1 text-right">Unit Price</th>
                        <th className="px-2 py-1 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotationDetail.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-2 py-1">{idx + 1}</td>
                          <td className="px-2 py-1">{item.product_name}</td>
                          <td className="px-2 py-1 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {formatCurrency(
                              (Number(item.unit_price) || 0) *
                                (Number(item.quantity) || 0),
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col gap-1 mb-2">
                    <span>
                      Diskon 1 (Company Level): <b>{companyLevelDiscount1}%</b>
                    </span>
                    <span>
                      Diskon 2 (Company Level): <b>{companyLevelDiscount2}%</b>
                    </span>
                    {companyLevelName && <span>Level: {companyLevelName}</span>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {companyLevelDiscount1 > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm dark:text-white">
                        Diskon 1 ({companyLevelDiscount1}%)
                      </span>
                      <span className="font-medium dark:text-white">
                        -{formatCurrency(discount1Amount)}
                      </span>
                    </div>
                  )}
                  {companyLevelDiscount2 > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm dark:text-white">
                        Diskon 2 ({companyLevelDiscount2}%)
                      </span>
                      <span className="font-medium dark:text-white">
                        -{formatCurrency(discount2Amount)}
                      </span>
                    </div>
                  )}
                  {(companyLevelDiscount1 > 0 || companyLevelDiscount2 > 0) && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Setelah Diskon Company
                      </span>
                      <span className="font-medium">
                        {formatCurrency(afterDiscount2)}
                      </span>
                    </div>
                  )}
                  {additionalDiscountPercent > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Additional Discount ({additionalDiscountPercent}%)
                      </span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(additionalDiscountAmount)}
                      </span>
                    </div>
                  )}
                  {(companyLevelDiscount1 > 0 ||
                    companyLevelDiscount2 > 0 ||
                    additionalDiscountPercent > 0) && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Setelah Semua Diskon{" "}
                        <span className="italic">(belum termasuk pajak)</span>
                      </span>
                      <span className="font-medium">
                        {formatCurrency(afterAllDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Tax (11%)
                    </span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold">Grand Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(grandTotal)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Subtotal: {formatCurrency(subtotal)}
                      </div>
                    </div>
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
          <div className="flex flex-col items-center">
            <FileText className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Delete Quotation?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this quotation? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Komponen yang akan di-print */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <QuotationExport
            sqNumber={quotation.quotation_no}
            date={formatDate(quotation.created_at)}
            paymentTerm={
              paymentTerm
                ? `${paymentTerm.name}${paymentTerm.days ? ` (${paymentTerm.days} hari)` : ""}`
                : "-"
            }
            currency="IDR"
            customerName={customerDetail?.customer_name || "-"}
            customerAddress={customerDetail?.address || "-"}
            customerEmail={customerDetail?.email ?? undefined}
            companyName={customerDetail?.company?.company_name || ""}
            companyAddress={customerDetail?.company?.address || ""}
            items={quotationDetail.map((item: any) => ({
              partNo: item.product_code || "",
              desc: item.product_name,
              qty: item.quantity,
              unit: item.unit,
              unitPrice: item.unit_price,
            }))}
            notes={quotation.note}
            project={quotation.project}
            signatureName={quotation.sales_name}
            fileName={`quotation_${quotation.quotation_no}.pdf`}
            discount={additionalDiscountPercent}
            discountAmount={additionalDiscountAmount}
            diskon1={companyLevelDiscount1}
            diskon2={companyLevelDiscount2}
          />
        </div>
      </div>
    </>
  );
}
