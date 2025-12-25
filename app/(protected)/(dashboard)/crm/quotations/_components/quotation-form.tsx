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
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createQuotationFromLeadAction,
  generateQuotationNumberAction,
} from "@/app/actions/quotations";
import { QuotationDetailItem } from "@/lib/schemas/quotations";
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
  notes?: string;
  quotation_detail?: BoqItem[]; // <-- Tambahkan baris ini
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
    stage: quotation?.stage || "",
    target_date: quotation?.target_date || "",
    top: quotation?.top || "",
    valid_until: quotation?.valid_until || "",
    notes: quotation?.notes || "",
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
      formDataObj.append("customer_id", "0"); // Will be auto-created in action
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "add" ? "Create New Quotation" : "Edit Quotation"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {leadData && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-blue-800">
                Creating Quotation from Lead
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  <strong>Lead Reference:</strong> {leadData.referenceNo}
                </p>
                <p>
                  <strong>Customer:</strong> {leadData.customerName}
                </p>
                <p>
                  <strong>Email:</strong> {leadData.customerEmail}
                </p>
                <p>
                  <strong>Company:</strong> {leadData.company}
                </p>
                {formData.quotation_no && (
                  <p>
                    <strong>Quotation No:</strong>{" "}
                    <span className="font-mono text-blue-900">
                      {formData.quotation_no}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pre-populate customer fields if from lead */}
          <input
            type="hidden"
            name="customer_name"
            value={leadData?.customerName || ""}
          />
          <input
            type="hidden"
            name="customer_email"
            value={leadData?.customerEmail || ""}
          />

          {/* Quotation Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quotation Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quotation_no">Quotation Number *</Label>
                <Input
                  id="quotation_no"
                  value={formData.quotation_no}
                  onChange={(e) =>
                    handleInputChange("quotation_no", e.target.value)
                  }
                  placeholder={
                    generatingQuotationNo ? "Generating..." : "Auto-generated"
                  }
                  disabled={mode === "edit" || generatingQuotationNo}
                  required
                  className={formData.quotation_no ? "font-mono" : ""}
                />
                {generatingQuotationNo && (
                  <p className="text-xs text-gray-500">
                    Generating quotation number...
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="opportunity_no">Opportunity Reference *</Label>
                <Input
                  id="opportunity_no"
                  value={formData.opportunity_no}
                  onChange={(e) =>
                    handleInputChange("opportunity_no", e.target.value)
                  }
                  placeholder="Select or enter opportunity"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
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
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) =>
                    handleInputChange("valid_until", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    handleInputChange("customer_name", e.target.value)
                  }
                  placeholder="Select customer"
                  required
                  disabled={!!leadData} // Disabled if from lead
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
                  disabled={!!leadData} // Disabled if from lead
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Customer Type *</Label>
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
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Company name"
                  disabled={!!leadData} // Disabled if from lead
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sales_pic">Sales PIC *</Label>
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
            </div>
          </div>

          {/* Pricing Information */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_amount">Subtotal (IDR) *</Label>
                <Input
                  id="total_amount"
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) =>
                    handleInputChange(
                      "total_amount",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping">Shipping Cost (IDR)</Label>
                <Input
                  id="shipping"
                  type="number"
                  value={formData.shipping}
                  onChange={(e) =>
                    handleInputChange("shipping", parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (IDR)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    handleInputChange("discount", parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax">Tax (IDR)</Label>
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

              <div className="space-y-2">
                <Label htmlFor="grand_total">Grand Total (IDR)</Label>
                <Input
                  id="grand_total"
                  type="number"
                  value={
                    formData.total_amount +
                    formData.shipping +
                    formData.tax -
                    formData.discount
                  }
                  readOnly
                  className="bg-gray-50 font-semibold"
                />
              </div>
            </div>
          </div> */}

        

          {/* Additional Notes */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Bill of Quantity (BOQ)</h3>
            <BoqTable items={boqItems} onChange={setBoqItems} />
          </div>

            {/* Terms and Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Terms and Timeline</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={formData.stage || ""}
                  onValueChange={(value) => handleInputChange("stage", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) =>
                    handleInputChange("target_date", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="top">Terms of Payment</Label>
                <Select
                  value={formData.top || ""}
                  onValueChange={(value) => handleInputChange("top", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
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
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || generatingQuotationNo}>
              {loading
                ? mode === "add"
                  ? "Creating..."
                  : "Updating..."
                : mode === "add"
                ? "Create Quotation"
                : "Update Quotation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
