"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SALE_STATUSES, ITEM_STATUSES, isSuperuser, isSales, isPurchasing, isWarehouse, isFinance, isManagerSales, getSalesOrderPermissions, REOPEN_SYSTEM_PREFIXES, hasPendingReopenRequest, isFieldEditable } from "@/utils/salesOrderPermissions";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar, Upload, Package, User, DollarSign, FileText, Download, Eye, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  CreateSalesOrderData,
  UpdateSalesOrderData,
} from "@/lib/schemas/sales-orders";
import {
  createSalesOrderAction,
  updateSalesOrderAction,
  generateSalesOrderNumberAction,
} from "@/app/actions/sales-orders";
import { getAllCustomersAction } from "@/app/actions/customers";
import { getAllQuotationsAction } from "@/app/actions/quotations";
import { useSession } from "@/contexts/session-context";
import { useCustomerById } from "@/hooks/customers/useCustomerById";
import { usePaymentTerms } from "@/hooks/payment-terms/usePaymentTerms";
import { users } from "@/types/models";
import toast from "react-hot-toast";
import SalesOrderItemsTable, { SaleOrderDetail } from "./SalesOrderItemsTable";
import POFileUpload from "./po-file-upload";

type SalesOrderFormData = {
  sale_no: string;
  customer_id: string | number;
  quotation_id?: string | number;
  boq_items: SaleOrderDetail[];
  total: number;
  discount: number;
  tax: number;
  grand_total: number;
  status: string;
  note?: string;
  sale_status: string;
  payment_status: string;
  file_po_customer?: string;
  payment_term_id?: number | null;
};

type SalesOrder = {
  id?: string;
  sale_no: string;
  customer_id?: string | number | null;
  quotation_id?: string | number | null;
  total?: number | null;
  discount?: number | null;
  shipping?: number | null;
  tax?: number | null;
  grand_total?: number | null;
  status?: string | null;
  note?: string | null;
  sale_status?: string | null;
  payment_status?: string | null;
  file_po_customer?: string | null;
  payment_term_id?: number | null;
  created_at?: Date | null;
  sale_order_detail?: any[];
};

interface SalesOrderFormProps {
  mode: "add" | "edit";
  salesOrder?: SalesOrder;
  onClose?: () => void;
  onSuccess?: () => void;
}

/**
 * ROLE-BASED WORKFLOW EXPLANATION:
 * 1. NEW (Sales) -> Ownership: Sales. Finalizing order, PO check. Moves to PR.
 * 2. PR/PO/SR/FAR/DR (Purchasing) -> Ownership: Purchasing. Procurement process, reservation & vendor management.
 * 3. DELIVERY/DELIVERED (Warehouse) -> Ownership: Warehouse. Physical goods movement.
 * 4. RECEIVED (Sales) -> Ownership: Sales. Handover confirmation from customer.
 * 5. COMPLETED (Terminal) -> Process done.
 */
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active (Standard)" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
];

const STATUS_DESCRIPTIONS: Record<string, { label: string; desc: string; role: string }> = {
  [SALE_STATUSES.NEW]: { label: "NEW", desc: "Order baru dibuat, tahap verifikasi awal.", role: "Sales" },
  [SALE_STATUSES.PR]: { label: "PR", desc: "Purchase Request (Permintaan Pengadaan).", role: "Purchasing" },
  [SALE_STATUSES.PO]: { label: "PO", desc: "Purchase Order (Pemesanan ke Vendor).", role: "Purchasing" },
  [SALE_STATUSES.SR]: { label: "SR", desc: "Stock Receipt (Penerimaan Stok/Barang).", role: "Purchasing" },
  [SALE_STATUSES.FAR]: { label: "FAR", desc: "Finance Approval (Validasi Pembayaran).", role: "Finance" },
  [SALE_STATUSES.DR]: { label: "DR", desc: "Delivery Request (Permintaan Pengiriman).", role: "Purchasing" },
  [SALE_STATUSES.DELIVERY]: { label: "DELIVERY", desc: "Proses pengemasan & pengiriman.", role: "Warehouse" },
  [SALE_STATUSES.DELIVERED]: { label: "DELIVERED", desc: "Barang sudah dalam pengiriman.", role: "Warehouse" },
  [SALE_STATUSES.RECEIVED]: { label: "RECEIVED", desc: "Konfirmasi barang diterima customer.", role: "Sales" },
  [SALE_STATUSES.COMPLETED]: { label: "COMPLETED", desc: "Transaksi selesai sepenuhnya.", role: "Final" },
  [SALE_STATUSES.CANCELLED]: { label: "CANCELLED", desc: "Pesanan dibatalkan.", role: "Final" },
};

