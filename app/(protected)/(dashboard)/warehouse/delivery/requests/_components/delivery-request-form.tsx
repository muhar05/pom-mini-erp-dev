"use client";

import { useState, useEffect } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Minus, Save, X } from "lucide-react";

type DeliveryRequest = {
  id: string;
  dr_no: string;
  so_no: string;
  sr_no: string;
  customer_name: string;
  delivery_address: string;
  requested_by: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  request_date: string;
  required_date: string;
  delivery_type: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type DeliveryItem = {
  id: string;
  item_code: string;
  item_name: string;
  requested_qty: number;
  unit: string;
};

interface DeliveryRequestFormProps {
  deliveryRequest?: DeliveryRequest;
  mode: "add" | "edit";
  onClose: () => void;
  onSuccess: () => void;
}

// Mock data for dropdowns
const mockSalesOrders = [
  { id: "1", so_no: "SO-001", customer_name: "PT. ABC Technology" },
  { id: "2", so_no: "SO-002", customer_name: "CV. XYZ Solutions" },
  { id: "3", so_no: "SO-003", customer_name: "PT. Global Corp" },
];

const mockStockReservations = [
  { id: "1", sr_no: "SR-001", so_no: "SO-001" },
  { id: "2", sr_no: "SR-002", so_no: "SO-002" },
  { id: "3", sr_no: "SR-003", so_no: "SO-003" },
];

const mockWarehouses = [
  { id: "1", name: "Main Warehouse" },
  { id: "2", name: "Secondary Warehouse" },
  { id: "3", name: "Distribution Center" },
];

export default function DeliveryRequestForm({
  deliveryRequest,
  mode,
  onClose,
  onSuccess,
}: DeliveryRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    so_no: deliveryRequest?.so_no || "",
    sr_no: deliveryRequest?.sr_no || "",
    customer_name: deliveryRequest?.customer_name || "",
    delivery_address: deliveryRequest?.delivery_address || "",
    requested_by: deliveryRequest?.requested_by || "",
    warehouse: deliveryRequest?.warehouse || "",
    request_date:
      deliveryRequest?.request_date || new Date().toISOString().split("T")[0],
    required_date: deliveryRequest?.required_date || "",
    delivery_type: deliveryRequest?.delivery_type || "",
    status: deliveryRequest?.status || "Pending",
    notes: deliveryRequest?.notes || "",
  });

  const [items, setItems] = useState<DeliveryItem[]>([
    {
      id: "1",
      item_code: "",
      item_name: "",
      requested_qty: 0,
      unit: "pcs",
    },
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalesOrderChange = (soNo: string) => {
    const selectedSO = mockSalesOrders.find((so) => so.so_no === soNo);
    if (selectedSO) {
      setFormData((prev) => ({
        ...prev,
        so_no: soNo,
        customer_name: selectedSO.customer_name,
      }));
    }
  };

  const handleStockReservationChange = (srNo: string) => {
    setFormData((prev) => ({ ...prev, sr_no: srNo }));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        item_code: "",
        item_name: "",
        requested_qty: 0,
        unit: "pcs",
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const payload = {
        ...formData,
        items,
        items_count: items.length,
        total_qty: items.reduce((sum, item) => sum + item.requested_qty, 0),
      };

      console.log("Submitting delivery request:", payload);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onSuccess();
    } catch (error) {
      console.error("Failed to save delivery request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "add" ? "Create Delivery Request" : "Edit Delivery Request"}
        </CardTitle>
        <CardDescription>
          {mode === "add"
            ? "Create a new delivery request for sales order items"
            : "Update delivery request information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="so_no">Sales Order</Label>
              <Select
                value={formData.so_no}
                onValueChange={handleSalesOrderChange}
                disabled={mode === "edit"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Sales Order" />
                </SelectTrigger>
                <SelectContent>
                  {mockSalesOrders.map((so) => (
                    <SelectItem key={so.id} value={so.so_no}>
                      {so.so_no} - {so.customer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sr_no">Stock Reservation</Label>
              <Select
                value={formData.sr_no}
                onValueChange={handleStockReservationChange}
                disabled={mode === "edit"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Stock Reservation" />
                </SelectTrigger>
                <SelectContent>
                  {mockStockReservations
                    .filter(
                      (sr) => !formData.so_no || sr.so_no === formData.so_no
                    )
                    .map((sr) => (
                      <SelectItem key={sr.id} value={sr.sr_no}>
                        {sr.sr_no}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) =>
                  handleInputChange("customer_name", e.target.value)
                }
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requested_by">Requested By</Label>
              <Input
                id="requested_by"
                value={formData.requested_by}
                onChange={(e) =>
                  handleInputChange("requested_by", e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* Delivery Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <Textarea
                id="delivery_address"
                value={formData.delivery_address}
                onChange={(e) =>
                  handleInputChange("delivery_address", e.target.value)
                }
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select
                  value={formData.warehouse}
                  onValueChange={(value) =>
                    handleInputChange("warehouse", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.name}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_type">Delivery Type</Label>
                <Select
                  value={formData.delivery_type}
                  onValueChange={(value) =>
                    handleInputChange("delivery_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Delivery Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Express">Express</SelectItem>
                    <SelectItem value="Same Day">Same Day</SelectItem>
                    <SelectItem value="Next Day">Next Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === "edit" && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="request_date">Request Date</Label>
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
              <Label htmlFor="required_date">Required Date</Label>
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
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Delivery Items</Label>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-end gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <Label>Item Code</Label>
                    <Input
                      value={item.item_code}
                      onChange={(e) =>
                        updateItem(item.id, "item_code", e.target.value)
                      }
                      placeholder="Item code"
                    />
                  </div>
                  <div className="flex-2">
                    <Label>Item Name</Label>
                    <Input
                      value={item.item_name}
                      onChange={(e) =>
                        updateItem(item.id, "item_name", e.target.value)
                      }
                      placeholder="Item name"
                    />
                  </div>
                  <div className="w-24">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      value={item.requested_qty}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "requested_qty",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                    />
                  </div>
                  <div className="w-20">
                    <Label>Unit</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(item.id, "unit", e.target.value)
                      }
                      placeholder="pcs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              placeholder="Additional notes or special instructions..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading
                ? "Saving..."
                : mode === "add"
                ? "Create DR"
                : "Update DR"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
