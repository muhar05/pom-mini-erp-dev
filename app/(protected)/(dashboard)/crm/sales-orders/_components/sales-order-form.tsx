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

type SalesOrder = {
  id?: string;
  so_no: string;
  quotation_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  items_count: number;
  total_amount: number;
  payment_term: string;
  delivery_date: string;
  status: string;
  notes?: string;
};

interface SalesOrderFormProps {
  mode: "add" | "edit";
  salesOrder?: SalesOrder;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function SalesOrderForm({
  mode,
  salesOrder,
  onClose,
  onSuccess,
}: SalesOrderFormProps) {
  const [formData, setFormData] = useState<SalesOrder>({
    so_no: salesOrder?.so_no || "",
    quotation_no: salesOrder?.quotation_no || "",
    customer_name: salesOrder?.customer_name || "",
    customer_email: salesOrder?.customer_email || "",
    sales_pic: salesOrder?.sales_pic || "",
    items_count: salesOrder?.items_count || 0,
    total_amount: salesOrder?.total_amount || 0,
    payment_term: salesOrder?.payment_term || "Net 30",
    delivery_date: salesOrder?.delivery_date || "",
    status: salesOrder?.status || "Open",
    notes: salesOrder?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    field: keyof SalesOrder,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual API call
      console.log("Submitting sales order:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess?.();
    } catch (error) {
      console.error("Error saving sales order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "add" ? "Create New Sales Order" : "Edit Sales Order"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Order Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="so_no">SO Number *</Label>
                <Input
                  id="so_no"
                  value={formData.so_no}
                  onChange={(e) => handleInputChange("so_no", e.target.value)}
                  placeholder="Auto-generated"
                  disabled={mode === "edit"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotation_no">Quotation Reference *</Label>
                <Input
                  id="quotation_no"
                  value={formData.quotation_no}
                  onChange={(e) =>
                    handleInputChange("quotation_no", e.target.value)
                  }
                  placeholder="Select or enter quotation"
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
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Cash on Delivery">
                      Cash on Delivery
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Order Items</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="items_count">Total Items</Label>
                <Input
                  id="items_count"
                  type="number"
                  value={formData.items_count}
                  onChange={(e) =>
                    handleInputChange("items_count", parseInt(e.target.value))
                  }
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount *</Label>
                <Input
                  id="total_amount"
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) =>
                    handleInputChange(
                      "total_amount",
                      parseFloat(e.target.value)
                    )
                  }
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* TODO: Add item list component here */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">
                Item list component will be added here
              </p>
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
                placeholder="Add any additional notes or instructions..."
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : mode === "add"
                ? "Create Sales Order"
                : "Update Sales Order"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
