"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createQuotationAction,
  generateQuotationNumberAction,
} from "@/app/actions/quotations"; // pastikan import
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building, Tag, Mail, Phone, MapPin } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import BoqTable, { BoqItem } from "./BoqTable";
import { getAllCustomersAction } from "@/app/actions/customers";
import { formatCurrency } from "@/utils/formatCurrency";

// 1. Ubah type Quotation (atau buat type baru)
type QuotationFormData = {
  quotation_no: string;
  customer_id: string | number;
  quotation_detail: BoqItem[];
  total: number;
  shipping: number;
  discount: number;
  tax: number;
  grand_total: number;
  status: string;
  stage?: string;
  note?: string;
  target_date?: string;
  top?: string;
};

type Quotation = {
  id?: string;
  quotation_no: string;
  opportunity_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  total_amount: number;
  shipping: number;
  discount: number;
  tax: number;
  grand_total: number;
  status: string;
  stage?: string;
  target_date?: string;
  top?: string;
  valid_until?: string;
  note?: string;
  quotation_detail?: BoqItem[];
  customer_id?: string | number;
};

interface QuotationFormProps {
  mode: "add" | "edit";
  quotation?: Quotation;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function QuotationForm({
  mode,
  quotation,
  onClose,
  onSuccess,
}: QuotationFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leadData, setLeadData] = useState<any>(null);
  const [generatingQuotationNo, setGeneratingQuotationNo] = useState(false);
  const [showTargetCalendar, setShowTargetCalendar] = useState(false);

  // 2. Inisialisasi state
  const [formData, setFormData] = useState<QuotationFormData>({
    quotation_no: quotation?.quotation_no || "",
    customer_id: quotation?.customer_id || "",
    quotation_detail: quotation?.quotation_detail || [],
    total: quotation?.total_amount || 0,
    shipping: quotation?.shipping || 0,
    discount: quotation?.discount || 0,
    tax: quotation?.tax || 0,
    grand_total: quotation?.grand_total || 0,
    status: quotation?.status || "draft",
    stage: quotation?.stage || "draft",
    note: quotation?.note || "",
    target_date: quotation?.target_date || "",
    top: quotation?.top || "cash",
  });

  const [boqItems, setBoqItems] = useState<BoqItem[]>(
    quotation?.quotation_detail || []
  );

  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Generate quotation number when form loads for new quotations
  useEffect(() => {
    if (mode === "add" && !quotation?.quotation_no) {
      const generateNumber = async () => {
        try {
          setGeneratingQuotationNo(true);
          const quotationNo = await generateQuotationNumberAction();
          setFormData((prev) => ({ ...prev, quotation_no: quotationNo }));
        } catch (error) {
          console.error("Error generating quotation number:", error);
        } finally {
          setGeneratingQuotationNo(false);
        }
      };

      generateNumber();
    }
  }, [mode, quotation]);

  useEffect(() => {
    // Extract lead data from query params
    const leadId = searchParams.get("leadId");
    const customerName = searchParams.get("customerName");
    const customerEmail = searchParams.get("customerEmail");
    const company = searchParams.get("company");

    if (leadId) {
      setLeadData({
        leadId: Number(leadId),
        customerName,
        customerEmail,
        company,
      });

      // Pre-populate form with lead data
      setFormData((prev) => ({
        ...prev,
        customer_name: customerName || "",
        customer_email: customerEmail || "",
        company: company || "",
      }));
    }
  }, [searchParams]);

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

