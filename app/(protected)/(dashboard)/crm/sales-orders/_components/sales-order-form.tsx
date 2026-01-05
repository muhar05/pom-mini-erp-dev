"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";
import toast from "react-hot-toast";
import { useSession } from "@/contexts/session-context";
import { users } from "@/types/models";
import {
  createSalesOrderAction,
  generateSalesOrderNumberAction,
  createSalesOrderFromQuotationAction,
} from "@/app/actions/sales-orders";
import { getAllCustomersAction } from "@/app/actions/customers";
import { getAllQuotationsAction } from "@/app/actions/quotations";
import {
  validateSalesOrderFormData,
  CreateSalesOrderData,
} from "@/lib/schemas/sales-orders";
import { ZodError } from "zod";
import {
  Building,
  Calendar,
  FileText,
  Package,
  Calculator,
  CreditCard,
} from "lucide-react";

type SalesOrderFormData = {
  sale_no: string;
  quotation_id: string;
  total: number;
  discount: number;
  shipping: number;
  tax: number;
  grand_total: number;
  status: string;
  note: string;
  sale_status: string;
  payment_status: string;
  file_po_customer: string;
};

type SalesOrder = {
  id?: string;
  sale_no: string;
  quotation_id?: string | null;
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
  created_at?: Date | null;
};

interface SalesOrderFormProps {
  mode: "add" | "edit";
  salesOrder?: SalesOrder;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface FormErrors {
  [key: string]: string;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "CANCELLED", label: "Cancelled" },
];

