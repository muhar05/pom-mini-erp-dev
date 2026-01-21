"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  CreateSalesOrderData,
  UpdateSalesOrderData,
  validateSalesOrderFormData,
} from "@/lib/schemas/sales-orders";
import {
  createSalesOrderAction,
  updateSalesOrderAction,
  generateSalesOrderNumberAction,
} from "@/app/actions/sales-orders";
import { getAllCustomersAction } from "@/app/actions/customers";
import { getAllProductsAction } from "@/app/actions/products";
import { getAllQuotationsAction } from "@/app/actions/quotations";
import { getSalesOrderByIdAction } from "@/app/actions/sales-orders";
import { useSession } from "@/contexts/session-context";
import { useCustomerById } from "@/hooks/customers/useCustomerById";
import {
  usePaymentTerms,
  usePaymentTermById,
} from "@/hooks/payment-terms/usePaymentTerms";
import { users } from "@/types/models";
import { ZodError } from "zod";
import toast from "react-hot-toast";
import POFileUpload from "./po-file-upload";
import BoqTable from "../../quotations/_components/BoqTable";
import type { BoqItem } from "../../quotations/_components/BoqTable";

type SalesOrderFormData = {
  sale_no: string;
  customer_id: string | number;
  quotation_id?: string | number; // Pastikan optional
  boq_items: BoqItem[];
  total: number;
  discount: number;
  shipping: number;
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
  { value: "NEW", label: "Baru" },
  { value: "PR", label: "Sudah Purchase Request" },
  { value: "PO", label: "Sudah Purchase Order" },
  { value: "SR", label: "Sudah Stock Reservation" },
  { value: "FAR", label: "Sudah input Finance Approval Request" },
  { value: "DR", label: "Sudah input Delivery Request" },
  { value: "DELIVERED", label: "Sudah dikirim semua barang" },
  { value: "DELIVERY", label: "Sudah dikirim semua barang" },
  { value: "RECEIVED", label: "Sudah diterima semua barang oleh customer" },
];

