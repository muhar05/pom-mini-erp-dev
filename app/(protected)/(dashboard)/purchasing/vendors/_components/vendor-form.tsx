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

type Vendor = {
  id?: string;
  vendor_code: string;
  vendor_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  payment_term: string;
  status: string;
  notes?: string;
};

interface VendorFormProps {
  mode: "add" | "edit";
  vendor?: Vendor;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function VendorForm({
  mode,
  vendor,
  onClose,
  onSuccess,
}: VendorFormProps) {
  const [formData, setFormData] = useState<Vendor>({
    vendor_code: vendor?.vendor_code || "",
    vendor_name: vendor?.vendor_name || "",
    contact_person: vendor?.contact_person || "",
    email: vendor?.email || "",
    phone: vendor?.phone || "",
    address: vendor?.address || "",
    tax_id: vendor?.tax_id || "",
    payment_term: vendor?.payment_term || "Net 30",
    status: vendor?.status || "Active",
    notes: vendor?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof Vendor, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual API call
      console.log("Submitting vendor:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess?.();
    } catch (error) {
      console.error("Error saving vendor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "add" ? "Create New Vendor" : "Edit Vendor"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vendor Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_code">Vendor Code *</Label>
                <Input
                  id="vendor_code"
                  value={formData.vendor_code}
                  onChange={(e) =>
                    handleInputChange("vendor_code", e.target.value)
                  }
                  placeholder="VND-001"
                  disabled={mode === "edit"}
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
                  placeholder="PT. Supplier Tech"
                  required
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
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@vendor.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+62 21 1234567"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID (NPWP) *</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange("tax_id", e.target.value)}
                  placeholder="01.234.567.8-901.000"
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
                    <SelectValue placeholder="Select payment term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="COD">COD (Cash on Delivery)</SelectItem>
                    <SelectItem value="Advance">Advance Payment</SelectItem>
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
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Jl. Sudirman No. 123, Jakarta"
                rows={3}
                required
              />
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
                placeholder="Add any additional notes about this vendor..."
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
                ? "Create Vendor"
                : "Update Vendor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
