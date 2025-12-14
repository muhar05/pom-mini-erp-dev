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

type GoodsReceipt = {
  id?: string;
  gr_no: string;
  po_no: string;
  vendor_name: string;
  receiver_name: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  receipt_date: string;
  delivery_note: string;
  status: string;
  notes?: string;
};

interface GoodsReceiptFormProps {
  mode: "add" | "edit";
  goodsReceipt?: GoodsReceipt;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function GoodsReceiptForm({
  mode,
  goodsReceipt,
  onClose,
  onSuccess,
}: GoodsReceiptFormProps) {
  const [formData, setFormData] = useState<GoodsReceipt>({
    gr_no: goodsReceipt?.gr_no || "",
    po_no: goodsReceipt?.po_no || "",
    vendor_name: goodsReceipt?.vendor_name || "",
    receiver_name: goodsReceipt?.receiver_name || "",
    warehouse: goodsReceipt?.warehouse || "Main Warehouse",
    items_count: goodsReceipt?.items_count || 0,
    total_qty: goodsReceipt?.total_qty || 0,
    receipt_date: goodsReceipt?.receipt_date || "",
    delivery_note: goodsReceipt?.delivery_note || "",
    status: goodsReceipt?.status || "Received",
    notes: goodsReceipt?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    field: keyof GoodsReceipt,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual API call
      console.log("Submitting goods receipt:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess?.();
    } catch (error) {
      console.error("Error saving goods receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "add" ? "Create New Goods Receipt" : "Edit Goods Receipt"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Receipt Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Receipt Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gr_no">GR Number *</Label>
                <Input
                  id="gr_no"
                  value={formData.gr_no}
                  onChange={(e) => handleInputChange("gr_no", e.target.value)}
                  placeholder="Auto-generated"
                  disabled={mode === "edit"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="po_no">PO Reference *</Label>
                <Input
                  id="po_no"
                  value={formData.po_no}
                  onChange={(e) => handleInputChange("po_no", e.target.value)}
                  placeholder="Select Purchase Order"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor_name">Vendor Name *</Label>
                <Input
                  id="vendor_name"
                  value={formData.vendor_name}
                  onChange={(e) =>
                    handleInputChange("vendor_name", e.target.value)
                  }
                  placeholder="Enter vendor name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_note">Delivery Note *</Label>
                <Input
                  id="delivery_note"
                  value={formData.delivery_note}
                  onChange={(e) =>
                    handleInputChange("delivery_note", e.target.value)
                  }
                  placeholder="DN-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiver_name">Receiver Name *</Label>
                <Input
                  id="receiver_name"
                  value={formData.receiver_name}
                  onChange={(e) =>
                    handleInputChange("receiver_name", e.target.value)
                  }
                  placeholder="Enter receiver name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse *</Label>
                <Select
                  value={formData.warehouse}
                  onValueChange={(value) =>
                    handleInputChange("warehouse", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Warehouse">
                      Main Warehouse
                    </SelectItem>
                    <SelectItem value="Secondary Warehouse">
                      Secondary Warehouse
                    </SelectItem>
                    <SelectItem value="Transit Warehouse">
                      Transit Warehouse
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt_date">Receipt Date *</Label>
                <Input
                  id="receipt_date"
                  type="date"
                  value={formData.receipt_date}
                  onChange={(e) =>
                    handleInputChange("receipt_date", e.target.value)
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
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Quality Check">Quality Check</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
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
                <Label htmlFor="total_qty">Total Quantity *</Label>
                <Input
                  id="total_qty"
                  type="number"
                  value={formData.total_qty}
                  onChange={(e) =>
                    handleInputChange("total_qty", parseInt(e.target.value))
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
                placeholder="Add any additional notes, damages, or quality issues..."
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
                ? "Create Goods Receipt"
                : "Update Goods Receipt"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