// ...existing code...

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const session = useSession();

  const [loading, setLoading] = useState(false);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isCustomerEditMode, setIsCustomerEditMode] = useState(false);
  const [customerLoadingDelay, setCustomerLoadingDelay] = useState(false);

  // Form data state - mirip quotation form
  const [formData, setFormData] = useState<SalesOrderFormData>({
    sale_no: salesOrder?.sale_no || "",
    customer_id: salesOrder?.customer_id || "",
    quotation_id: salesOrder?.quotation_id || "",
    boq_items: salesOrder?.sale_order_detail
      ? salesOrder.sale_order_detail.map((item) => ({
          id: item.id?.toString() || `item-${Date.now()}`,
          product_id:
            item.product_id != null ? Number(item.product_id) : undefined, // <-- fix here
          product_name: item.product_name || "",
          product_code: item.product_code || "",
          quantity: Number(item.qty) || 0,
          unit_price: Number(item.price) || 0,
          unit: item.unit || "pcs",
        }))
      : [],
    total: Number(salesOrder?.total) || 0,
    shipping: Number(salesOrder?.shipping) || 0,
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

  const [boqItems, setBoqItems] = useState<BoqItem[]>(
    salesOrder?.sale_order_detail
      ? salesOrder.sale_order_detail.map((item) => ({
          id: item.id?.toString() || `item-${Date.now()}`,
          product_id:
            item.product_id != null ? Number(item.product_id) : undefined, // <-- fix here
          product_name: item.product_name || "",
          product_code: item.product_code || "",
          quantity: Number(item.qty) || 0,
          unit_price: Number(item.price) || 0,
          unit: item.unit || "pcs",
        }))
      : [],
  );

  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [quotationOptions, setQuotationOptions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [user, setUser] = useState<users | null>(null);
  const [originalData] = useState(salesOrder);

  // Hooks untuk payment terms dan customer detail - sama seperti quotation
  const { paymentTerms, isLoading: paymentTermsLoading } = usePaymentTerms();
  const { customer: customerDetail, loading: customerLoading } =
    useCustomerById(formData.customer_id);

  // Company level & diskon - sama seperti quotation
  const companyLevel = customerDetail?.company?.company_level;
  const companyLevelDiscount1 = companyLevel?.disc1 ?? 0;
  const companyLevelDiscount2 = companyLevel?.disc2 ?? 0;
  const companyLevelName = companyLevel?.level_name ?? "";

  // Trigger delay when customer_id changes - sama seperti quotation
  useEffect(() => {
    if (!formData.customer_id) return;
    setCustomerLoadingDelay(true);
    const timer = setTimeout(() => {
      setCustomerLoadingDelay(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.customer_id]);

  // Generate sales order number
  useEffect(() => {
    if (mode === "add" && !salesOrder?.sale_no) {
      const generateNumber = async () => {
        try {
          setGeneratingNumber(true);
          const saleNo = await generateSalesOrderNumberAction();
          setFormData((prev) => ({ ...prev, sale_no: saleNo }));
        } catch (error) {
          console.error("Error generating sales order number:", error);
        } finally {
          setGeneratingNumber(false);
        }
      };
      generateNumber();
    }
  }, [mode, salesOrder]);

  // Fetch customers
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await getAllCustomersAction();
        setCustomerOptions(res.data || []);
      } catch {
        setCustomerOptions([]);
      }
    }
    fetchCustomers();
  }, []);

  // Fetch quotations
  useEffect(() => {
    async function fetchQuotations() {
      try {
        const quotations = await getAllQuotationsAction();
        const availableQuotations = (quotations || []).filter(
          (q: any) => q.status === "sq_approved",
        );
        setQuotationOptions(availableQuotations);
      } catch (error) {
        console.error("Error fetching quotations:", error);
        setQuotationOptions([]);
      }
    }
    fetchQuotations();
  }, []);

  // Set user info when session changes
  useEffect(() => {
    if (session?.user) {
      setUser(session.user as unknown as users);
    }
  }, [session]);

  // Handle input change - sama seperti quotation
  const handleInputChange = (
    field: keyof SalesOrderFormData,
    value: string | number | BoqItem[],
  ) => {
    let newValue = value;
    if (
      ["total", "tax", "grand_total", "discount", "shipping"].includes(field)
    ) {
      newValue = typeof value === "string" ? Number(value) : value;
    }
    setFormData((prev) => ({ ...prev, [field]: newValue }));
    setIsDirty(true);
  };

  // Handle BOQ change - sama seperti quotation
  const handleBoqChange = (items: BoqItem[]) => {
    setBoqItems(items);
    setIsDirty(true);
  };

  // Perhitungan pricing - SAMA PERSIS dengan quotation
  const calculatePricing = () => {
    const subtotal = boqItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );

    const disc1 = companyLevelDiscount1 || 0;
    const disc2 = companyLevelDiscount2 || 0;
    const addDisc = Number(formData.discount) || 0;

    // Diskon company 1
    const discount1Amount = (subtotal * disc1) / 100;
    const afterDiscount1 = subtotal - discount1Amount;

    // Diskon company 2
    const discount2Amount = disc2 > 0 ? (afterDiscount1 * disc2) / 100 : 0;
    const afterDiscount2 = afterDiscount1 - discount2Amount;

    // Additional discount
    const additionalDiscountAmount =
      addDisc > 0 ? (afterDiscount2 * addDisc) / 100 : 0;
    const afterAllDiscount = afterDiscount2 - additionalDiscountAmount;

    // Tax 11%
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

  // Display variables - sama seperti quotation
  const pricing = calculatePricing();
  const {
    total: subtotal,
    discount1Amount,
    discount2Amount,
    additionalDiscountAmount,
    afterAllDiscount,
    afterDiscount2,
  } = pricing;
  const additionalDiscountPercent = Number(formData.discount) || 0;
  const displayTax = pricing.tax;
  const displayGrandTotal = pricing.grand_total;

  // Calculate totals - sama seperti quotation
  const calculateTotals = () => {
    const pricing = calculatePricing();
    setFormData((prev) => ({
      ...prev,
      total: pricing.total,
      tax: pricing.tax,
      grand_total: pricing.grand_total,
    }));
  };

  // Set isInitialLoad to false after first render
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // Only recalculate totals if user has changed pricing-related fields
  useEffect(() => {
    if (!isInitialLoad && isDirty) {
      calculateTotals();
    }
  }, [boqItems, formData.discount, isDirty, isInitialLoad]);

  // Handle customer change - sama seperti quotation
  const handleCustomerChange = (customerId: string) => {
    const customer = customerOptions.find(
      (c) => c.id.toString() === customerId,
    );
    setSelectedCustomer(customer);
    setFormData((prev) => ({
      ...prev,
      customer_id: customerId,
    }));
    calculateTotals();
  };

  // Handle quotation selection
  const handleQuotationSelect = (quotationId: string) => {
    if (quotationId === "none") {
      setSelectedQuotation(null);
      setFormData((prev) => ({ ...prev, quotation_id: "" }));
      return;
    }

    const quotation = quotationOptions.find(
      (q) => q.id.toString() === quotationId,
    );
    if (quotation) {
      setSelectedQuotation(quotation);
      setFormData((prev) => ({
        ...prev,
        quotation_id: quotationId,
        customer_id: quotation.customer_id.toString(),
        total: Number(quotation.total) || 0,
        discount: Number(quotation.discount) || 0,
        shipping: Number(quotation.shipping) || 0,
        tax: Number(quotation.tax) || 0,
        grand_total: Number(quotation.grand_total) || 0,
      }));

      // Set selected customer
      const customer = customerOptions.find(
        (c) => c.id === quotation.customer_id,
      );
      if (customer) {
        setSelectedCustomer(customer);
      }

      // Import quotation BOQ
      if (quotation.quotation_detail) {
        let quotationDetail = [];
        try {
          quotationDetail = Array.isArray(quotation.quotation_detail)
            ? quotation.quotation_detail
            : JSON.parse(quotation.quotation_detail);
        } catch {
          quotationDetail = [];
        }

        const importedItems: BoqItem[] = quotationDetail.map(
          (item: any, index: number) => ({
            id: `imported-${index}`,
            product_id: item.product_id || null,
            product_name: item.product_name || "",
            product_code: item.product_code || "",
            quantity: Number(item.quantity) || 0,
            unit_price: Number(item.unit_price) || 0,
            unit: item.unit || "pcs",
          }),
        );
        setBoqItems(importedItems);
      }
    }
  };

  // Get changed fields - sama seperti quotation
  const getChangedFields = () => {
    const changed: any = {};
    Object.keys(formData).forEach((key) => {
      if (
        formData[key as keyof SalesOrderFormData] !==
        originalData?.[key as keyof SalesOrder]
      ) {
        changed[key] = formData[key as keyof SalesOrderFormData];
      }
    });
    if (
      JSON.stringify(boqItems) !==
      JSON.stringify(originalData?.sale_order_detail)
    ) {
      changed.boq_items = boqItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        price: item.unit_price,
        qty: item.quantity,
        total: item.unit_price * item.quantity,
        status: "ACTIVE",
      }));
    }
    return changed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "add") {
        const dataToSend: CreateSalesOrderData = {
          sale_no: formData.sale_no,
          quotation_id: formData.quotation_id?.toString() || undefined, // Convert to string
          customer_id: formData.customer_id?.toString() || undefined, // Convert to string
          total: formData.total,
          discount: formData.discount,
          shipping: formData.shipping,
          tax: formData.tax,
          grand_total: formData.grand_total,
          status: formData.status,
          note: formData.note,
          sale_status: formData.sale_status,
          payment_status: formData.payment_status,
          file_po_customer: formData.file_po_customer || undefined,
          boq_items: boqItems.map((item) => ({
            product_id: item.product_id || undefined, // Convert null to undefined
            product_name: item.product_name,
            product_code: item.product_code,
            price: item.unit_price,
            qty: item.quantity,
            total: item.unit_price * item.quantity,
            status: "ACTIVE",
          })),
        };

        const result = await createSalesOrderAction(dataToSend);
        if (result?.success) {
          toast.success("Sales order created successfully");
          setIsDirty(false);
          if (onSuccess) onSuccess();
        } else {
          toast.error(result?.message || "Failed to create sales order");
        }
      } else {
        const changedFields = getChangedFields();
        if (formData.payment_term_id !== originalData?.payment_term_id) {
          changedFields.payment_term_id = formData.payment_term_id;
        }

        // Convert customer_id and quotation_id to string if needed
        if (changedFields.customer_id) {
          changedFields.customer_id = changedFields.customer_id.toString();
        }
        if (changedFields.quotation_id) {
          changedFields.quotation_id = changedFields.quotation_id.toString();
        }

        const result = await updateSalesOrderAction(
          salesOrder!.id!,
          changedFields,
        );
        if (result?.success) {
          toast.success("Sales order updated successfully");
          setIsDirty(false);
          if (onSuccess) onSuccess();
        } else {
          toast.error(result?.message || "Failed to update sales order");
        }
      }
    } catch (error) {
      toast.error("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePOUploadSuccess = (fileUrl: string) => {
    const fileName = fileUrl.split("/").pop() || "";
    setFormData((prev) => ({
      ...prev,
      file_po_customer: fileName,
    }));
    setIsDirty(true);
  };

  // Form validation - sama seperti quotation
  const isFormValid =
    !!formData.sale_no &&
    !!formData.customer_id &&
    boqItems.length > 0 &&
    boqItems.every(
      (item) => item.product_name && item.quantity > 0 && item.unit_price >= 0,
    );

  return (
    <div className="w-full mx-auto py-4 space-y-6">
      {/* Header - sama seperti quotation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "add" ? "Create Sales Order" : "Edit Sales Order"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "add"
              ? "Create a new sales order"
              : "Update the sales order details"}
          </p>
        </div>
        {formData.sale_no && (
          <Badge variant="outline" className="text-base font-mono px-3 py-1">
            {formData.sale_no}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Grid Layout - sama seperti quotation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sales Order Information Card */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Sales Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="sale_no"
                      className="flex items-center gap-1"
                    >
                      Sales Order Number
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sale_no"
                      value={formData.sale_no}
                      onChange={(e) =>
                        handleInputChange("sale_no", e.target.value)
                      }
                      placeholder={
                        generatingNumber ? "Generating..." : "Auto-generated"
                      }
                      disabled={true}
                      required
                      className="font-mono"
                    />
                    {generatingNumber && (
                      <p className="text-xs text-gray-500">
                        Generating sales order number...
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Status Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sale_status">Sale Status</Label>
                    <Select
                      value={formData.sale_status}
                      onValueChange={(value) =>
                        handleInputChange("sale_status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SALE_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select
                      value={formData.payment_status}
                      onValueChange={(value) =>
                        handleInputChange("payment_status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_term_id">Terms of Payment</Label>
                    <Select
                      value={formData.payment_term_id?.toString() || ""}
                      onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          payment_term_id: value ? Number(value) : null,
                        }));
                        setIsDirty(true);
                      }}
                      disabled={paymentTermsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Terms of Payment" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTerms?.map((term) => (
                          <SelectItem key={term.id} value={term.id.toString()}>
                            {term.name}
                            {term.days ? ` (${term.days} days)` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Quotation Reference - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="quotation">From Quotation (Optional)</Label>
                  <Select
                    value={formData.quotation_id?.toString() || ""}
                    onValueChange={handleQuotationSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quotation or create manually" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Create Manually</SelectItem>
                      {quotationOptions.map((quotation) => (
                        <SelectItem
                          key={quotation.id}
                          value={quotation.id.toString()}
                        >
                          {quotation.quotation_no} -{" "}
                          {quotation.customer?.customer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bill of Quantity Card - sama seperti quotation */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Bill of Quantity (BOQ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BoqTable items={boqItems} onChange={handleBoqChange} />
              </CardContent>
            </Card>

            {/* Notes Card - sama seperti quotation */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  placeholder="Add any additional notes or comments here..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Customer & Pricing Information - sama seperti quotation */}
          <div className="space-y-6">
            {/* Customer Information Card - sama seperti quotation */}
            <Card className="dark:bg-gray-800 border dark:border-gray-700">
              <CardHeader className="pb-4 border-b dark:border-gray-700">
                <CardTitle className="text-lg font-medium flex items-center gap-3 dark:text-white">
                  <Calendar className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="space-y-5">
                  {/* Customer selection or display */}
                  {isCustomerEditMode || !customerDetail ? (
                    <div className="space-y-3">
                      <Label
                        htmlFor="customer_id"
                        className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5"
                      >
                        Customer <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.customer_id?.toString() || ""}
                        onValueChange={(value) => {
                          handleCustomerChange(value);
                          setIsCustomerEditMode(false);
                        }}
                      >
                        <SelectTrigger className="h-11 dark:border-gray-600 dark:bg-gray-900 w-full">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customerOptions.map((customer) => (
                            <SelectItem
                              key={customer.id}
                              value={customer.id.toString()}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {customer.customer_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {customer.company?.company_name ||
                                    "No company"}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : customerLoading || customerLoadingDelay ? (
                    // Skeleton loader
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="md:col-span-2">
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div>
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div>
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div>
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div>
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div>
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="md:col-span-2">
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ) : (
                    customerDetail && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="md:col-span-2">
                          <Label className="text-xs mb-1 block">
                            Customer Name
                          </Label>
                          <Input
                            value={customerDetail.customer_name || "—"}
                            disabled
                            className="bg-gray-100 dark:bg-gray-800/40"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Company</Label>
                          <Input
                            value={customerDetail.company?.company_name || "—"}
                            disabled
                            className="bg-gray-100 dark:bg-gray-800/40"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">
                            Company Level
                          </Label>
                          <Input
                            value={
                              customerDetail.company?.company_level?.level_name
                                ? customerDetail.company.company_level
                                    .level_name
                                : "—"
                            }
                            disabled
                            className="bg-gray-100 dark:bg-gray-800/40"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Type</Label>
                          <Input
                            value={customerDetail.type || "—"}
                            disabled
                            className="bg-gray-100 dark:bg-gray-800/40"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Email</Label>
                          <Input
                            value={customerDetail.email || "—"}
                            disabled
                            className="bg-gray-100 dark:bg-gray-800/40"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Phone</Label>
                          <Input
                            value={customerDetail.phone || "—"}
                            disabled
                            className="bg-gray-100 dark:bg-gray-800/40"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs mb-1 block">Address</Label>
                          <Input
                            value={
                              customerDetail.address || "No address provided"
                            }
                            disabled
                            className="bg-gray-100 dark:bg-gray-800/40"
                          />
                        </div>
                      </div>
                    )
                  )}
                  {/* Edit Button */}
                  {customerDetail &&
                    !customerLoading &&
                    !customerLoadingDelay && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mb-2"
                        onClick={() => setIsCustomerEditMode(true)}
                      >
                        Edit Customer
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information Card - sama seperti quotation */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Info Diskon Company */}
                  <div className="flex flex-col gap-1 mb-2">
                    <span>
                      Company Level Discount 1: <b>{companyLevelDiscount1}%</b>
                    </span>
                    <span>
                      Company Level Discount 2: <b>{companyLevelDiscount2}%</b>
                    </span>
                    {companyLevelName && <span>Level: {companyLevelName}</span>}
                  </div>

                  {/* Pricing summary */}
                  {formData.customer_id &&
                    customerDetail &&
                    !customerLoading && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Subtotal
                          </span>
                          <span className="font-medium">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>

                        {/* Company Discounts */}
                        {companyLevelDiscount1 > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700">
                              Discount 1 ({companyLevelDiscount1}%)
                            </span>
                            <span className="font-medium text-blue-700">
                              -{formatCurrency(discount1Amount)}
                            </span>
                          </div>
                        )}

                        {companyLevelDiscount2 > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-700">
                              Discount 2 ({companyLevelDiscount2}%)
                            </span>
                            <span className="font-medium text-purple-700">
                              -{formatCurrency(discount2Amount)}
                            </span>
                          </div>
                        )}

                        {(companyLevelDiscount1 > 0 ||
                          companyLevelDiscount2 > 0) && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              After Company Discounts
                            </span>
                            <span className="font-medium">
                              {formatCurrency(afterDiscount2)}
                            </span>
                          </div>
                        )}

                        {/* Additional Discount */}
                        <div className="space-y-2">
                          <Label htmlFor="discount">
                            Additional Discount (%)
                          </Label>
                          <Input
                            id="discount"
                            type="number"
                            value={formData.discount}
                            onChange={(e) =>
                              handleInputChange(
                                "discount",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                        {additionalDiscountPercent > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-red-600">
                              Additional Discount ({additionalDiscountPercent}%)
                            </span>
                            <span className="font-medium text-red-600">
                              -{formatCurrency(additionalDiscountAmount)}
                            </span>
                          </div>
                        )}

                        {/* After all discounts */}
                        {(companyLevelDiscount1 > 0 ||
                          companyLevelDiscount2 > 0 ||
                          additionalDiscountPercent > 0) && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              After All Discounts{" "}
                              <span className="italic">(before tax)</span>
                            </span>
                            <span className="font-medium">
                              {formatCurrency(afterAllDiscount)}
                            </span>
                          </div>
                        )}

                        {/* Tax 11% */}
                        <div className="space-y-2">
                          <Label htmlFor="tax">Tax (11%)</Label>
                          <Input
                            id="tax"
                            type="text"
                            value={formatCurrency(displayTax)}
                            disabled
                            className="bg-gray-100 dark:bg-gray-800/40"
                          />
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center pt-2">
                          <span className="font-semibold">Grand Total</span>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {formatCurrency(displayGrandTotal)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Subtotal: {formatCurrency(subtotal)}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  {!formData.customer_id && (
                    <div className="text-sm text-muted-foreground">
                      Select customer first to see pricing calculations.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* File Upload Card - KHUSUS SALES ORDER */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Customer PO File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <POFileUpload
                  salesOrderId={salesOrder?.id || ""}
                  currentFile={formData.file_po_customer}
                  onUploadSuccess={handlePOUploadSuccess}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions - sama seperti quotation */}
        <div className="flex gap-3 justify-end pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || generatingNumber || !isFormValid || !isDirty}
            className="min-w-[150px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {mode === "add" ? "Creating..." : "Updating..."}
              </span>
            ) : (
              `${mode === "add" ? "Create" : "Update"} Sales Order`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
