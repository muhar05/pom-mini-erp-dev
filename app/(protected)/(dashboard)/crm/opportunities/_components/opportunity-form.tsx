"use client";

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
import {
  OPPORTUNITY_STATUSES,
  formatStatusDisplay,
} from "@/utils/statusHelpers";
import { useState } from "react";
type Opportunity = {
  id: string;
  opportunity_no: string;
  lead_name: string;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  type?: string | null;
  company?: string | null;
  location?: string | null;
  product_interest?: string | null;
  source?: string | null;
  note?: string | null;
  id_user?: number | null;
  assigned_to?: number | null;
  status?: string | null;
  sales_pic?: string;
  potential_value: number;
  stage: string;
  created_at: string;
  updated_at: string;
  // Tambahkan field lain jika ada
};

interface OpportunityFormProps {
  mode: "add" | "edit";
  opportunity?: Opportunity;
  onClose?: () => void;
  onSuccess?: () => void;
}

const OPPORTUNITY_STAGE_OPTIONS = [
  { value: "opp_new", label: "New" },
  { value: "opp_qualified", label: "Qualified" },
  { value: "opp_proposal", label: "Proposal" },
  { value: "opp_negotiation", label: "Negotiation" },
  { value: "opp_won", label: "Won" },
  { value: "opp_lost", label: "Lost" },
  { value: "opp_cancelled", label: "Cancelled" },
];

// Pilihan status setelah converted
const OPPORTUNITY_STATUS_AFTER_CONVERT = [
  {
    value: OPPORTUNITY_STATUSES.PROSPECTING,
    label: formatStatusDisplay(OPPORTUNITY_STATUSES.PROSPECTING),
  },
  {
    value: OPPORTUNITY_STATUSES.LOST,
    label: formatStatusDisplay(OPPORTUNITY_STATUSES.LOST),
  },
  {
    value: OPPORTUNITY_STATUSES.SQ,
    label: formatStatusDisplay(OPPORTUNITY_STATUSES.SQ),
  },
];

export default function OpportunityForm({
  mode,
  opportunity,
  onClose,
  onSuccess,
}: OpportunityFormProps) {
  const [formData, setFormData] = useState<Opportunity>({
    id: opportunity?.id || "",
    opportunity_no: opportunity?.opportunity_no || "",
    lead_name: opportunity?.lead_name || "",
    contact: opportunity?.contact || null,
    email: opportunity?.email || null,
    phone: opportunity?.phone || null,
    type: opportunity?.type || "Perusahaan",
    company: opportunity?.company || null,
    location: opportunity?.location || null,
    product_interest: opportunity?.product_interest || null,
    source: opportunity?.source || null,
    note: opportunity?.note || null,
    id_user: opportunity?.id_user || null,
    assigned_to: opportunity?.assigned_to || null,
    status: opportunity?.status || null,
    sales_pic: opportunity?.sales_pic || "",
    potential_value: opportunity?.potential_value || 0,
    stage: opportunity?.stage || "",
    created_at: opportunity?.created_at || "",
    updated_at: opportunity?.updated_at || "",
  });

  const [loading, setLoading] = useState(false);

  // Semua input di-disable jika mode edit
  const isEdit = mode === "edit";

  const handleInputChange = (
    field: keyof Opportunity,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/opportunities", {
        method: mode === "add" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save opportunity");
      onSuccess?.();
    } catch (error) {
      console.error("Error saving opportunity:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mx-auto dark:bg-gray-800">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Opportunity Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Opportunity Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opportunity_no">Opportunity Number *</Label>
                <Input
                  id="opportunity_no"
                  value={formData.opportunity_no}
                  onChange={(e) =>
                    handleInputChange("opportunity_no", e.target.value)
                  }
                  placeholder="Auto-generated"
                  disabled={true} // Selalu disable di edit
                  required
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
                  value={formData.lead_name}
                  onChange={(e) =>
                    handleInputChange("lead_name", e.target.value)
                  }
                  placeholder="Select customer"
                  required
                  disabled={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">Customer Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="customer@email.com"
                  disabled={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Customer Type *</Label>
                <Select
                  value={formData.type || ""}
                  onValueChange={(value) => handleInputChange("type", value)}
                  disabled={true}
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
                  value={formData.company || ""}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Company name"
                  disabled={true}
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
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* Value Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Value Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="potential_value">Potential Value (IDR) *</Label>
                <Input
                  id="potential_value"
                  type="number"
                  value={formData.potential_value}
                  onChange={(e) =>
                    handleInputChange(
                      "potential_value",
                      parseInt(e.target.value)
                    )
                  }
                  placeholder="0"
                  min="0"
                  required
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.note || ""}
                onChange={(e) => handleInputChange("note", e.target.value)}
                placeholder="Add any additional notes or requirements..."
                rows={4}
                disabled={true}
              />
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
            {/* Hanya tampilkan tombol submit di mode add */}
            {!isEdit && (
              <Button type="submit" disabled={loading}>
                {loading
                  ? mode === "add"
                    ? "Creating..."
                    : "Updating..."
                  : mode === "add"
                  ? "Create Opportunity"
                  : "Update Opportunity"}
              </Button>
            )}
          </div>
        </form>

        {/* Tombol status tetap aktif di mode edit */}
        {isEdit && (
          <div className="flex gap-2 justify-end pt-4">
            {/* Set Qualified */}
            {formData.status !== OPPORTUNITY_STATUSES.PROSPECTING && (
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await fetch(`/api/opportunities/${formData.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        status: OPPORTUNITY_STATUSES.PROSPECTING,
                      }),
                    });
                    onSuccess?.();
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                Set Qualified
              </Button>
            )}

            {/* Set Lost */}
            {formData.status !== OPPORTUNITY_STATUSES.LOST && (
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await fetch(`/api/opportunities/${formData.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        status: OPPORTUNITY_STATUSES.LOST,
                      }),
                    });
                    onSuccess?.();
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                Set Lost
              </Button>
            )}

            {/* Convert to SQ */}
            {formData.status !== OPPORTUNITY_STATUSES.SQ && (
              <Button
                type="button"
                variant="default"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await fetch(`/api/opportunities/${formData.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        status: OPPORTUNITY_STATUSES.SQ,
                      }),
                    });
                    onSuccess?.();
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                Convert to SQ
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
