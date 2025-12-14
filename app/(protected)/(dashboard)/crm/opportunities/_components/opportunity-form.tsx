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
import { useState } from "react";

type Opportunity = {
  id?: string;
  opportunity_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  potential_value: number;
  stage: string;
  status: string;
  expected_close_date?: string;
  notes?: string;
};

interface OpportunityFormProps {
  mode: "add" | "edit";
  opportunity?: Opportunity;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function OpportunityForm({
  mode,
  opportunity,
  onClose,
  onSuccess,
}: OpportunityFormProps) {
  const [formData, setFormData] = useState<Opportunity>({
    opportunity_no: opportunity?.opportunity_no || "",
    customer_name: opportunity?.customer_name || "",
    customer_email: opportunity?.customer_email || "",
    sales_pic: opportunity?.sales_pic || "",
    type: opportunity?.type || "Perusahaan",
    company: opportunity?.company || "",
    potential_value: opportunity?.potential_value || 0,
    stage: opportunity?.stage || "Prospecting",
    status: opportunity?.status || "Open",
    expected_close_date: opportunity?.expected_close_date || "",
    notes: opportunity?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    field: keyof Opportunity,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual API call
      console.log("Submitting opportunity:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess?.();
    } catch (error) {
      console.error("Error saving opportunity:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "add" ? "Create New Opportunity" : "Edit Opportunity"}
        </CardTitle>
      </CardHeader>
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
                  disabled={mode === "edit"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage *</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => handleInputChange("stage", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prospecting">Prospecting</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed Won">Closed Won</SelectItem>
                    <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <Input
                  id="expected_close_date"
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) =>
                    handleInputChange("expected_close_date", e.target.value)
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
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add any additional notes or requirements..."
                rows={4}
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
            <Button type="submit" disabled={loading}>
              {loading
                ? mode === "add"
                  ? "Creating..."
                  : "Updating..."
                : mode === "add"
                ? "Create Opportunity"
                : "Update Opportunity"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
