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

type StockReservation = {
  id?: string;
  sr_no: string;
  so_no: string;
  customer_name: string;
  reserved_by: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  reservation_date: string;
  expiry_date: string;
  status: string;
  notes?: string;
};

interface StockReservationFormProps {
  mode: "add" | "edit";
  stockReservation?: StockReservation;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function StockReservationForm({
  mode,
  stockReservation,
  onClose,
  onSuccess,
}: StockReservationFormProps) {
  const [formData, setFormData] = useState<StockReservation>({
    sr_no: stockReservation?.sr_no || "",
    so_no: stockReservation?.so_no || "",
    customer_name: stockReservation?.customer_name || "",
    reserved_by: stockReservation?.reserved_by || "",
    warehouse: stockReservation?.warehouse || "Main Warehouse",
    items_count: stockReservation?.items_count || 0,
    total_qty: stockReservation?.total_qty || 0,
    reservation_date: stockReservation?.reservation_date || "",
    expiry_date: stockReservation?.expiry_date || "",
    status: stockReservation?.status || "Reserved",
    notes: stockReservation?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    field: keyof StockReservation,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual API call
      console.log("Submitting stock reservation:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess?.();
    } catch (error) {
      console.error("Error saving stock reservation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "add"
            ? "Create New Stock Reservation"
            : "Edit Stock Reservation"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reservation Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Reservation Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sr_no">SR Number *</Label>
                <Input
                  id="sr_no"
                  value={formData.sr_no}
                  onChange={(e) => handleInputChange("sr_no", e.target.value)}
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
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    handleInputChange("customer_name", e.target.value)
                  }
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reserved_by">Reserved By *</Label>
                <Input
                  id="reserved_by"
                  value={formData.reserved_by}
                  onChange={(e) =>
                    handleInputChange("reserved_by", e.target.value)
                  }
                  placeholder="Enter staff name"
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
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="Partially Fulfilled">
                      Partially Fulfilled
                    </SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reservation_date">Reservation Date *</Label>
                <Input
                  id="reservation_date"
                  type="date"
                  value={formData.reservation_date}
                  onChange={(e) =>
                    handleInputChange("reservation_date", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date *</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    handleInputChange("expiry_date", e.target.value)
                  }
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
                placeholder="Add any additional notes or special instructions..."
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
                ? "Create Stock Reservation"
                : "Update Stock Reservation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
