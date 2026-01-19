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
  updateQuotationAction,
} from "@/app/actions/quotations";
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
import { SQ_STATUS_OPTIONS } from "@/utils/statusHelpers";
import { toast } from "react-hot-toast";
import { useSession } from "@/contexts/session-context";
import { users } from "@/types/models";
import {
  getQuotationPermissions,
  getUserRole,
  canChangeStatus,
  canChangeStage,
  QUOTATION_STATUSES,
  QUOTATION_STAGES,
  QuotationPermission,
  STATUS_STAGE_MAPPING,
} from "@/utils/quotationPermissions";
import { useCustomerById } from "@/hooks/customers/useCustomerById";

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
  quotation: Quotation;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function QuotationForm({
  quotation,
  onClose,
  onSuccess,
}: QuotationFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Call useSession at the top level (correct hook usage)
  const session = useSession();

  const [loading, setLoading] = useState(false);
  const [leadData, setLeadData] = useState<any>(null);
  const [generatingQuotationNo, setGeneratingQuotationNo] = useState(false);
  const [showTargetCalendar, setShowTargetCalendar] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isPricingDirty, setIsPricingDirty] = useState(false); // <-- Tambahkan state baru
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Tambahkan state isInitialLoad
  const [isCustomerEditMode, setIsCustomerEditMode] = useState(false);

  // 2. Inisialisasi state
  const [formData, setFormData] = useState<QuotationFormData>({
    quotation_no: quotation?.quotation_no || "",
    customer_id: quotation?.customer_id || "",
    quotation_detail: quotation?.quotation_detail
      ? quotation.quotation_detail.map((item) => ({
          ...item,
          unit_price: Number(item.unit_price) || 0,
          quantity: Number(item.quantity) || 0,
        }))
      : [],
    total: quotation?.total_amount ?? 0,
    shipping: quotation?.shipping ?? 0,
    discount: quotation?.discount ?? 0,
    tax: quotation?.tax ?? 0,
    grand_total: quotation?.grand_total ?? 0,
    status: quotation?.status || "sq_draft",
    stage: quotation?.stage || "draft",
    note: quotation?.note || "",
    target_date: quotation?.target_date || "",
    top: quotation?.top || "cash",
  });

  const [boqItems, setBoqItems] = useState<BoqItem[]>(
    quotation?.quotation_detail
      ? quotation.quotation_detail.map((item) => ({
          ...item,
          unit_price: Number(item.unit_price) || 0,
          quantity: Number(item.quantity) || 0,
        }))
      : [],
  );

  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [user, setUser] = useState<users | null>(null);
  const [permissions, setPermissions] = useState<QuotationPermission | null>(
    null,
  );

  // Generate quotation number when form loads for new quotations
  useEffect(() => {
    if (!quotation?.quotation_no) {
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
  }, [quotation]);

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

  // Set user info when session changes
  useEffect(() => {
    if (session?.user) {
      setUser(session.user as unknown as users);
      setPermissions(getQuotationPermissions(session.user as unknown as users));
    }
  }, [session]);

  // Update handleInputChange - hanya set isPricingDirty jika field pricing yang berubah
  const handleInputChange = (
    field: keyof QuotationFormData,
    value: string | number | BoqItem[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);

    // Hanya set isPricingDirty jika field yang berubah adalah field pricing
    if (["discount", "shipping", "tax"].includes(field)) {
      setIsPricingDirty(true);
    }
  };

  // Update handleBoqChange - set isPricingDirty jika BOQ berubah
  const handleBoqChange = (items: BoqItem[]) => {
    setBoqItems(items);
    setIsDirty(true);
    setIsPricingDirty(true); // <-- BOQ berubah = pricing harus dihitung ulang
  };

  const calculateTotals = () => {
    const subtotal = boqItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );
    const discountPercent = formData.discount || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const tax = 0.11 * (subtotal - discountAmount); // 11% tax
    const grandTotal = subtotal - discountAmount + tax;

    setFormData((prev) => ({
      ...prev,
      total: subtotal,
      tax: tax,
      grand_total: grandTotal,
    }));
  };

  // Kalkulasi hanya jika isDirty true
  useEffect(() => {
    // Skip kalkulasi saat initial load
    if (isInitialLoad) return;
    if (isPricingDirty) {
      calculateTotals();
    }
    // eslint-disable-next-line
  }, [boqItems, formData.discount, isPricingDirty, isInitialLoad]);

  // Simpan data original saat inisialisasi
  const [originalData] = useState(quotation);

  // Fungsi untuk membandingkan dan mengambil field yang berubah
  const getChangedFields = () => {
    const changed: any = {};
    Object.keys(formData).forEach((key) => {
      // Bandingkan dengan originalData
      if (
        formData[key as keyof QuotationFormData] !==
        originalData[key as keyof Quotation]
      ) {
        changed[key] = formData[key as keyof QuotationFormData];
      }
    });
    // Khusus untuk BOQ, bandingkan dengan JSON.stringify
    if (
      JSON.stringify(boqItems) !== JSON.stringify(originalData.quotation_detail)
    ) {
      changed.quotation_detail = boqItems;
    }
    return changed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const changedFields = getChangedFields();

      // Jika pricing berubah, pastikan tax & grand_total ikut dikirim
      if (isPricingDirty) {
        changedFields.tax = tax;
        changedFields.grand_total = grandTotal;
      }

      const result = await updateQuotationAction(
        Number(quotation.id),
        changedFields,
      );

      if (result?.success) {
        toast.success("Quotation updated successfully");
        if (onSuccess) onSuccess();
      } else {
        toast.error(result?.message || "Failed to update quotation");
      }
    } catch (error) {
      toast.error("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customerOptions.find(
      (c) => c.id.toString() === customerId,
    );
    setSelectedCustomer(customer);
    handleInputChange("customer_id", customerId);
  };

  // Cek field wajib (tanpa selectedCustomer)
  const isFormValid =
    !!formData.quotation_no &&
    !!formData.customer_id &&
    boqItems.length > 0 &&
    boqItems.every(
      (item) =>
        item.product_id &&
        item.product_name &&
        item.quantity > 0 &&
        item.unit_price >= 0,
    );

  // Ambil data customer detail setiap kali customer_id berubah
  const { customer: customerDetail, loading: customerLoading } =
    useCustomerById(formData.customer_id);

  // Gunakan customerDetail untuk info customer dan diskon company
  const companyLevel = customerDetail?.company?.company_level;
  const companyLevelDiscount1 = companyLevel?.disc1 ?? 0;
  const companyLevelDiscount2 = companyLevel?.disc2 ?? 0;
  const companyLevelName = companyLevel?.level_name ?? "";

  // Perhitungan diskon berlapis
  const subtotal = boqItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  // Diskon 1
  const discount1Amount = (subtotal * companyLevelDiscount1) / 100;
  const afterDiscount1 = subtotal - discount1Amount;

  // Diskon 2 (jika ada)
  const discount2Amount =
    companyLevelDiscount2 > 0
      ? (afterDiscount1 * companyLevelDiscount2) / 100
      : 0;
  const afterDiscount2 = afterDiscount1 - discount2Amount;

  // Additional Discount (setelah dua diskon company)
  const additionalDiscountPercent = Number(formData.discount) || 0;
  const additionalDiscountAmount =
    additionalDiscountPercent > 0
      ? (afterDiscount2 * additionalDiscountPercent) / 100
      : 0;
  const afterAllDiscount = afterDiscount2 - additionalDiscountAmount;

  // Tax 11%
  const tax = afterAllDiscount * 0.11;

  // Grand Total
  const grandTotal = afterAllDiscount + tax;

  // Filter status options based on permissions
  const getAvailableStatusOptions = () => {
    if (!permissions) return [];

    return SQ_STATUS_OPTIONS.filter((option) =>
      permissions.allowedStatuses.includes(option.value),
    );
  };

  // Filter stage options based on permissions
  const getAvailableStageOptions = () => {
    if (!permissions) return [];

    const allStageOptions = [
      { value: "draft", label: "Draft" },
      { value: "review", label: "Review" },
      { value: "approved", label: "Approved" },
      { value: "sent", label: "Sent" },
    ];

    return allStageOptions.filter((option) =>
      permissions.allowedStages.includes(option.value),
    );
  };

  // Validate status change on client side
  const handleStatusChange = (newStatus: string) => {
    if (!user) return;

    const statusCheck = canChangeStatus(user, formData.status, newStatus);
    if (!statusCheck.allowed) {
      toast.error(statusCheck.message || "Cannot change to this status");
      return;
    }

    handleInputChange("status", newStatus);

    // Auto-adjust stage based on status
    const validStages =
      STATUS_STAGE_MAPPING[newStatus as keyof typeof STATUS_STAGE_MAPPING];
    if (validStages && !validStages.includes(formData.stage as any)) {
      handleInputChange("stage", validStages[0]);
    }
  };

  // Validate stage change on client side
  const handleStageChange = (newStage: string) => {
    if (!user) return;

    const stageCheck = canChangeStage(
      user,
      formData.stage || "draft",
      newStage,
    );
    if (!stageCheck.allowed) {
      toast.error(stageCheck.message || "Cannot change to this stage");
      return;
    }

    handleInputChange("stage", newStage);
  };

  // Set isInitialLoad to false after first render
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // Only recalculate totals if user has changed pricing-related fields
  useEffect(() => {
    if (!isInitialLoad && isPricingDirty) {
      calculateTotals();
    }
    // eslint-disable-next-line
  }, [boqItems, formData.discount, isPricingDirty, isInitialLoad]);

  const displayTax = isPricingDirty ? tax : formData.tax;
  const displayGrandTotal = isPricingDirty ? grandTotal : formData.grand_total;

  return (
    <div className="w-full mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Quotation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update the quotation details
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
                      disabled={true}
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
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableStatusOptions().map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* 
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Select
                      value={formData.stage}
                      onValueChange={handleStageChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableStageOptions().map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}
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
                            !formData.target_date && "text-muted-foreground",
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
                              date ? format(date, "yyyy-MM-dd") : "",
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
                <BoqTable items={boqItems} onChange={handleBoqChange} />
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
                  {/* Jika mode edit, tampilkan dropdown */}
                  {isCustomerEditMode ? (
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
                  ) : (
                    // Customer Info Panel selalu tampil jika ada customer
                    customerDetail && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {/* Tambahkan ini untuk nama customer */}
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
                  {/* Edit Button selalu tampil jika ada customer */}
                  {customerDetail && (
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

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Diskon 1 */}
                  {companyLevelDiscount1 > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">
                        Diskon 1 ({companyLevelDiscount1}%)
                      </span>
                      <span className="font-medium text-blue-700">
                        -{formatCurrency(discount1Amount)}
                      </span>
                    </div>
                  )}

                  {/* Diskon 2 */}
                  {companyLevelDiscount2 > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700">
                        Diskon 2 ({companyLevelDiscount2}%)
                      </span>
                      <span className="font-medium text-purple-700">
                        -{formatCurrency(discount2Amount)}
                      </span>
                    </div>
                  )}

                  {/* Setelah dua diskon */}
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

                  {/* Additional Discount */}
                  <div className="space-y-2">
                    <Label htmlFor="discount" className="text-sm">
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Additional Discount Amount
                      </span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(additionalDiscountAmount)}
                      </span>
                    </div>
                  )}

                  {/* Setelah semua diskon */}
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

                  {/* Tax */}
                  <div className="space-y-2">
                    <Label htmlFor="tax" className="text-sm">
                      Tax (11%)
                    </Label>
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
            disabled={
              loading || generatingQuotationNo || !isFormValid || !isDirty
            }
            className="min-w-[150px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Updating...
              </span>
            ) : (
              "Update Quotation"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
