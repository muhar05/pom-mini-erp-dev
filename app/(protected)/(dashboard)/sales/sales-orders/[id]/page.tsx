"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  ArrowLeft,
  MoreVertical,
  Download,
  Percent,
  Receipt,
  Eye,
} from "lucide-react";
import {
  getSalesOrderByIdAction,
  updateSalesOrderStatusAction,
  updateSalesOrderItemStatusAction,
  updateSalesOrderNoteAction,
} from "@/app/actions/sales-orders";
import LoadingSkeleton from "@/components/loading-skeleton";
import SalesOrderExport, {
  SOExportHandle,
} from "@/components/sales-orders/salesOrderExport";
import { SalesOrderPrintButton } from "@/components/sales-orders/PrintButton";
import { useSession } from "@/contexts/session-context";
import {
  getSalesOrderPermissions,
  isActionAvailable,
  isSuperuser,
  isWarehouse,
  isSales,
} from "@/utils/salesOrderPermissions";
import toast from "react-hot-toast";
import { Edit, CheckCircle, CreditCard, Truck, XCircle, ChevronDown, Package, Edit2 } from "lucide-react";
import Link from "next/link";

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    case "active":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
}

function getSaleStatusBadgeClass(status: string): string {
  switch (status?.toUpperCase()) {
    case "NEW":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PR":
    case "PO":
    case "SR":
    case "FAR":
    case "DR":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "DELIVERY":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "DELIVERED":
      return "bg-green-100 text-green-800 border-green-200";
    case "RECEIVED":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "COMPLETED":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getPaymentStatusBadgeClass(status: string): string {
  switch (status?.toUpperCase()) {
    case "UNPAID":
      return "bg-red-100 text-red-800 border-red-200";
    case "PARTIAL":
    case "PARTIALLY_PAID":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PAID":
      return "bg-green-100 text-green-800 border-green-200";
    case "OVERDUE":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getItemStatusBadgeClass(status: string): string {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    case "PARTIAL_DELIVERED":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
}

import { SALE_STATUSES, ITEM_STATUSES, ITEM_STATUS_DETAILS, REOPEN_SYSTEM_PREFIXES, hasPendingReopenRequest } from "@/utils/salesOrderPermissions";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSession();
  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<SOExportHandle>(null);

  // Reopen Request State
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

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

  useEffect(() => {
    if (params.id) {
      fetchSalesOrder();
    }
  }, [params.id]);

  const permissions = useMemo(() => {
    if (!salesOrder || !user) return null;
    return getSalesOrderPermissions(salesOrder, user);
  }, [salesOrder, user]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!salesOrder?.id) return;

    setActionLoading(true);
    try {
      const result = await updateSalesOrderStatusAction(salesOrder.id, newStatus);
      if (result.success) {
        toast.success(result.message);
        fetchSalesOrder();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReopen = async () => {
    if (!reopenReason.trim()) {
      toast.error("Please provide a reason for reopening");
      return;
    }

    setActionLoading(true);
    try {
      const systemNote = REOPEN_SYSTEM_PREFIXES.REQUEST + " " + reopenReason;
      const result = await updateSalesOrderNoteAction(salesOrder.id, systemNote);

      if (result.success) {
        toast.success("Reopen request sent to manager");
        setIsReopenModalOpen(false);
        setReopenReason("");
        fetchSalesOrder();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to send request");
    } finally {
      setActionLoading(false);
    }
  };

  const isReopenPending = useMemo(() => {
    return hasPendingReopenRequest(salesOrder?.note);
  }, [salesOrder?.note]);

  const handleUpdateItemStatus = async (itemId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const result = await updateSalesOrderItemStatusAction(itemId, newStatus);
      if (result.success) {
        toast.success(result.message);
        fetchSalesOrder();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update item status");
    } finally {
      setActionLoading(false);
    }
  };

  // Derived data
  const customer = salesOrder?.customers;
  const companyLevel = customer?.company?.company_level;
  const companyLevelDiscount1 = companyLevel?.disc1 ?? 0;
  const companyLevelDiscount2 = companyLevel?.disc2 ?? 0;
  const companyLevelName = companyLevel?.level_name ?? "";

  const saleOrderDetails = useMemo(() => {
    return salesOrder?.sale_order_detail || [];
  }, [salesOrder?.sale_order_detail]);

  // Pricing calculations
  const subtotal = useMemo(() => {
    return saleOrderDetails.reduce(
      (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
      0
    );
  }, [saleOrderDetails]);

  const discount1Amount = (subtotal * companyLevelDiscount1) / 100;
  const afterDiscount1 = subtotal - discount1Amount;
  const discount2Amount = (afterDiscount1 * companyLevelDiscount2) / 100;
  const afterDiscount2 = afterDiscount1 - discount2Amount;

  const additionalDiscountPercent = Number(salesOrder?.discount) || 0;
  const additionalDiscountAmount = (afterDiscount2 * additionalDiscountPercent) / 100;
  const afterAllDiscount = afterDiscount2 - additionalDiscountAmount;

  const tax = Number(salesOrder?.tax) || (afterAllDiscount * 0.11);
  const grandTotal = afterAllDiscount + tax;

  const handleBack = () => {
    router.push("/sales/sales-orders");
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
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="w-16 h-16 text-red-300 mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
              <p className="text-muted-foreground mb-6">{error || "Sales order not found"}</p>
              <Button onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sales Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <DashboardBreadcrumb
        title={`Sales Order - ${salesOrder.sale_no}`}
        text="View sales order details"
      />

      <div className="w-full mx-auto py-4 space-y-6">
        {/* Info Banners */}
        {salesOrder.sale_status === SALE_STATUSES.PR && (
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-indigo-700 font-medium">
                  {isReopenPending
                    ? "Permintaan Reopen sedang menunggu persetujuan Manager Sales."
                    : "Sales Order sudah diserahkan ke Purchasing (PR). Data sudah terkunci untuk Sales."}
                </p>
                {!isReopenPending && permissions?.canRequestReopen && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-indigo-600 font-bold mt-1"
                    onClick={() => setIsReopenModalOpen(true)}
                  >
                    Request Reopen SO (Minta Perubahan Data)
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Existing Header Section */}
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sales Order Detail
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="font-mono text-base bg-white dark:bg-gray-900">
                {salesOrder.sale_no}
              </Badge>
              <span className={`px-2 py-1 rounded text-xs border ${getStatusBadgeClass(salesOrder.status)}`}>
                {salesOrder.status}
              </span>
              <span className={`px-2 py-1 rounded text-xs border ${getSaleStatusBadgeClass(salesOrder.sale_status)}`}>
                {salesOrder.sale_status}
              </span>
              <span className={`px-2 py-1 rounded text-xs border ${getPaymentStatusBadgeClass(salesOrder.payment_status)}`}>
                {salesOrder.payment_status}
              </span>

              <div className="flex items-center gap-3 ml-2">
                {/* Dynamic Action Buttons based on flow */}
                {permissions && permissions.availableActions.map(action => {
                  if (action === "update_status_pr") {
                    return (
                      <Button key={action} size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateStatus(SALE_STATUSES.PR)} disabled={actionLoading}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm & Create PR
                      </Button>
                    );
                  }
                  if (action === "update_status_po") {
                    return (
                      <Button key={action} size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleUpdateStatus(SALE_STATUSES.PO)} disabled={actionLoading}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create PO
                      </Button>
                    );
                  }
                  if (action === "update_status_sr") {
                    return (
                      <Button key={action} size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => handleUpdateStatus(SALE_STATUSES.SR)} disabled={actionLoading}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Reserved Stock (SR)
                      </Button>
                    );
                  }
                  if (action === "update_status_far") {
                    return (
                      <Button key={action} size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={() => handleUpdateStatus(SALE_STATUSES.FAR)} disabled={actionLoading}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Request Finance Approval
                      </Button>
                    );
                  }
                  if (action === "approve_far") {
                    return (
                      <Button key={action} size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus(SALE_STATUSES.DR)} disabled={actionLoading}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Finance
                      </Button>
                    );
                  }
                  if (action === "update_status_dr") {
                    return (
                      <Button key={action} size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={() => handleUpdateStatus(SALE_STATUSES.DR)} disabled={actionLoading}>
                        <Truck className="w-4 h-4 mr-2" />
                        Create Delivery Request
                      </Button>
                    );
                  }
                  if (action === "update_status_delivery") {
                    return (
                      <Button key={action} size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => handleUpdateStatus(SALE_STATUSES.DELIVERY)} disabled={actionLoading}>
                        <Truck className="w-4 h-4 mr-2" />
                        Ship Items
                      </Button>
                    );
                  }
                  if (action === "update_status_delivered") {
                    return (
                      <Button key={action} size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(SALE_STATUSES.DELIVERED)} disabled={actionLoading}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        All Items Delivered
                      </Button>
                    );
                  }
                  if (action === "update_status_received") {
                    return (
                      <Button key={action} size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => handleUpdateStatus(SALE_STATUSES.RECEIVED)} disabled={actionLoading}>
                        <Package className="w-4 h-4 mr-2" />
                        Customer Received
                      </Button>
                    );
                  }
                  if (action === "complete") {
                    return (
                      <Button key={action} size="sm" className="bg-gray-800 hover:bg-black" onClick={() => handleUpdateStatus(SALE_STATUSES.COMPLETED)} disabled={actionLoading}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finalize Order
                      </Button>
                    );
                  }
                  if (action === "cancel") {
                    return (
                      <Button key={action} size="sm" variant="destructive" onClick={() => handleUpdateStatus(SALE_STATUSES.CANCELLED)} disabled={actionLoading}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Order
                      </Button>
                    );
                  }
                  return null;
                })}

                {/* Edit Button */}
                {permissions && permissions.canEdit && (
                  <Link href={`/sales/sales-orders/${salesOrder.id}/edit`}>
                    <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Order
                    </Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4 mr-1" />
                      More Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <SalesOrderPrintButton printRef={printRef} />
                    </DropdownMenuItem>

                    {permissions && isActionAvailable("request_finance", permissions) && (
                      <DropdownMenuItem onClick={() => toast("Finance request feature coming soon", { icon: "ℹ️" })}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Request Finance
                      </DropdownMenuItem>
                    )}

                    {permissions && isActionAvailable("create_delivery", permissions) && (
                      <DropdownMenuItem onClick={() => toast("Delivery request feature coming soon", { icon: "ℹ️" })}>
                        <Truck className="mr-2 h-4 w-4" />
                        Create Delivery
                      </DropdownMenuItem>
                    )}

                    {permissions && isActionAvailable("cancel", permissions) && (
                      <DropdownMenuItem className="text-red-600" onClick={() => toast("Cancel feature coming soon", { icon: "ℹ️" })}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Order
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Created at: {salesOrder.created_at ? format(new Date(salesOrder.created_at), "dd MMM yyyy") : "-"}
            </div>
          </div>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Customer Information */}
          <div className="space-y-6">
            <Card className="dark:bg-gray-800 border dark:border-gray-700">
              <CardHeader className="pb-4 border-b dark:border-gray-700">
                <CardTitle className="text-lg font-medium flex items-center gap-3 dark:text-white">
                  <User className="w-5 h-5 text-primary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                      Customer Name
                    </span>
                    <div className="bg-gray-50 dark:bg-gray-800/40 rounded px-3 py-2 border dark:border-gray-700">
                      {customer?.customer_name || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                      Company
                    </span>
                    <div className="bg-gray-50 dark:bg-gray-800/40 rounded px-3 py-2 border dark:border-gray-700">
                      {customer?.company?.company_name || "-"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                        Level
                      </span>
                      <div className="bg-gray-50 dark:bg-gray-800/40 rounded px-2 py-2 border dark:border-gray-700 text-sm">
                        {companyLevelName || "-"}
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                        Type
                      </span>
                      <div className="bg-gray-50 dark:bg-gray-800/40 rounded px-2 py-2 border dark:border-gray-700 text-sm">
                        {customer?.type || "-"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                      Contact
                    </span>
                    <div className="bg-gray-50 dark:bg-gray-800/40 rounded px-3 py-2 border dark:border-gray-700 text-sm flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">E:</span> {customer?.email || "-"}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">P:</span> {customer?.phone || "-"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                      Address
                    </span>
                    <div className="bg-gray-50 dark:bg-gray-800/40 rounded px-3 py-2 border dark:border-gray-700 text-sm min-h-[60px]">
                      {customer?.address || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                      Payment Term
                    </span>
                    <div className="bg-gray-50 dark:bg-gray-800/40 rounded px-3 py-2 border dark:border-gray-700 font-medium">
                      {salesOrder.payment_term
                        ? `${salesOrder.payment_term.name}${salesOrder.payment_term.days ? ` (${salesOrder.payment_term.days} days)` : ""}`
                        : "-"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PO Customer Section */}
            <Card className="border-t-4 border-t-primary">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  Customer PO
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesOrder.file_po_customer ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">
                            {salesOrder.file_po_customer}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {salesOrder.file_po_customer.split('.').pop()} File
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/api/po-customer/${salesOrder.file_po_customer}`, "_blank")}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `/api/po-customer/${salesOrder.file_po_customer}`;
                          link.download = salesOrder.file_po_customer;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    {salesOrder.file_po_customer.toLowerCase().endsWith('.pdf') && (
                      <div className="mt-4 border rounded-md overflow-hidden bg-gray-100">
                        <object
                          data={`/api/po-customer/${salesOrder.file_po_customer}`}
                          type="application/pdf"
                          width="100%"
                          height="300px"
                          className="w-full"
                        >
                          <div className="p-4 text-center text-xs text-muted-foreground">
                            PDF preview not available.
                            <Button variant="link" size="sm" onClick={() => window.open(`/api/po-customer/${salesOrder.file_po_customer}`, "_blank")}>
                              Open in new tab
                            </Button>
                          </div>
                        </object>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/20">
                    <FileText className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No PO uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: BOQ and Pricing */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b dark:border-gray-700">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Bill of Quantity (BOQ)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Ordered</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Delivered</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Remaining</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {saleOrderDetails.map((item: any, idx: number) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-500 font-mono tracking-tighter">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.product_name}</p>
                            {item.product_code && <p className="text-xs text-gray-500">{item.product_code}</p>}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{item.qty}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {item.status === ITEM_STATUSES.DELIVERED ? item.qty : (item.status === ITEM_STATUSES.PARTIAL_DELIVERED ? "..." : 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-amber-600">
                            {item.status === ITEM_STATUSES.DELIVERED ? 0 : (item.status === ITEM_STATUSES.PARTIAL_DELIVERED ? "..." : item.qty)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col items-center">
                                <Badge variant="outline" className={`text-xs ${getItemStatusBadgeClass(item.status)}`}>
                                  {ITEM_STATUS_DETAILS[item.status]?.label || item.status}
                                </Badge>
                                {ITEM_STATUS_DETAILS[item.status] && (
                                  <span className="text-[10px] text-muted-foreground mt-0.5">
                                    {ITEM_STATUS_DETAILS[item.status].desc}
                                  </span>
                                )}
                              </div>

                              {/* Item Status Update (Only if current role can update items) */}
                              {permissions && (isWarehouse(user) || isSuperuser(user)) && item.status !== ITEM_STATUSES.DELIVERED && item.status !== ITEM_STATUSES.CANCELLED && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="min-w-[160px]">
                                    {Object.entries(ITEM_STATUS_DETAILS).map(([value, detail]) => {
                                      // Only show specific transitions or if superuser
                                      const isSuper = isSuperuser(user);
                                      if (value === ITEM_STATUSES.CANCELLED && !isSuper) return null;

                                      return (
                                        <DropdownMenuItem
                                          key={value}
                                          onClick={() => handleUpdateItemStatus(item.id, value)}
                                          className="flex flex-col items-start px-3 py-2 cursor-pointer focus:bg-blue-50"
                                        >
                                          <span className="font-bold text-xs">{detail.label}</span>
                                          <span className="text-[10px] text-muted-foreground">{detail.desc}</span>
                                        </DropdownMenuItem>
                                      );
                                    })}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-primary">
                            {formatCurrency((Number(item.price) || 0) * (Number(item.qty) || 0))}
                          </td>
                        </tr>
                      ))}
                      {saleOrderDetails.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500 italic">
                            No items in this sales order
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader className="border-b dark:border-gray-700">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="text-primary">{companyLevelName || "-"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Disc 1:</span>
                      <Badge variant="secondary" className="h-5 px-1.5">{companyLevelDiscount1}%</Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Disc 2:</span>
                      <Badge variant="secondary" className="h-5 px-1.5">{companyLevelDiscount2}%</Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>

                  {companyLevelDiscount1 > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Company Discount 1 ({companyLevelDiscount1}%)</span>
                      <span className="font-medium text-red-600">-{formatCurrency(discount1Amount)}</span>
                    </div>
                  )}

                  {companyLevelDiscount2 > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Company Discount 2 ({companyLevelDiscount2}%)</span>
                      <span className="font-medium text-red-600">-{formatCurrency(discount2Amount)}</span>
                    </div>
                  )}

                  {(companyLevelDiscount1 > 0 || companyLevelDiscount2 > 0) && (
                    <div className="flex justify-between items-center text-sm border-t border-dashed dark:border-gray-700 pt-2 font-medium">
                      <span className="text-muted-foreground">After Company Discount</span>
                      <span>{formatCurrency(afterDiscount2)}</span>
                    </div>
                  )}

                  {additionalDiscountPercent > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Additional Discount ({additionalDiscountPercent}%)</span>
                      <span className="font-medium text-red-600">-{formatCurrency(additionalDiscountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tax (11%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>



                  <Separator className="my-2" />

                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <span className="text-lg font-bold">Grand Total</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Including tax
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-primary tracking-tight">
                        {formatCurrency(grandTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {salesOrder.note && (
              <Card className="border-l-4 border-l-primary bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm">Sales Note</h3>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {salesOrder.note}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Hidden container for printing */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <SalesOrderExport
            ref={exportRef}
            soNumber={salesOrder.sale_no || ""}
            date={salesOrder.created_at ? format(new Date(salesOrder.created_at), "dd MMM yyyy") : "-"}
            paymentTerm={salesOrder.payment_term?.name || "Cash"}
            currency="IDR"
            customerName={customer?.customer_name || ""}
            customerAddress={customer?.address || ""}
            customerEmail={customer?.email || ""}
            companyName={customer?.company?.company_name || ""}
            companyAddress={customer?.company?.address || ""}
            companyPhone={customer?.phone || ""}
            items={saleOrderDetails.map((item: any) => ({
              product_id: item.product_id,
              product_name: item.product_name,
              product_code: item.product_code || "",
              price: item.price,
              qty: item.qty,
              total: item.total || (item.price * item.qty),
              status: item.status
            }))}
            notes={salesOrder.note || ""}
            signatureName={salesOrder.user?.name || "Sales Manager"}
            fileName={`SO_${salesOrder.sale_no}.pdf`}
            status={salesOrder.status}
            saleStatus={salesOrder.sale_status}
            paymentStatus={salesOrder.payment_status}
            diskon1={companyLevelDiscount1}
            diskon2={companyLevelDiscount2}
            discount={additionalDiscountPercent}
          />
        </div>
      </div>

      {/* Reopen Modal */}
      <Dialog open={isReopenModalOpen} onOpenChange={setIsReopenModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-500" />
              Request Reopen Sales Order
            </DialogTitle>
            <DialogDescription>
              Silakan masukkan alasan mengapa Anda butuh membuka kembali (reopen) Sales Order ini. Permintaan akan dikirimkan ke Manager Sales.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Contoh: Perlu update kuantitas karena revisi customer..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReopenModalOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleRequestReopen}
              disabled={actionLoading || !reopenReason.trim()}
            >
              {actionLoading ? "Mengirim..." : "Kirim Permintaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