  const handleInputChange = (
    field: keyof QuotationFormData,
    value: string | number | BoqItem[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotals = () => {
    const subtotal = boqItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const shipping = formData.shipping || 0;
    const discountPercent = formData.discount || 0;
    const tax = formData.tax || 0;

    // Diskon dalam persen
    const discountAmount = (subtotal * discountPercent) / 100;
    const grandTotal = subtotal + shipping + tax - discountAmount;

    setFormData((prev) => ({
      ...prev,
      total: subtotal, // <-- was total_amount
      grand_total: grandTotal,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [boqItems, formData.shipping, formData.discount, formData.tax]);

  // Ganti handleSubmit agar pakai server action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        quotation_no: formData.quotation_no,
        customer_id: Number(formData.customer_id),
        quotation_detail: boqItems.map((item) => ({
          ...item,
          product_id: Number(item.product_id),
          total: item.unit_price * item.quantity, // <-- Ensure total is set
        })),
        total: formData.total,
        shipping: formData.shipping,
        discount: formData.discount,
        tax: formData.tax,
        grand_total: formData.grand_total,
        status: formData.status,
        stage: formData.stage,
        note: formData.note,
        target_date: formData.target_date,
        top: formData.top,
      };

      const result = await createQuotationAction(dataToSend);

      if (result?.success) {
        // Reset form
        setFormData({
          quotation_no: "",
          customer_id: "",
          quotation_detail: [],
          total: 0,
          shipping: 0,
          discount: 0,
          tax: 0,
          grand_total: 0,
          status: "draft",
          stage: "draft",
          note: "",
          target_date: "",
          top: "cash",
        });
        setBoqItems([]);
        setSelectedCustomer(null);

        // Redirect ke halaman utama quotations
        router.push("/crm/quotations");
      } else {
        alert(result?.message || "Gagal membuat quotation");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customerOptions.find(
      (c) => c.id.toString() === customerId
    );
    setSelectedCustomer(customer);
    handleInputChange("customer_id", customerId);
  };

  // Cek field wajib
  const isFormValid =
    !!formData.quotation_no &&
    !!formData.customer_id &&
    !!selectedCustomer &&
    boqItems.length > 0 &&
    boqItems.every(
      (item) =>
        item.product_id &&
        item.product_name &&
        item.quantity > 0 &&
        item.unit_price >= 0
    );

  // Helper untuk ambil diskon dan level dari selectedCustomer
  const companyLevel = selectedCustomer?.company?.company_level;
  const companyLevelDiscount = companyLevel?.disc1 ?? 0;
  const companyLevelName = companyLevel?.level_name ?? "";

  return (
    <div className="w-full mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "add" ? "Create New Quotation" : "Edit Quotation"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "add"
              ? "Fill in the details to create a new quotation"
              : "Update the quotation details"}
          </p>
        </div>
        {formData.quotation_no && (
          <Badge variant="outline" className="text-base font-mono px-3 py-1">
            {formData.quotation_no}
          </Badge>
        )}
      </div>

      {/* Lead Info Banner */}
      {leadData && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                  Creating from Lead
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">
                      Lead Ref:
                    </span>
                    <p className="font-medium">{leadData.referenceNo}</p>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">
                      Customer:
                    </span>
                    <p className="font-medium">{leadData.customerName}</p>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">
                      Company:
                    </span>
                    <p className="font-medium">{leadData.company}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quotation Information Card */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Quotation Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="quotation_no"
                      className="flex items-center gap-1"
                    >
                      Quotation Number
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quotation_no"
                      value={formData.quotation_no}
                      onChange={(e) =>
                        handleInputChange("quotation_no", e.target.value)
                      }
                      placeholder={
                        generatingQuotationNo
                          ? "Generating..."
                          : "Auto-generated"
                      }
                      disabled={mode === "edit" || generatingQuotationNo}
                      required
                      className="font-mono"
                    />
                    {generatingQuotationNo && (
                      <p className="text-xs text-gray-500">
                        Generating quotation number...
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Converted to SO">
                          Converted to SO
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Select
                      value={formData.stage}
                      onValueChange={(value) =>
                        handleInputChange("stage", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Terms Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_date">Target Date</Label>
                    <Popover
                      open={showTargetCalendar}
                      onOpenChange={setShowTargetCalendar}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.target_date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.target_date ? (
                            format(new Date(formData.target_date), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={
                            formData.target_date
                              ? new Date(formData.target_date)
                              : undefined
                          }
                          onSelect={(date) => {
                            handleInputChange(
                              "target_date",
                              date ? format(date, "yyyy-MM-dd") : ""
                            );
                            setShowTargetCalendar(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="top">Terms of Payment</Label>
                    <Select
                      value={formData.top}
                      onValueChange={(value) => handleInputChange("top", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="net30">Net 30</SelectItem>
                        <SelectItem value="net60">Net 60</SelectItem>
                        <SelectItem value="cod">COD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bill of Quantity Card */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Bill of Quantity (BOQ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BoqTable items={boqItems} onChange={setBoqItems} />
              </CardContent>
            </Card>

            {/* Notes Card */}
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

          {/* Kolom Kanan: Customer & Pricing Information */}
          <div className="space-y-6">
            {/* Customer Information Card */}
            <Card className="dark:bg-gray-800 border dark:border-gray-700">
              <CardHeader className="pb-4 border-b dark:border-gray-700">
                <CardTitle className="text-lg font-medium flex items-center gap-3 dark:text-white">
                  <Calendar className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="space-y-5">
                  {/* Customer Selection */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="customer_id"
                      className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5"
                    >
                      Customer <span className="text-red-500">*</span>
                    </Label>

                    <Select
                      value={formData.customer_id?.toString() || ""}
                      onValueChange={handleCustomerChange}
                      disabled={!!leadData}
                    >
                      <SelectTrigger className="h-11 dark:border-gray-600 dark:bg-gray-900 w-full">
                        <SelectValue placeholder="Pilih customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customerOptions.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={c.id.toString()}
                            className="py-2.5"
                          >
                            <div className="flex flex-row gap-2">
                              <span className="font-medium">
                                {c.customer_name}
                              </span>
                              {c.company?.company_name && (
                                <span className="text-sm">
                                  {c.company.company_name}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Customer Details Panel */}
                  {selectedCustomer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-xs mb-1 block">Company</Label>
                        <Input
                          value={selectedCustomer.company?.company_name || "—"}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                      {/* Tambahkan ini untuk level perusahaan */}
                      <div>
                        <Label className="text-xs mb-1 block">
                          Company Level
                        </Label>
                        <Input
                          value={
                            selectedCustomer.company?.company_level?.level_name
                              ? selectedCustomer.company.company_level
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
                          value={selectedCustomer.type || "—"}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Email</Label>
                        <Input
                          value={selectedCustomer.email || "—"}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Phone</Label>
                        <Input
                          value={selectedCustomer.phone || "—"}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs mb-1 block">Address</Label>
                        <Input
                          value={
                            selectedCustomer.address || "No address provided"
                          }
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information Card */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium">
                      {formatCurrency(formData.total)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping" className="text-sm">
                      Shipping Cost
                    </Label>
                    <Input
                      id="shipping"
                      type="text"
                      value={formatCurrency(formData.shipping)}
                      onChange={(e) => {
                        // Hapus karakter non-digit
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        handleInputChange("shipping", parseInt(raw) || 0);
                      }}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount" className="text-sm">
                      Discount (%)
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      value={formData.discount}
                      onChange={(e) =>
                        handleInputChange(
                          "discount",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                    {/* Selalu tampilkan level name jika ada */}
                    {companyLevelName && (
                      <div className="text-xs text-blue-700 mt-1">
                        Level perusahaan: <b>{companyLevelName}</b>
                        {/* Diskon hanya tampil jika > 0 */}
                        {companyLevelDiscount > 0 && (
                          <span>
                            {" "}
                            &mdash; Diskon default:{" "}
                            <b>{companyLevelDiscount}%</b>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax" className="text-sm">
                      Tax
                    </Label>
                    <Input
                      id="tax"
                      type="text"
                      value={formatCurrency(formData.tax)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        handleInputChange("tax", parseInt(raw) || 0);
                      }}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold">Grand Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(formData.grand_total)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Subtotal: {formatCurrency(formData.total)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
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
            disabled={loading || generatingQuotationNo || !isFormValid}
            className="min-w-[150px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {mode === "add" ? "Creating..." : "Updating..."}
              </span>
            ) : mode === "add" ? (
              "Create Quotation"
            ) : (
              "Update Quotation"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