export default function SalesOrderForm({
  mode,
  salesOrder,
  onClose,
  onSuccess,
}: SalesOrderFormProps) {
  const router = useRouter();
  const session = useSession();

  const [loading, setLoading] = useState(false);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isCustomerEditMode, setIsCustomerEditMode] = useState(false);
  const [customerLoadingDelay, setCustomerLoadingDelay] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

  // Inisialisasi state
  const [formData, setFormData] = useState<SalesOrderFormData>({
    sale_no: salesOrder?.sale_no || "",
    customer_id: salesOrder?.customer_id || "",
    quotation_id: salesOrder?.quotation_id || "",
    boq_items: salesOrder?.sale_order_detail
      ? salesOrder.sale_order_detail.map((item) => ({
        id: item.id?.toString() || `item-${Date.now()}`,
        product_id: item.product_id != null ? Number(item.product_id) : undefined,
        product_name: item.product_name || "",
        price: Number(item.price) || 0,
        qty: Number(item.qty) || 0,
        total: Number(item.total) || 0,
        status: item.status || "ACTIVE",
      }))
      : [],
    total: Number(salesOrder?.total) || 0,
    discount: Number(salesOrder?.discount) || 0,
    tax: Number(salesOrder?.tax) || 0,
    grand_total: Number(salesOrder?.grand_total) || 0,
    status: salesOrder?.status || "ACTIVE",
    note: salesOrder?.note || "",
    sale_status: salesOrder?.sale_status === "OPEN" ? SALE_STATUSES.NEW : (salesOrder?.sale_status || SALE_STATUSES.NEW),
    payment_status: salesOrder?.payment_status || "UNPAID",
    file_po_customer: salesOrder?.file_po_customer || "",
    payment_term_id: salesOrder?.payment_term_id ?? null,
  });

  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [quotationOptions, setQuotationOptions] = useState<any[]>([]);
  const [user, setUser] = useState<users | null>(null);
  const [originalData] = useState(salesOrder);

  // Hooks pendukung
  const { paymentTerms, isLoading: paymentTermsLoading } = usePaymentTerms();
  const { customer: customerDetail, loading: customerLoading } = useCustomerById(formData.customer_id);

  // Info Diskon & Level
  const companyLevel = customerDetail?.company?.company_level;
  const companyLevelDiscount1 = Number(companyLevel?.disc1) || 0;
  const companyLevelDiscount2 = Number(companyLevel?.disc2) || 0;
  const companyLevelName = companyLevel?.level_name || "";

  // Trigger delay customer loading
  useEffect(() => {
    if (!formData.customer_id) return;
    setCustomerLoadingDelay(true);
    const timer = setTimeout(() => setCustomerLoadingDelay(false), 500);
    return () => clearTimeout(timer);
  }, [formData.customer_id]);

  // Generate SO Number
  useEffect(() => {
    if (mode === "add" && !salesOrder?.sale_no) {
      const fetchNo = async () => {
        setGeneratingNumber(true);
        try {
          const no = await generateSalesOrderNumberAction();
          setFormData(prev => ({ ...prev, sale_no: no }));
        } finally {
          setGeneratingNumber(false);
        }
      };
      fetchNo();
    }
  }, [mode, salesOrder]);

  // Fetch Options
  useEffect(() => {
    async function fetchData() {
      const [custRes, quotRes] = await Promise.all([
        getAllCustomersAction(),
        getAllQuotationsAction()
      ]);
      setCustomerOptions(custRes.data || []);
      setQuotationOptions((quotRes || []).filter((q: any) => q.status === "sq_approved" || q.id.toString() === salesOrder?.quotation_id?.toString()));
    }
    fetchData();
  }, [salesOrder]);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user as unknown as users);
    }
  }, [session]);

  const permissions = useMemo(() => {
    return getSalesOrderPermissions(salesOrder, user);
  }, [salesOrder, user]);

  const hasPendingReopen = useMemo(() => {
    return hasPendingReopenRequest(formData.note);
  }, [formData.note]);

  const handleInputChange = (field: keyof SalesOrderFormData, value: any) => {
    if (field === "note" && typeof value === "string") {
      // Mencegah manipulasi manual prefix sistem
      if (value.toUpperCase().includes("[REOPEN")) {
        toast.error("Prefix [REOPEN] adalah milik sistem dan tidak boleh diketik manual.");
        return;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const calculatePricing = () => {
    // Current items from formData for calculation
    const currentItems = formData.boq_items;
    const subtotal = currentItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
    const disc1 = companyLevelDiscount1;
    const disc2 = companyLevelDiscount2;
    const addDisc = Number(formData.discount) || 0;

    const discount1Amount = (subtotal * disc1) / 100;
    const afterDiscount1 = subtotal - discount1Amount;
    const discount2Amount = (afterDiscount1 * disc2) / 100;
    const afterDiscount2 = afterDiscount1 - discount2Amount;
    const additionalDiscountAmount = (afterDiscount2 * addDisc) / 100;
    const afterAllDiscount = afterDiscount2 - additionalDiscountAmount;

    const tax = afterAllDiscount * 0.11;
    const grandTotal = afterAllDiscount + tax;

    return {
      total: subtotal,
      tax,
      grand_total: grandTotal,
      discount1Amount,
      discount2Amount,
      additionalDiscountAmount,
      afterAllDiscount,
      afterDiscount2,
    };
  };

  const pricing = useMemo(calculatePricing, [formData.boq_items, formData.discount, companyLevelDiscount1, companyLevelDiscount2]);

  useEffect(() => {
    if (!isInitialLoad && isDirty) {
      setFormData(prev => ({
        ...prev,
        total: pricing.total,
        tax: pricing.tax,
        grand_total: pricing.grand_total,
      }));
    }
  }, [pricing, isInitialLoad, isDirty]);

  useEffect(() => setIsInitialLoad(false), []);

  const handleCustomerChange = (id: string) => {
    setFormData(prev => ({ ...prev, customer_id: id }));
    setIsDirty(true);
  };

  const handleQuotationSelect = (id: string) => {
    if (id === "none") {
      setFormData(prev => ({ ...prev, quotation_id: "" }));
      return;
    }
    const q = quotationOptions.find(item => item.id.toString() === id);
    if (q) {
      setFormData(prev => ({
        ...prev,
        quotation_id: id,
        customer_id: q.customer_id.toString(),
        discount: Number(q.discount_percent) || Number(q.discount) || 0,
        note: q.note || "",
      }));

      const detail = q.quotation_detail || [];
      const imported: SaleOrderDetail[] = (Array.isArray(detail) ? detail : JSON.parse(detail)).map((item: any, i: number) => ({
        id: `imp-${i}`,
        product_id: item.product_id,
        product_name: item.product_name,
        price: Number(item.unit_price),
        qty: Number(item.quantity),
        total: Number(item.unit_price) * Number(item.quantity),
        status: "ACTIVE",
      }));
      setFormData(prev => ({ ...prev, boq_items: imported }));
      setIsDirty(true);
    }
  };

  const getChangedFields = () => {
    const changed: any = {};
    Object.keys(formData).forEach(key => {
      const k = key as keyof SalesOrderFormData;
      if (k === "boq_items") return;

      if (formData[k] !== (originalData as any)?.[k]) {
        changed[k] = formData[k];
      }
    });

    // Compare formData.boq_items against the initial mapped details from salesOrder
    const initialItems = salesOrder?.sale_order_detail?.map(item => ({
      product_id: item.product_id != null ? Number(item.product_id) : undefined,
      product_name: item.product_name || "",
      price: Number(item.price) || 0,
      qty: Number(item.qty) || 0,
      total: Number(item.total) || 0,
      status: item.status || "ACTIVE"
    })) || [];

    // Simple comparison for boq_items changes - only relevant for NEW stage
    const currentItemsMapped = formData.boq_items.map(item => ({
      product_id: item.product_id ? Number(item.product_id) : undefined,
      product_name: item.product_name,
      price: Number(item.price),
      qty: Number(item.qty),
      total: Number(item.total),
      status: item.status
    }));

    if (JSON.stringify(currentItemsMapped) !== JSON.stringify(initialItems)) {
      changed.boq_items = formData.boq_items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        price: Number(item.price),
        qty: Number(item.qty),
        total: Number(item.total),
        status: item.status
      }));
    }
    return changed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = getChangedFields();
      if (mode === "add") {
        const result = await createSalesOrderAction({
          ...formData,
          boq_items: formData.boq_items.map(it => ({
            product_id: it.product_id,
            product_name: it.product_name,
            price: Number(it.price),
            qty: Number(it.qty),
            total: Number(it.total),
            status: "ACTIVE"
          }))
        } as any);
        if (result?.success) {
          toast.success("Sales Order created");
          onSuccess?.();
        }
      } else {
        const result = await updateSalesOrderAction(salesOrder!.id!, payload);
        if (result?.success) {
          toast.success("Sales Order updated");
          onSuccess?.();
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePOUploadSuccess = (fileName: string) => {
    setFormData(prev => ({ ...prev, file_po_customer: fileName }));
    setIsDirty(true);
  };

  const isFormValid = !!formData.sale_no && !!formData.customer_id && formData.boq_items.length > 0;

  return (
    <div className="w-full mx-auto py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "add" ? "Create Sales Order" : "Edit Sales Order"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "add" ? "Prepare a new sales order" : "Update order information"}
          </p>
        </div>
        {formData.sale_no && (
          <Badge variant="outline" className="text-base font-mono px-3 py-1 bg-white dark:bg-gray-900">
            {formData.sale_no}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sales Order Number</Label>
                    <Input value={formData.sale_no} disabled className="font-mono bg-gray-50 dark:bg-gray-800/40" />
                  </div>
                  <div className="space-y-2">
                    <Label>Record Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={v => handleInputChange("status", v)}
                      disabled={!isSuperuser(user)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Sale Workflow Status</Label>
                    <Select
                      value={formData.sale_status}
                      onValueChange={v => handleInputChange("sale_status", v)}
                      disabled={permissions?.availableActions.length === 0}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(SALE_STATUSES).filter(([_, value]) => {
                          if (isSuperuser(user)) return true;

                          const currentStatus = salesOrder?.sale_status || SALE_STATUSES.NEW;
                          const userRole = ((user as any)?.role_name || (user as any)?.roles?.role_name || "sales").toLowerCase();

                          // Dropdown status Sales: Tidak menampilkan NEW saat status sudah PR
                          if (userRole === "sales" && currentStatus === SALE_STATUSES.PR && value === SALE_STATUSES.NEW) {
                            return false;
                          }

                          // BLOCK PURCHASING IF REOPEN REQUEST PENDING
                          if (isPurchasing(user) && currentStatus === SALE_STATUSES.PR && hasPendingReopen) {
                            if ([SALE_STATUSES.PO, SALE_STATUSES.SR, SALE_STATUSES.FAR, SALE_STATUSES.DR].includes(value as any)) {
                              return false;
                            }
                          }

                          // Current role's allowed statuses
                          if (isSales(user)) {
                            // Manager Sales dan Superuser boleh PR -> NEW (reopen)
                            const canReopen = isManagerSales(user) && currentStatus === SALE_STATUSES.PR;

                            // Sales can move to PR
                            const allowed = [SALE_STATUSES.NEW, SALE_STATUSES.PR, SALE_STATUSES.RECEIVED, SALE_STATUSES.COMPLETED, SALE_STATUSES.CANCELLED];

                            if (canReopen && value === SALE_STATUSES.NEW) return true;
                            return (allowed as string[]).includes(value);
                          }
                          if (isPurchasing(user)) {
                            // Purchasing boleh PR -> NEW (untuk cancel/reject PR)
                            if (currentStatus === SALE_STATUSES.PR && value === SALE_STATUSES.NEW) return true;

                            // Purchasing TIDAK boleh pemicu NEW -> PR
                            const allowed = [SALE_STATUSES.PR, SALE_STATUSES.PO, SALE_STATUSES.SR, SALE_STATUSES.FAR, SALE_STATUSES.DR, SALE_STATUSES.CANCELLED];
                            if (currentStatus === SALE_STATUSES.NEW && value === SALE_STATUSES.PR) return false;

                            return (allowed as string[]).includes(value);
                          }
                          if (isWarehouse(user)) {
                            return ([SALE_STATUSES.DELIVERY, SALE_STATUSES.DELIVERED, SALE_STATUSES.CANCELLED] as string[]).includes(value);
                          }
                          if (isFinance(user)) {
                            return ([SALE_STATUSES.FAR, SALE_STATUSES.CANCELLED] as string[]).includes(value);
                          }
                          return value === formData.sale_status;
                        }).map(([_, value]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex flex-col">
                              <span className="font-bold">{STATUS_DESCRIPTIONS[value]?.label || value}</span>
                              <span className="text-[10px] text-muted-foreground">{STATUS_DESCRIPTIONS[value]?.role} Division</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {STATUS_DESCRIPTIONS[formData.sale_status] && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 italic pl-1 border-l-2 border-blue-200">
                        {STATUS_DESCRIPTIONS[formData.sale_status].desc}
                      </p>
                    )}
                    {/* PR Info Banner for Sales */}
                    {isSales(user) && !isManagerSales(user) && (salesOrder?.sale_status === SALE_STATUSES.PR) && !hasPendingReopen && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md flex gap-2 items-start">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-amber-800">
                          Sales Order sedang diproses Purchasing. Perubahan data harus melalui persetujuan Manager Sales.
                        </p>
                      </div>
                    )}

                    {/* Pending Reopen Warning for Purchasing & Managers */}
                    {hasPendingReopen && (isPurchasing(user) || isManagerSales(user)) && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md flex gap-2 items-start">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-red-800 font-medium">
                          Sales mengajukan permintaan perubahan data. Proses Purchasing sebaiknya ditunda sampai ada keputusan Manager Sales.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select value={formData.payment_status} onValueChange={v => handleInputChange("payment_status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Term</Label>
                    <Select
                      value={formData.payment_term_id?.toString() || ""}
                      onValueChange={v => handleInputChange("payment_term_id", v ? Number(v) : null)}
                      disabled={paymentTermsLoading}
                    >
                      <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                      <SelectContent>
                        {paymentTerms?.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name} {t.days ? `(${t.days} days)` : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Reference Quotation (Optional)</Label>
                  <Select
                    value={formData.quotation_id?.toString() || "none"}
                    onValueChange={handleQuotationSelect}
                    disabled={permissions && !isFieldEditable("quotation_id", permissions)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Manual / No Quote</SelectItem>
                      {quotationOptions.map(q => <SelectItem key={q.id} value={q.id.toString()}>{q.quotation_no} - {q.customers?.customer_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Sales Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SalesOrderItemsTable
                  items={formData.boq_items}
                  user={user}
                  editable={mode === "add" || (permissions && isFieldEditable("items", permissions))}
                  onChange={(newItems) => handleInputChange("boq_items", newItems)}
                  onStatusUpdated={() => {
                    // Logic to refresh data if needed
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.note}
                  onChange={e => handleInputChange("note", e.target.value)}
                  placeholder="Insert notes here..."
                  rows={4}
                  disabled={permissions && !isFieldEditable("note", permissions)}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b dark:border-gray-700">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {isCustomerEditMode || !customerDetail ? (
                    <div className="space-y-2">
                      <Label>Customer <span className="text-red-500">*</span></Label>
                      <Select value={formData.customer_id?.toString()} onValueChange={id => { handleCustomerChange(id); setIsCustomerEditMode(false); }}>
                        <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                        <SelectContent>
                          {customerOptions.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.customer_name} {c.company?.company_name ? `(${c.company.company_name})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : customerLoading || customerLoadingDelay ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase">Name</Label>
                        <div className="font-medium p-2 bg-gray-50 dark:bg-gray-800/40 border rounded mt-1">{customerDetail.customer_name}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase">Company</Label>
                        <div className="p-2 border rounded mt-1">{customerDetail.company?.company_name || "-"}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase">Level</Label>
                        <div className="p-2 border rounded mt-1">{companyLevelName || "-"} ({companyLevelDiscount1}% / {companyLevelDiscount2}%)</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => setIsCustomerEditMode(true)}
                        disabled={permissions && !isFieldEditable("customer_id", permissions)}
                      >
                        Change Customer
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b dark:border-gray-700">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(pricing.total)}</span>
                  </div>

                  {pricing.discount1Amount > 0 && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Disc 1 ({companyLevelDiscount1}%)</span>
                      <span>-{formatCurrency(pricing.discount1Amount)}</span>
                    </div>
                  )}
                  {pricing.discount2Amount > 0 && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Disc 2 ({companyLevelDiscount2}%)</span>
                      <span>-{formatCurrency(pricing.discount2Amount)}</span>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs">Additional Discount (%)</Label>
                    <Input
                      type="number"
                      value={formData.discount}
                      onChange={e => handleInputChange("discount", parseFloat(e.target.value) || 0)}
                      className="h-8"
                      disabled={permissions && !isFieldEditable("discount", permissions)}
                    />
                  </div>

                  {pricing.additionalDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-600 pt-1">
                      <span>Additional Discount</span>
                      <span>-{formatCurrency(pricing.additionalDiscountAmount)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-dashed">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (11%)</span>
                      <span className="font-medium">{formatCurrency(pricing.tax)}</span>
                    </div>
                  </div>

                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Grand Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(pricing.grand_total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Customer PO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <POFileUpload
                  salesOrderId={salesOrder?.id || "NEW"}
                  currentFile={formData.file_po_customer}
                  onUploadSuccess={handlePOUploadSuccess}
                  onDeleteSuccess={() => setFormData(prev => ({ ...prev, file_po_customer: "" }))}
                  disabled={permissions && !isFieldEditable("file_po_customer", permissions)}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancel</Button>

          {permissions.canRequestReopen && !hasPendingReopen && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowReopenDialog(true)}
              className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
            >
              Request Reopen
            </Button>
          )}

          {hasPendingReopen && isManagerSales(user) && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const newNote = `${formData.note}\n${REOPEN_SYSTEM_PREFIXES.REJECTED} oleh Manager Sales`;
                    const result = await updateSalesOrderAction(salesOrder!.id!, { note: newNote });
                    if (result?.success) {
                      toast.success("Request Reopen ditolak");
                      handleInputChange("note", newNote);
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Reject Reopen
              </Button>
              <Button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const newNote = `${formData.note}\n${REOPEN_SYSTEM_PREFIXES.APPROVED} oleh Manager Sales`;
                    const result = await updateSalesOrderAction(salesOrder!.id!, {
                      sale_status: SALE_STATUSES.NEW,
                      note: newNote
                    });
                    if (result?.success) {
                      toast.success("Request Reopen disetujui, SO kembali ke NEW");
                      handleInputChange("note", newNote);
                      handleInputChange("sale_status", SALE_STATUSES.NEW);
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Approve & Reopen
              </Button>
            </div>
          )}

          <Button type="submit" disabled={loading || !isFormValid || (!isDirty && mode === "edit")}>
            {loading ? "Processing..." : `${mode === "add" ? "Create" : "Update"} Sales Order`}
          </Button>
        </div>

        <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Reopen Sales Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Sales Order ini sudah berada di tahap <strong>Purchasing (PR)</strong>. Anda dapat meminta pembukaan kembali status ke <strong>NEW</strong> untuk melakukan perubahan.
              </p>
              <div className="space-y-2">
                <Label>Alasan Perubahan</Label>
                <Textarea
                  placeholder="Contoh: Perubahan jumlah item atas permintaan customer..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button
                onClick={async () => {
                  if (!reopenReason.trim()) {
                    toast.error("Mohon isi alasan perubahan");
                    return;
                  }
                  setLoading(true);
                  try {
                    const newNote = `${formData.note ? formData.note + "\n" : ""}${REOPEN_SYSTEM_PREFIXES.REQUEST}: ${reopenReason}`;
                    const result = await updateSalesOrderAction(salesOrder!.id!, { note: newNote });
                    if (result?.success) {
                      toast.success("Permintaan reopen telah diajukan via Note ke Manager");
                      handleInputChange("note", newNote);
                      setShowReopenDialog(false);
                      setReopenReason("");
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Permintaan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
}
