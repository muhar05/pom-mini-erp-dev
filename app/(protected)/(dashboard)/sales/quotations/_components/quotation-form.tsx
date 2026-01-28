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
  submitQuotationForApprovalAction,
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
import { SQ_STATUS_OPTIONS, SQ_LOST_REASONS } from "@/utils/statusHelpers";
import { toast } from "react-hot-toast";
import { useSession } from "@/contexts/session-context";
import { users } from "@/types/models";
import {
  getQuotationPermissions,
  getUserRole,
  canChangeStatus,
  canEditQuotationByStatus,
  QUOTATION_STATUSES,
  QuotationPermission,
} from "@/utils/quotationPermissions";
import { useCustomerById } from "@/hooks/customers/useCustomerById";
import { usePaymentTerms } from "@/hooks/payment-terms/usePaymentTerms";
import { Skeleton } from "@/components/ui/skeleton"; // pastikan ada komponen ini
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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
  lost_reason?: string;
  note?: string;
  target_date?: string;
  payment_term_id?: number | null;
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
  lost_reason?: string;
  target_date?: string;
  top?: string;
  valid_until?: string;
  note?: string;
  quotation_detail?: BoqItem[];
  customer_id?: string | number;
  payment_term_id?: number | null;
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
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  // Call useSession at the top level (correct hook usage)
  const session = useSession();

  const [loading, setLoading] = useState(false);
  const [leadData, setLeadData] = useState<any>(null);
  const [generatingQuotationNo, setGeneratingQuotationNo] = useState(false);
  const [showTargetCalendar, setShowTargetCalendar] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Tambahkan state isInitialLoad
  const [isCustomerEditMode, setIsCustomerEditMode] = useState(false);
  const [customerLoadingDelay, setCustomerLoadingDelay] = useState(false);

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
    status: quotation?.status || "draft",
    lost_reason: quotation?.lost_reason || "",
    note: quotation?.note || "",
    target_date: quotation?.target_date || "",
    payment_term_id: quotation?.payment_term_id ?? null,
  });

  // Trigger delay when customer_id changes
  useEffect(() => {
    if (!formData.customer_id) return;
    setCustomerLoadingDelay(true);
    const timer = setTimeout(() => {
      setCustomerLoadingDelay(false);
    }, 500); // 500ms delay
    return () => clearTimeout(timer);
  }, [formData.customer_id]);

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

  // Ambil data payment terms
  const { paymentTerms, isLoading: paymentTermsLoading } = usePaymentTerms();

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
    let newValue = value;
    // Pastikan field pricing bertipe number
    if (
      ["total", "tax", "grand_total", "discount", "shipping"].includes(field)
    ) {
      newValue = typeof value === "string" ? Number(value) : value;
    }
    setFormData((prev) => ({ ...prev, [field]: newValue }));
    setIsDirty(true);
  };

  // Update handleBoqChange - set isPricingDirty jika BOQ berubah
  const handleBoqChange = (items: BoqItem[]) => {
    setBoqItems(items);
    setIsDirty(true);
    // <-- BOQ berubah = pricing harus dihitung ulang
  };

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
      // Hitung ulang pricing sebelum submit
      const pricing = calculatePricing();
      const changedFields = getChangedFields();

      // Pastikan pricing yang dikirim ke BE adalah hasil kalkulasi terakhir
      changedFields.total = pricing.total;
      changedFields.tax = pricing.tax;
      changedFields.grand_total = pricing.grand_total;

      // Pastikan payment_term_id dikirim jika berubah
      if (formData.payment_term_id !== originalData.payment_term_id) {
        changedFields.payment_term_id = formData.payment_term_id;
      }

      const result = await updateQuotationAction(
        Number(quotation.id),
        changedFields,
      );

      if (result?.success) {
        toast.success("Quotation updated successfully");
        setIsDirty(false);
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

  // Tambahkan handler baru:
  const handleSubmitForApprovalDialog = async () => {
    setLoading(true);
    // Tutup dialog segera setelah tombol diklik untuk menghindari interaksi ganda
    setShowApprovalDialog(false);

    try {
      const result = await submitQuotationForApprovalAction(
        Number(quotation.id),
      );
      if (result?.success) {
        toast.success("Quotation dikirim untuk approval Manager Sales");
        setIsDirty(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result?.message || "Gagal mengirim untuk approval");
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
    setFormData((prev) => ({
      ...prev,
      customer_id: customerId,
    }));
    // Trigger kalkulasi ulang
    calculateTotals();
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
    ) &&
    (formData.status !== QUOTATION_STATUSES.LOST || !!formData.lost_reason);

  // Ambil data customer detail setiap kali customer_id berubah
  const { customer: customerDetail, loading: customerLoading } =
    useCustomerById(formData.customer_id);

  // Gunakan customerDetail untuk info customer dan diskon company
  const companyLevel = customerDetail?.company?.company_level;
  const companyLevelDiscount1 = companyLevel?.disc1 ?? 0;
  const companyLevelDiscount2 = companyLevel?.disc2 ?? 0;
  const companyLevelName = companyLevel?.level_name ?? "";

  // Filter status options based on permissions
  const getAvailableStatusOptions = () => {
    if (!permissions) return [];

    return SQ_STATUS_OPTIONS.filter((option) =>
      permissions.allowedStatuses.includes(option.value),
    );
  };

  const userRole = user ? getUserRole(user) : "";

  const salesApprovedStatus: string[] = [
    QUOTATION_STATUSES.APPROVED,
    QUOTATION_STATUSES.SENT,
    QUOTATION_STATUSES.REVISED,
  ];

  // Filter status options for sales after approved
  const getSalesApprovedOptions = () =>
    SQ_STATUS_OPTIONS.filter((opt) => salesApprovedStatus.includes(opt.value));

  const managerWaitingApprovalStatus = [
    QUOTATION_STATUSES.REVIEW,
    QUOTATION_STATUSES.APPROVED,
  ] as string[];

  const getManagerWaitingApprovalOptions = () =>
    SQ_STATUS_OPTIONS.filter((opt) =>
      managerWaitingApprovalStatus.includes(opt.value),
    );

  // Custom validation for status change
  const handleStatusChange = (newStatus: string) => {
    if (!user) return;

    // SALES VALIDATION
    if (userRole === "sales") {
      if (
        (formData.status === QUOTATION_STATUSES.DRAFT &&
          newStatus === QUOTATION_STATUSES.APPROVED) ||
        (formData.status === QUOTATION_STATUSES.WAITING_APPROVAL &&
          newStatus === QUOTATION_STATUSES.APPROVED) ||
        (formData.status === QUOTATION_STATUSES.REVIEW &&
          newStatus === QUOTATION_STATUSES.APPROVED)
      ) {
        toast.error(
          "Sales tidak boleh mengubah status ke Approved dari status ini.",
        );
        return;
      }
    }

    // MANAGER VALIDATION
    if (userRole === "manager-sales") {
      if (
        (formData.status === QUOTATION_STATUSES.APPROVED &&
          newStatus === QUOTATION_STATUSES.SENT) ||
        (formData.status === QUOTATION_STATUSES.SENT &&
          newStatus === QUOTATION_STATUSES.WIN)
      ) {
        toast.error(
          "Manager Sales tidak boleh mengubah status ke Sent dari Approved atau ke Win dari Sent.",
        );
        return;
      }
    }

    // REVISED CONFIRMATION
    if (newStatus === QUOTATION_STATUSES.REVISED) {
      setPendingStatus(newStatus);
      setShowRevisionDialog(true);
      return;
    }

    // Clear lost_reason if status changed from LOST to something else
    if (formData.status === QUOTATION_STATUSES.LOST && newStatus !== QUOTATION_STATUSES.LOST) {
      handleInputChange("lost_reason", "");
    }

    handleInputChange("status", newStatus);
  };

  const handleConfirmRevision = () => {
    if (pendingStatus) {
      handleInputChange("status", pendingStatus);
    }
    setShowRevisionDialog(false);
    setPendingStatus(null);
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

    // Pajak 11%
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

  // ================= DISPLAY VAR =================

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

  // Gunakan untuk calculateTotals
  const calculateTotals = () => {
    const pricing = calculatePricing();
    setFormData((prev) => ({
      ...prev,
      total: pricing.total,
      tax: pricing.tax,
      grand_total: pricing.grand_total,
    }));
  };

  const isSuper = user && getUserRole(user) === "superuser";
  const isFormDisabled = !isSuper && !canEditQuotationByStatus(user, formData.status);

  const salesEditableStatuses = [
    QUOTATION_STATUSES.APPROVED,
    QUOTATION_STATUSES.SENT,
    QUOTATION_STATUSES.REVISED,
    QUOTATION_STATUSES.WIN,
    QUOTATION_STATUSES.LOST,
    QUOTATION_STATUSES.CONVERTED,
  ] as string[];

  const managerEditableStatuses = [
    QUOTATION_STATUSES.WAITING_APPROVAL,
    QUOTATION_STATUSES.REVIEW,
  ] as string[];

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
        {/* Info Banner for Sales Editing Waiting Approval */}
        {userRole === "sales" &&
          formData.status === QUOTATION_STATUSES.WAITING_APPROVAL &&
          isDirty && (
            <div className="p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-800 rounded-r shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-semibold text-sm">Informasi Perubahan Status</p>
                  <p className="text-xs opacity-90">
                    Menyimpan perubahan pada quotation ini akan membatalkan antrean approval dan mengembalikan status ke <strong>Draft</strong>. Anda harus mengirim ulang untuk approval setelah menyimpan.
                  </p>
                </div>
              </div>
            </div>
          )}
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quotation Information Card */}
            <Card>
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
                      disabled={true || isFormDisabled}
                      required
                      className="font-mono"
                    />
                    {generatingQuotationNo && (
                      <p className="text-xs text-gray-500">
                        Generating quotation number...
                      </p>
                    )}
                  </div>

                  {/* STATUS FIELD */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>

                    {/* ===== SALES ===== */}
                    {userRole === "sales" ? (
                      salesEditableStatuses.includes(formData.status) ? (
                        /* Sales boleh update setelah approved */
                        <Select
                          value={formData.status}
                          onValueChange={handleStatusChange}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getSalesApprovedOptions().map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        /* Selain itu readonly */
                        <Input
                          id="status"
                          value={
                            getAvailableStatusOptions().find(
                              (opt) => opt.value === formData.status,
                            )?.label || formData.status
                          }
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      )
                    ) : /* ===== MANAGER SALES ===== */
                      userRole === "manager-sales" &&
                        managerEditableStatuses.includes(formData.status) ? (
                        <Select
                          value={formData.status}
                          onValueChange={handleStatusChange}
                          disabled={isFormDisabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getManagerWaitingApprovalOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        /* ===== DEFAULT (SUPERUSER DLL) ===== */
                        <Select
                          value={formData.status}
                          onValueChange={handleStatusChange}
                          disabled={isFormDisabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableStatusOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                  </div>

                  {/* LOST REASON FIELD */}
                  {formData.status === QUOTATION_STATUSES.LOST && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Label htmlFor="lost_reason" className="flex items-center gap-1">
                        Lost Reason
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.lost_reason || ""}
                        onValueChange={(value) => handleInputChange("lost_reason", value)}
                        disabled={isFormDisabled}
                      >
                        <SelectTrigger id="lost_reason" className={cn(!formData.lost_reason && "border-red-500")}>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {SQ_LOST_REASONS.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.lost_reason === "Others" && (
                        <p className="text-xs text-amber-600 font-medium">
                          Please provide more details in the Additional Notes below.
                        </p>
                      )}
                    </div>
                  )}
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
                          disabled={isFormDisabled}
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
                    <Label htmlFor="payment_term_id">Terms of Payment</Label>
                    <Select
                      value={formData.payment_term_id?.toString() || ""}
                      onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          payment_term_id: value ? Number(value) : null,
                        }));
                        setIsDirty(true); // <-- Tambahkan ini agar tombol update aktif jika payment term berubah
                      }}
                      disabled={paymentTermsLoading || isFormDisabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Terms of Payment" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTerms?.map((term) => (
                          <SelectItem key={term.id} value={term.id.toString()}>
                            {term.name} {term.days ? `(${term.days} hari)` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bill of Quantity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Bill of Quantity (BOQ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BoqTable
                  items={boqItems}
                  onChange={handleBoqChange}
                  disabled={isFormDisabled}
                />
              </CardContent>
            </Card>

            {/* Notes Card */}
            <Card>
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
                  disabled={isFormDisabled}
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
                        disabled={isFormDisabled}
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
                  ) : customerLoading || customerLoadingDelay ? (
                    // SKELETON LOADER SAAT LOADING CUSTOMER DETAIL
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
                    // ...customer detail panel...
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
                  {customerDetail &&
                    !customerLoading &&
                    !customerLoadingDelay && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mb-2"
                        onClick={() => setIsCustomerEditMode(true)}
                        disabled={isFormDisabled}
                      >
                        Edit Customer
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information Card */}
            <Card>
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

                  {/* Pricing summary hanya tampil jika customer sudah dipilih */}
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

                        {/* Diskon 1 */}
                        {companyLevelDiscount1 > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm dark:text-white text-blue-700">
                              Diskon 1 ({companyLevelDiscount1}%)
                            </span>
                            <span className="font-medium dark:text-white text-blue-700">
                              -{formatCurrency(discount1Amount)}
                            </span>
                          </div>
                        )}

                        {/* Diskon 2 */}
                        {companyLevelDiscount2 > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm dark:text-white text-purple-700">
                              Diskon 2 ({companyLevelDiscount2}%)
                            </span>
                            <span className="font-medium dark:text-white text-purple-700">
                              -{formatCurrency(discount2Amount)}
                            </span>
                          </div>
                        )}

                        {/* Setelah dua diskon */}
                        {(companyLevelDiscount1 > 0 ||
                          companyLevelDiscount2 > 0) && (
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
                            disabled={isFormDisabled}
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
                                <span className="italic">
                                  (belum termasuk pajak)
                                </span>
                              </span>
                              <span className="font-medium">
                                {formatCurrency(afterAllDiscount)}
                              </span>
                            </div>
                          )}

                        {/* Tax 11% */}
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
                      </>
                    )}
                  {/* Jika belum pilih customer, bisa tampilkan info atau kosong */}
                  {!formData.customer_id && (
                    <div className="text-sm text-muted-foreground">
                      Pilih customer terlebih dahulu untuk melihat perhitungan
                      tax dan total.
                    </div>
                  )}
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
              loading ||
              generatingQuotationNo ||
              !isFormValid ||
              !isDirty ||
              (isFormDisabled && formData.status === originalData.status)
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
          {user &&
            getUserRole(user) === "sales" &&
            ["sq_draft", "sq_revised"].includes(
              formData.status?.toLowerCase() || "",
            ) && (
              <Button
                type="button"
                variant="default"
                onClick={() => setShowApprovalDialog(true)}
                disabled={
                  loading ||
                  generatingQuotationNo ||
                  !isFormValid ||
                  isFormDisabled
                }
                className="min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading
                  ? "Mengirim..."
                  : "Kirim untuk di-approve Manager Sales"}
              </Button>
            )}

          <Dialog
            open={showApprovalDialog}
            onOpenChange={setShowApprovalDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konfirmasi Kirim Approval</DialogTitle>
              </DialogHeader>
              <div>
                Apakah Anda yakin ingin mengirim quotation ini untuk
                di-approve Manager Sales?
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                  >
                    Batal
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="default"
                  onClick={handleSubmitForApprovalDialog}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Mengirim..." : "Kirim"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showRevisionDialog}
            onOpenChange={setShowRevisionDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konfirmasi Revisi Quotation</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p>
                  Quotation ini akan dikembalikan ke status <strong>Draft</strong> untuk dapat diedit kembali.
                </p>
                <p className="text-sm text-amber-600 font-medium bg-amber-50 p-3 rounded-md border border-amber-200">
                  Perhatian: Setelah diedit, Anda wajib mengirim ulang quotation ini untuk di-approve oleh Manager Sales.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPendingStatus(null)}
                  >
                    Batal
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleConfirmRevision}
                >
                  Ya, Revisi Quotation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </div>
  );
}
