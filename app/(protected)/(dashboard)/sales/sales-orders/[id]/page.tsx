"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import {
  Package,
  FileText,
  User,
  Building,
  Calendar,
  DollarSign,
  ArrowLeft,
  Printer,
  MoreVertical,
  Download,
  Truck,
  Percent,
  Receipt,
} from "lucide-react";
import { getSalesOrderByIdAction } from "@/app/actions/sales-orders";
import LoadingSkeleton from "@/components/loading-skeleton";
import SalesOrderExport, {
  SOExportHandle,
} from "@/components/sales-orders/salesOrderExport";
import { SalesOrderPrintButton } from "@/components/sales-orders/PrintButton";

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<SOExportHandle>(null);

  // Calculate discount amount in rupiah (fixed calculation)
  const calculateDiscountAmount = () => {
    const subtotal = Number(salesOrder?.total) || 0;
    const discountPercent = Number(salesOrder?.discount) || 0;
    // Discount di database adalah persentase, bukan rupiah
    return (subtotal * discountPercent) / 100;
  };

  // Calculate discount percentage (return the stored value directly)
  const calculateDiscountPercentage = () => {
    const discountPercent = Number(salesOrder?.discount) || 0;
    return discountPercent; // Langsung return karena sudah dalam bentuk persentase
  };

  useEffect(() => {
    const fetchSalesOrder = async () => {
      try {
        setLoading(true);
        const id = params.id as string;
        const data = await getSalesOrderByIdAction(id);
        setSalesOrder(data);
      } catch (err) {
        console.error("Error fetching sales order:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch sales order"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSalesOrder();
    }
  }, [params.id]);

  const handleBack = () => {
    router.push("/crm/sales-orders");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (exportRef.current) {
      exportRef.current.download();
    }
  };

  if (loading) {
    return (
      <>
        <DashboardBreadcrumb
          title="Sales Order Detail"
          text="View sales order information"
        />
        <LoadingSkeleton />
      </>
    );
  }

  if (error || !salesOrder) {
    return (
      <>
        <DashboardBreadcrumb
          title="Sales Order Detail"
          text="View sales order information"
        />
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {error || "Sales order not found"}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "open":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Determine which customer to display (direct customer or quotation customer)
  const customer = salesOrder.customers || salesOrder.quotation?.customer;

  // Prepare data for export - format items to match the expected structure
  const exportItems =
    salesOrder.sale_order_detail?.map((item: any) => ({
      product_id: item.product_id ? Number(item.product_id) : null,
      product_name: item.product_name || "",
      product_code: item.product_code || "", // Add product_code if available
      price: Number(item.price) || 0,
      qty: Number(item.qty) || 0,
      total: Number(item.total) || 0,
      status: item.status || "ACTIVE",
    })) || [];

  return (
    <>
      <DashboardBreadcrumb
        title={`Sales Order ${salesOrder.sale_no}`}
        text="View sales order details and items"
      />

      {/* Back Button and Actions */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sales Orders
        </Button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <SalesOrderPrintButton printRef={printRef} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div ref={printRef} className="print:shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Sales Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Sales Order No
                    </label>
                    <p className="font-semibold">{salesOrder.sale_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="flex gap-2">
                      <Badge className={getStatusBadgeClass(salesOrder.status)}>
                        {salesOrder.status}
                      </Badge>
                      <Badge
                        className={getStatusBadgeClass(salesOrder.sale_status)}
                      >
                        {salesOrder.sale_status}
                      </Badge>
                      <Badge
                        className={getStatusBadgeClass(
                          salesOrder.payment_status
                        )}
                      >
                        {salesOrder.payment_status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Created At
                    </label>
                    <p>{formatDate(salesOrder.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Customer Type
                    </label>
                    <p>
                      {salesOrder.quotation_id
                        ? "From Quotation"
                        : salesOrder.customer_id
                        ? "Direct Customer"
                        : "No Customer"}
                    </p>
                  </div>
                  {salesOrder.quotation && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Quotation No
                      </label>
                      <p>{salesOrder.quotation.quotation_no}</p>
                    </div>
                  )}
                  {salesOrder.customer_id && !salesOrder.quotation_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Customer ID
                      </label>
                      <p>{salesOrder.customer_id}</p>
                    </div>
                  )}
                </div>

                {salesOrder.note && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Notes
                      </label>
                      <p>{salesOrder.note}</p>
                    </div>
                  </>
                )}

                {salesOrder.user && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Sales PIC
                    </label>
                    <p className="font-semibold">{salesOrder.user.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Info - Show for both quotation and direct customers */}
            {customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                    {salesOrder.quotation_id && (
                      <Badge variant="outline" className="ml-2">
                        From Quotation
                      </Badge>
                    )}
                    {salesOrder.customer_id && !salesOrder.quotation_id && (
                      <Badge variant="outline" className="ml-2">
                        Direct Customer
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Customer Name
                      </label>
                      <p>{customer.customer_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p>{customer.email || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <p>{customer.phone || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Type
                      </label>
                      <p>{customer.type || "-"}</p>
                    </div>
                    {customer.company_id && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Company ID
                        </label>
                        <p>{customer.company_id}</p>
                      </div>
                    )}
                  </div>
                  {customer.address && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Address
                        </label>
                        <p>{customer.address}</p>
                      </div>
                    </>
                  )}
                  {customer.note && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Customer Note
                        </label>
                        <p>{customer.note}</p>
                      </div>
                    </>
                  )}
                  {customer.company && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Company Name
                        </label>
                        <p>{customer.company.company_name}</p>
                      </div>
                      {customer.company.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Company Address
                          </label>
                          <p>{customer.company.address}</p>
                        </div>
                      )}
                      {customer.company.npwp && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Company NPWP
                          </label>
                          <p>{customer.company.npwp}</p>
                        </div>
                      )}
                      {/* Tambahkan field lain sesuai kebutuhan */}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Show message if no customer information is available */}
            {!customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-4">
                    No customer information available
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesOrder.sale_order_detail?.map(
                    (item: any, index: number) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{item.product_name}</h4>
                            {item.product_id && (
                              <p className="text-sm text-gray-500">
                                Product ID: {item.product_id}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={
                              item.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <p className="font-medium">{item.qty}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Unit Price:</span>
                            <p className="font-medium">
                              {formatCurrency(Number(item.price))}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <p className="font-medium text-green-600">
                              {formatCurrency(
                                Number(item.total) > 0
                                  ? Number(item.total)
                                  : Number(item.qty) * Number(item.price)
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  {(!salesOrder.sale_order_detail ||
                    salesOrder.sale_order_detail.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      No items found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(Number(salesOrder.total))}
                  </span>
                </div>

                {/* Show discount even if small amount, but only if > 0 */}
                {calculateDiscountAmount() > 0 && (
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Discount
                        {calculateDiscountPercentage() > 0
                          ? ` (${calculateDiscountPercentage()}%)`
                          : ""}
                      </span>
                    </div>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(calculateDiscountAmount())}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Tax (11%):</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(Number(salesOrder.tax))}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Grand Total:</span>
                  <span className="text-green-600">
                    {formatCurrency(Number(salesOrder.grand_total))}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Customer PO - dengan Preview PDF */}
            {salesOrder.file_po_customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Customer PO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">File:</p>
                      <p className="font-medium break-all">
                        {salesOrder.file_po_customer}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `/api/po-customer/${salesOrder.file_po_customer}`,
                          "_blank"
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* PDF Preview */}
                  <div className="border rounded-lg overflow-hidden">
                    <object
                      data={`/api/po-customer/${salesOrder.file_po_customer}`}
                      type="application/pdf"
                      width="100%"
                      height="500px"
                      className="w-full"
                    >
                      <div className="p-4 text-center text-gray-500">
                        <p>PDF tidak bisa ditampilkan di browser ini.</p>
                        <Button
                          variant="link"
                          onClick={() =>
                            window.open(
                              `/api/po-customer/${salesOrder.file_po_customer}`,
                              "_blank"
                            )
                          }
                        >
                          Klik untuk membuka PDF
                        </Button>
                      </div>
                    </object>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Komponen yang akan di-print - Hidden export component */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <SalesOrderExport
            ref={exportRef}
            soNumber={salesOrder.sale_no || ""}
            date={formatDate(salesOrder.created_at)}
            paymentTerm="Cash" // You might want to get this from the order
            currency="IDR"
            customerName={customer?.customer_name || ""}
            customerAddress={customer?.address || ""}
            customerEmail={customer?.email || ""}
            companyName="PT. POM MINI ERP"
            companyAddress="Jl. Company Address"
            companyPhone="+62 21 1234567"
            items={exportItems}
            notes={salesOrder.note || ""}
            signatureName="Sales Manager"
            fileName={`Invoice_${salesOrder.sale_no}.pdf`}
            status={salesOrder.status}
            saleStatus={salesOrder.sale_status}
            paymentStatus={salesOrder.payment_status}
            discount={calculateDiscountPercentage()}
            discountAmount={calculateDiscountAmount()}
          />
        </div>
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          .print\\:shadow-none {
            box-shadow: none !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .bg-blue-100 {
            background-color: #dbeafe !important;
          }
          .bg-green-100 {
            background-color: #dcfce7 !important;
          }
          .bg-red-100 {
            background-color: #fee2e2 !important;
          }
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          .bg-purple-100 {
            background-color: #f3e8ff !important;
          }

          .text-blue-800 {
            color: #1e40af !important;
          }
          .text-green-800 {
            color: #166534 !important;
          }
          .text-red-800 {
            color: #991b1b !important;
          }
          .text-gray-800 {
            color: #1f2937 !important;
          }
          .text-purple-800 {
            color: #6b21a8 !important;
          }
        }
      `}</style>
    </>
  );
}
