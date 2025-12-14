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

type PurchaseRequest = {
  id?: string;
  pr_no: string;
  so_no: string;
  requested_by: string;
  department: string;
  items_count: number;
  total_amount: number;
  request_date: string;
  required_date: string;
  status: string;
  notes?: string;
};

interface PurchaseRequestFormProps {
  mode: "add" | "edit";
  purchaseRequest?: PurchaseRequest;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function PurchaseRequestForm({
  mode,
  purchaseRequest,
  onClose,
  onSuccess,
}: PurchaseRequestFormProps) {
  const [formData, setFormData] = useState<PurchaseRequest>({
    pr_no: purchaseRequest?.pr_no || "",
    so_no: purchaseRequest?.so_no || "",
    requested_by: purchaseRequest?.requested_by || "",
    department: purchaseRequest?.department || "",
    items_count: purchaseRequest?.items_count || 0,
    total_amount: purchaseRequest?.total_amount || 0,
    request_date: purchaseRequest?.request_date || "",
    required_date: purchaseRequest?.required_date || "",
    status: purchaseRequest?.status || "Pending",
    notes: purchaseRequest?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    field: keyof PurchaseRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual API call
      console.log("Submitting purchase request:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess?.();
    } catch (error) {
      console.error("Error saving purchase request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "add"
            ? "Create New Purchase Request"
            : "Edit Purchase Request"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Request Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pr_no">PR Number *</Label>
                <Input
                  id="pr_no"
                  value={formData.pr_no}
                  onChange={(e) => handleInputChange("pr_no", e.target.value)}
                  placeholder="Auto-generated"
                  disabled={mode === "edit"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="so_no">SO Reference *</Label>
                <Input
                  id="so_no"
                  value={formData.so_no}
                  onChange={(e) => handleInputChange("so_no", e.target.value)}
                  placeholder="Select Sales Order"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requested_by">Requested By *</Label>
                <Input
                  id="requested_by"
                  value={formData.requested_by}
                  onChange={(e) =>
                    handleInputChange("requested_by", e.target.value)
                  }
                  placeholder="Enter requestor name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleInputChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Purchasing">Purchasing</SelectItem>
                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_date">Request Date *</Label>
                <Input
                  id="request_date"
                  type="date"
                  value={formData.request_date}
                  onChange={(e) =>
                    handleInputChange("request_date", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="required_date">Required Date *</Label>
                <Input
                  id="required_date"
                  type="date"
                  value={formData.required_date}
                  onChange={(e) =>
                    handleInputChange("required_date", e.target.value)
                  }
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
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Converted to PO">
                      Converted to PO
                    </SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Item Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Item Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="items_count">Number of Items *</Label>
                <Input
                  id="items_count"
                  type="number"
                  value={formData.items_count}
                  onChange={(e) =>
                    handleInputChange("items_count", parseInt(e.target.value))
                  }
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount (IDR) *</Label>
                <Input
                  id="total_amount"
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) =>
                    handleInputChange("total_amount", parseInt(e.target.value))
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
                ? "Create Purchase Request"
                : "Update Purchase Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