const SALE_STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const session = useSession();

  const [loading, setLoading] = useState(false);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<SalesOrderFormData>({
    sale_no: salesOrder?.sale_no || "",
    quotation_id: salesOrder?.quotation_id || "",
    total: Number(salesOrder?.total) || 0,
    discount: Number(salesOrder?.discount) || 0,
    shipping: Number(salesOrder?.shipping) || 0,
    tax: Number(salesOrder?.tax) || 0,
    grand_total: Number(salesOrder?.grand_total) || 0,
    status: salesOrder?.status || "DRAFT",
    note: salesOrder?.note || "",
    sale_status: salesOrder?.sale_status || "OPEN",
    payment_status: salesOrder?.payment_status || "UNPAID",
    file_po_customer: salesOrder?.file_po_customer || "",
  });

  const [quotationOptions, setQuotationOptions] = useState<any[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [user, setUser] = useState<users | null>(null);

  // Generate sales order number for new sales orders
  useEffect(() => {
    if (mode === "add" && !salesOrder?.sale_no) {
      const generateNumber = async () => {
        try {
          setGeneratingNumber(true);
          const saleNo = await generateSalesOrderNumberAction();
          setFormData((prev) => ({ ...prev, sale_no: saleNo }));
        } catch (error) {
          console.error("Error generating sales order number:", error);
          toast.error("Failed to generate sales order number");
        } finally {
          setGeneratingNumber(false);
        }
      };

      generateNumber();
    }
  }, [mode, salesOrder]);

  // Handle quotation conversion
  useEffect(() => {
    const quotationId = searchParams.get("quotationId");
    if (quotationId && mode === "add") {
      // Pre-fill form with quotation data if coming from quotation conversion
      setFormData((prev) => ({ ...prev, quotation_id: quotationId }));
    }
  }, [searchParams, mode]);

  // Fetch quotations for selection
  useEffect(() => {
    async function fetchQuotations() {
      try {
        const quotations = await getAllQuotationsAction();
        // Filter only approved quotations that haven't been converted to sales orders
        const availableQuotations = (quotations || []).filter(
          (q: any) => q.status === "approved" || q.status === "sq_approved"
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

  const handleInputChange = (
    field: keyof SalesOrderFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle quotation selection
  const handleQuotationSelect = (quotationId: string) => {
    if (quotationId === "none") {
      // Clear quotation selection
      setSelectedQuotation(null);
      setFormData((prev) => ({
        ...prev,
        quotation_id: "",
        // Don't reset financial values when clearing quotation
        // User might want to keep manually entered values
      }));
      return;
    }

    const quotation = quotationOptions.find(
      (q) => q.id.toString() === quotationId
    );
    if (quotation) {
      setSelectedQuotation(quotation);
      setFormData((prev) => ({
        ...prev,
        quotation_id: quotationId,
        total: Number(quotation.total) || 0,
        discount: Number(quotation.discount) || 0,
        shipping: 0, // Always 0 as per requirement
        tax: Number(quotation.tax) || 0,
        grand_total: Number(quotation.grand_total) || 0,
      }));
    }
  };

  const calculateTotals = () => {
    const total = formData.total || 0;
    const discountAmount = (total * (formData.discount || 0)) / 100;
    const taxableAmount = total - discountAmount;
    const tax = taxableAmount * 0.11; // 11% tax
    const grandTotal = total - discountAmount + tax;

    setFormData((prev) => ({
      ...prev,
      tax: tax,
      grand_total: grandTotal,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.total, formData.discount]);

  // Client-side validation
  const validateForm = (): boolean => {
    try {
      validateSalesOrderFormData(formData, "create");
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof FormErrors;
          newErrors[path] = err.message;
        });
        setFormErrors(newErrors);
        return false;
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);

    try {
      const dataToSend: CreateSalesOrderData = {
        sale_no: formData.sale_no,
        quotation_id: formData.quotation_id || undefined,
        total: formData.total,
        discount: formData.discount,
        shipping: 0, // Always 0 as per requirement
        tax: formData.tax,
        grand_total: formData.grand_total,
        status: formData.status,
        note: formData.note,
        sale_status: formData.sale_status,
        payment_status: formData.payment_status,
        file_po_customer: formData.file_po_customer || undefined,
      };

      const result = await createSalesOrderAction(dataToSend);

      if (result?.success) {
        toast.success("Sales order created successfully");

        // Reset form
        setFormData({
          sale_no: "",
          quotation_id: "",
          total: 0,
          discount: 0,
          shipping: 0,
          tax: 0,
          grand_total: 0,
          status: "DRAFT",
          note: "",
          sale_status: "OPEN",
          payment_status: "UNPAID",
          file_po_customer: "",
        });
        setSelectedQuotation(null);

        // Call success callback or redirect
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/crm/sales-orders");
        }
      } else {
        throw new Error(result?.message || "Failed to create sales order");
      }
    } catch (error) {
      console.error("Error creating sales order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create sales order";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6 w-full">
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {mode === "add" ? "Create New Sales Order" : "Edit Sales Order"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sales Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sale_no" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Sales Order Number
                </Label>
                <Input
                  id="sale_no"
                  name="sale_no"
                  value={formData.sale_no}
                  onChange={(e) => handleInputChange("sale_no", e.target.value)}
                  placeholder={
                    generatingNumber ? "Generating..." : "Sales order number"
                  }
                  disabled={generatingNumber || mode === "edit"}
                />
                {formErrors.sale_no && (
                  <p className="text-sm text-red-600">{formErrors.sale_no}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="quotation_id"
                  className="flex items-center gap-2"
                >
                  <Building className="h-4 w-4" />
                  Reference Quotation (Optional)
                </Label>
                <Select
                  value={formData.quotation_id || "none"}
                  onValueChange={(value) => handleQuotationSelect(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quotation (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Quotation</SelectItem>
                    {quotationOptions.map((quotation) => (
                      <SelectItem
                        key={quotation.id}
                        value={quotation.id.toString()}
                      >
                        {quotation.quotation_no} -{" "}
                        {formatCurrency(quotation.grand_total || 0)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Financial Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total">Subtotal Amount</Label>
                  <Input
                    id="total"
                    name="total"
                    type="number"
                    step="0.01"
                    value={formData.total}
                    onChange={(e) =>
                      handleInputChange(
                        "total",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                  />
                  {formErrors.total && (
                    <p className="text-sm text-red-600">{formErrors.total}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) =>
                      handleInputChange(
                        "discount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                  />
                  {formErrors.discount && (
                    <p className="text-sm text-red-600">
                      {formErrors.discount}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax">Tax (11% Auto-calculated)</Label>
                  <Input
                    id="tax"
                    name="tax"
                    type="number"
                    step="0.01"
                    value={formData.tax.toFixed(2)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grand_total" className="font-semibold">
                    Grand Total
                  </Label>
                  <Input
                    id="grand_total"
                    name="grand_total"
                    type="number"
                    step="0.01"
                    value={formData.grand_total.toFixed(2)}
                    disabled
                    className="bg-gray-50 font-semibold"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Status Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Status Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                      {SALE_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                      {PAYMENT_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file_po_customer">Customer PO File</Label>
                <Input
                  id="file_po_customer"
                  name="file_po_customer"
                  value={formData.file_po_customer}
                  onChange={(e) =>
                    handleInputChange("file_po_customer", e.target.value)
                  }
                  placeholder="Customer PO file path/URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Notes</Label>
                <Textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  placeholder="Additional notes..."
                  rows={4}
                />
                {formErrors.note && (
                  <p className="text-sm text-red-600">{formErrors.note}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose || (() => router.back())}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || generatingNumber}>
                {loading
                  ? "Creating..."
                  : mode === "add"
                  ? "Create Sales Order"
                  : "Update Sales Order"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {selectedQuotation && (
        <Card className="mt-6 dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Selected Quotation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Quotation No:</p>
                <p>{selectedQuotation.quotation_no}</p>
              </div>
              <div>
                <p className="font-semibold">Customer:</p>
                <p>{selectedQuotation.customer?.customer_name || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold">Total Amount:</p>
                <p>{formatCurrency(selectedQuotation.total || 0)}</p>
              </div>
              <div>
                <p className="font-semibold">Grand Total:</p>
                <p>{formatCurrency(selectedQuotation.grand_total || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
