"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createQuotationFromLeadAction,
  generateQuotationNumberAction,
} from "@/app/actions/quotations";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import BoqTable, { BoqItem } from "./BoqTable";

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
  const [showValidUntilCalendar, setShowValidUntilCalendar] = useState(false);

  const [formData, setFormData] = useState<Quotation>({
    quotation_no: quotation?.quotation_no || "",
    opportunity_no: quotation?.opportunity_no || "",
    customer_name: quotation?.customer_name || "",
    customer_email: quotation?.customer_email || "",
    sales_pic: quotation?.sales_pic || "",
    type: quotation?.type || "Perusahaan",
    company: quotation?.company || "",
    total_amount: quotation?.total_amount || 0,
    shipping: quotation?.shipping || 0,
    discount: quotation?.discount || 0,
    tax: quotation?.tax || 0,
    grand_total: quotation?.grand_total || 0,
    status: quotation?.status || "draft",
    stage: quotation?.stage || "draft",
    target_date: quotation?.target_date || "",
    top: quotation?.top || "cash",
    valid_until: quotation?.valid_until || "",
    note: quotation?.note || "",
  });

  const [boqItems, setBoqItems] = useState<BoqItem[]>(
    quotation?.quotation_detail || []
  );

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
    const referenceNo = searchParams.get("referenceNo");

    if (leadId) {
      setLeadData({
        leadId: Number(leadId),
        customerName,
        customerEmail,
        company,
        referenceNo,
      });

      // Pre-populate form with lead data
      setFormData((prev) => ({
        ...prev,
        customer_name: customerName || "",
        customer_email: customerEmail || "",
        company: company || "",
        opportunity_no: referenceNo || "",
      }));
    }
  }, [searchParams]);

  const handleInputChange = (
    field: keyof Quotation,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotals = () => {
    const subtotal = boqItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const shipping = formData.shipping || 0;
    const discount = formData.discount || 0;
    const tax = formData.tax || 0;
    const grandTotal = subtotal + shipping + tax - discount;

    setFormData((prev) => ({
      ...prev,
      total_amount: subtotal,
      grand_total: grandTotal,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [boqItems, formData.shipping, formData.discount, formData.tax]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();

      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataObj.append(key, String(value));
        }
      });

      formDataObj.append("quotation_detail", JSON.stringify(boqItems));
      formDataObj.append("customer_id", "0");
      formDataObj.append("total", String(formData.total_amount));
      formDataObj.append("grand_total", String(formData.grand_total));

      const result = await createQuotationFromLeadAction(
        leadData.leadId,
        formDataObj
      );

      if (result.success) {
        alert(`Quotation ${result.data.quotation_no} created successfully!`);
        onSuccess?.();
        router.push("/crm/quotations");
      }
    } catch (error) {
      console.error("Error saving quotation:", error);
      alert("Error creating quotation: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

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
                    <Label
                      htmlFor="opportunity_no"
                      className="flex items-center gap-1"
                    >
                      Opportunity Reference
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="opportunity_no"
                      value={formData.opportunity_no}
                      onChange={(e) =>
                        handleInputChange("opportunity_no", e.target.value)
                      }
                      placeholder="Enter opportunity reference"
                      required
                    />
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
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Popover
                      open={showValidUntilCalendar}
                      onOpenChange={setShowValidUntilCalendar}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.valid_until && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.valid_until ? (
                            format(new Date(formData.valid_until), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={
                            formData.valid_until
                              ? new Date(formData.valid_until)
                              : undefined
                          }
                          onSelect={(date) => {
                            handleInputChange(
                              "valid_until",
                              date ? format(date, "yyyy-MM-dd") : ""
                            );
                            setShowValidUntilCalendar(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

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
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="customer_name"
                    className="flex items-center gap-1"
                  >
                    Customer Name
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) =>
                      handleInputChange("customer_name", e.target.value)
                    }
                    placeholder="Select customer"
                    required
                    disabled={!!leadData}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_email">Customer Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) =>
                      handleInputChange("customer_email", e.target.value)
                    }
                    placeholder="customer@email.com"
                    disabled={!!leadData}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center gap-1">
                    Customer Type
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Perusahaan">Perusahaan</SelectItem>
                      <SelectItem value="Perorangan">Perorangan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    placeholder="Company name"
                    disabled={!!leadData}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="sales_pic"
                    className="flex items-center gap-1"
                  >
                    Sales PIC
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sales_pic"
                    value={formData.sales_pic}
                    onChange={(e) =>
                      handleInputChange("sales_pic", e.target.value)
                    }
                    placeholder="Select sales person"
                    required
                  />
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
                      IDR {formData.total_amount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping" className="text-sm">
                      Shipping Cost
                    </Label>
                    <Input
                      id="shipping"
                      type="number"
                      value={formData.shipping}
                      onChange={(e) =>
                        handleInputChange(
                          "shipping",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount" className="text-sm">
                      Discount
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax" className="text-sm">
                      Tax
                    </Label>
                    <Input
                      id="tax"
                      type="number"
                      value={formData.tax}
                      onChange={(e) =>
                        handleInputChange("tax", parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold">Grand Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        IDR {formData.grand_total.toLocaleString("id-ID")}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Subtotal: IDR{" "}
                        {formData.total_amount.toLocaleString("id-ID")}
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
            disabled={loading || generatingQuotationNo}
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
