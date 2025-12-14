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

type PurchaseOrder = {
  id?: string;
  po_no: string;
  pr_no: string;
  vendor_name: string;
  vendor_email: string;
  contact_person: string;
  items_count: number;
  total_amount: number;
  order_date: string;
  delivery_date: string;
  payment_term: string;
  status: string;
  notes?: string;
};

interface PurchaseOrderFormProps {
  mode: "add" | "edit";
  purchaseOrder?: PurchaseOrder;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function PurchaseOrderForm({
  mode,
  purchaseOrder,
  onClose,
  onSuccess,
}: PurchaseOrderFormProps) {
  const [formData, setFormData] = useState<PurchaseOrder>({
    po_no: purchaseOrder?.po_no || "",
    pr_no: purchaseOrder?.pr_no || "",
    vendor_name: purchaseOrder?.vendor_name || "",
    vendor_email: purchaseOrder?.vendor_email || "",
    contact_person: purchaseOrder?.contact_person || "",
    items_count: purchaseOrder?.items_count || 0,
    total_amount: purchaseOrder?.total_amount || 0,
    order_date: purchaseOrder?.order_date || "",
    delivery_date: purchaseOrder?.delivery_date || "",
    payment_term: purchaseOrder?.payment_term || "Net 30",
    status: purchaseOrder?.status || "Open",
    notes: purchaseOrder?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    field: keyof PurchaseOrder,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual API call
      console.log("Submitting purchase order:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess?.();
    } catch (error) {
      console.error("Error saving purchase order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "add" ? "Create New Purchase Order" : "Edit Purchase Order"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Order Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="po_no">PO Number *</Label>
                <Input
                  id="po_no"
                  value={formData.po_no}
                  onChange={(e) => handleInputChange("po_no", e.target.value)}
                  placeholder="Auto-generated"
                  disabled={mode === "edit"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pr_no">PR Reference *</Label>
                <Input
                  id="pr_no"
                  value={formData.pr_no}
                  onChange={(e) => handleInputChange("pr_no", e.target.value)}
                  placeholder="Select Purchase Request"
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
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_term">Payment Term *</Label>
                <Select
                  value={formData.payment_term}
                  onValueChange={(value) =>
                    handleInputChange("payment_term", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Net 7">Net 7</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_date">Order Date *</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={formData.order_date}
                  onChange={(e) =>
                    handleInputChange("order_date", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_date">Delivery Date *</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) =>
                    handleInputChange("delivery_date", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vendor Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_name">Vendor Name *</Label>
                <Input
                  id="vendor_name"
                  value={formData.vendor_name}
                  onChange={(e) =>
                    handleInputChange("vendor_name", e.target.value)
                  }
                  placeholder="Select vendor"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor_email">Vendor Email</Label>
                <Input
                  id="vendor_email"
                  type="email"
                  value={formData.vendor_email}
                  onChange={(e) =>
                    handleInputChange("vendor_email", e.target.value)
                  }
                  placeholder="vendor@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person *</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) =>
                    handleInputChange("contact_person", e.target.value)
                  }
                  placeholder="Enter contact person name"
                  required
                />
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
                ? "Create Purchase Order"
                : "Update Purchase Order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
