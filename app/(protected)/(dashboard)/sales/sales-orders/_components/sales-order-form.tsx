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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Upload, Package, User, DollarSign, FileText, Download, Eye, X } from "lucide-react";
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
import BoqTable, { BoqItem } from "../../quotations/_components/BoqTable";
import POFileUpload from "./po-file-upload";

type SalesOrderFormData = {
  sale_no: string;
  customer_id: string | number;
  quotation_id?: string | number;
  boq_items: BoqItem[];
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

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "CANCELLED", label: "Cancelled" },
];

const SALE_STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
];

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

  // Inisialisasi state - SAMA DENGAN FORM QUOTATION (Konversi Decimal ke Number)
  const [formData, setFormData] = useState<SalesOrderFormData>({
    sale_no: salesOrder?.sale_no || "",
    customer_id: salesOrder?.customer_id || "",
    quotation_id: salesOrder?.quotation_id || "",
    boq_items: salesOrder?.sale_order_detail
      ? salesOrder.sale_order_detail.map((item) => ({
        id: item.id?.toString() || `item-${Date.now()}`,
        product_id: item.product_id != null ? Number(item.product_id) : undefined,
        product_name: item.product_name || "",
        product_code: item.product_code || "",
        quantity: Number(item.qty) || 0,
        unit_price: Number(item.price) || 0,
      }))
      : [],
    total: Number(salesOrder?.total) || 0,
    discount: Number(salesOrder?.discount) || 0,
    tax: Number(salesOrder?.tax) || 0,
    grand_total: Number(salesOrder?.grand_total) || 0,
    status: salesOrder?.status || "DRAFT",
    note: salesOrder?.note || "",
    sale_status: salesOrder?.sale_status || "OPEN",
    payment_status: salesOrder?.payment_status || "UNPAID",
    file_po_customer: salesOrder?.file_po_customer || "",
    payment_term_id: salesOrder?.payment_term_id ?? null,
  });

  const [boqItems, setBoqItems] = useState<BoqItem[]>(formData.boq_items);
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [quotationOptions, setQuotationOptions] = useState<any[]>([]);
  const [user, setUser] = useState<users | null>(null);
  const [originalData] = useState(salesOrder);

  // Hooks pendukung
  const { paymentTerms, isLoading: paymentTermsLoading } = usePaymentTerms();
  const { customer: customerDetail, loading: customerLoading } = useCustomerById(formData.customer_id);

  // Info Diskon & Level - Konversi Decimal ke Number
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
    if (session?.user) setUser(session.user as unknown as users);
  }, [session]);

  // Helpers
  const handleInputChange = (field: keyof SalesOrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const calculatePricing = () => {
    const subtotal = boqItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
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

  const pricing = useMemo(calculatePricing, [boqItems, formData.discount, companyLevelDiscount1, companyLevelDiscount2]);

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
      const imported: BoqItem[] = (Array.isArray(detail) ? detail : JSON.parse(detail)).map((item: any, i: number) => ({
        id: `imp-${i}`,
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      }));
      setBoqItems(imported);
      setFormData(prev => ({ ...prev, boq_items: imported }));
      setIsDirty(true);
    }
  };

  const getChangedFields = () => {
    const changed: any = {};
    Object.keys(formData).forEach(key => {
      const k = key as keyof SalesOrderFormData;
      // Skip boq_items in the general loop to handle it separately with proper mapping
      if (k === "boq_items") return;

      if (formData[k] !== (originalData as any)?.[k]) {
        changed[k] = formData[k];
      }
    });

    // Compare boqItems against the initial mapped details from salesOrder
    const initialBoq = salesOrder?.sale_order_detail?.map(item => ({
      product_id: item.product_id != null ? Number(item.product_id) : undefined,
      product_name: item.product_name || "",
      product_code: item.product_code || "",
      quantity: Number(item.qty) || 0,
      unit_price: Number(item.price) || 0,
    })) || [];

    if (JSON.stringify(boqItems) !== JSON.stringify(initialBoq)) {
      changed.boq_items = boqItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        price: item.unit_price,
        qty: item.quantity,
        total: item.unit_price * item.quantity,
        status: "ACTIVE"
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
          boq_items: boqItems.map(it => ({
            product_id: it.product_id,
            product_name: it.product_name,
            product_code: it.product_code,
            price: it.unit_price,
            qty: it.quantity,
            total: it.unit_price * it.quantity,
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

  const isFormValid = !!formData.sale_no && !!formData.customer_id && boqItems.length > 0;

  return (
    <div className="w-full mx-auto py-4 space-y-6">
      {/* Header - Layout konsisten dengan Quotation */}
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
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sales Order Information Card */}
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
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={v => handleInputChange("status", v)}>
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
                    <Label>Sale Status</Label>
                    <Select value={formData.sale_status} onValueChange={v => handleInputChange("sale_status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SALE_STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                  <Select value={formData.quotation_id?.toString() || "none"} onValueChange={handleQuotationSelect}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Manual / No Quote</SelectItem>
                      {quotationOptions.map(q => <SelectItem key={q.id} value={q.id.toString()}>{q.quotation_no} - {q.customers?.customer_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* BOQ Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Bill of Quantity (BOQ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BoqTable items={boqItems} onChange={setBoqItems} />
              </CardContent>
            </Card>

            {/* Note Card */}
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
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer Information Card */}
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
                      <Button variant="outline" size="sm" onClick={() => setIsCustomerEditMode(true)}>Change Customer</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary Card */}
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

            {/* Customer PO Section - KHUSUS SALES ORDER */}
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
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading || !isFormValid || (!isDirty && mode === "edit")}>
            {loading ? "Processing..." : `${mode === "add" ? "Create" : "Update"} Sales Order`}
          </Button>
        </div>
      </form>
    </div>
  );
}
