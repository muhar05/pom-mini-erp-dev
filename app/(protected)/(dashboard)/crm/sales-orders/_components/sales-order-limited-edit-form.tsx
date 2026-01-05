"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  updateSalesOrderNoteAction,
  updateSalesOrderPOFileAction,
  updateSalesOrderAction,
} from "@/app/actions/sales-orders";
import {
  SalesOrderPermissions,
  isFieldEditable,
  PAYMENT_STATUSES,
} from "@/utils/salesOrderPermissions";
import toast from "react-hot-toast";
import { FileText, Upload, CreditCard, Info } from "lucide-react";

type SalesOrder = {
  id?: string;
  sale_no: string;
  quotation_id?: string | null;
  total?: number | null;
  discount?: number | null;
  shipping?: number | null;
  tax?: number | null;
  grand_total?: number | null;
  status?: string | null;
  sale_status?: string | null;
  note?: string | null;
  payment_status?: string | null;
  file_po_customer?: string | null;
  created_at?: Date | null;
};

interface SalesOrderLimitedEditFormProps {
  salesOrder: SalesOrder;
  permissions: SalesOrderPermissions;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function SalesOrderLimitedEditForm({
  salesOrder,
  permissions,
  onClose,
  onSuccess,
}: SalesOrderLimitedEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    note: salesOrder.note || "",
    file_po_customer: salesOrder.file_po_customer || "",
    payment_status: salesOrder.payment_status || "UNPAID",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare update data based on editable fields
      const updateData: any = {};

      if (
        isFieldEditable("note", permissions) &&
        formData.note !== salesOrder.note
      ) {
        updateData.note = formData.note;
      }

      if (
        isFieldEditable("file_po_customer", permissions) &&
        formData.file_po_customer !== salesOrder.file_po_customer
      ) {
        updateData.file_po_customer = formData.file_po_customer;
      }

      if (
        isFieldEditable("payment_status", permissions) &&
        formData.payment_status !== salesOrder.payment_status
      ) {
        updateData.payment_status = formData.payment_status;
      }

      if (Object.keys(updateData).length === 0) {
        toast("No changes to save", {
          icon: "ℹ️",
        });
        return;
      }

      const result = await updateSalesOrderAction(salesOrder.id!, updateData);

      if (result?.success) {
        toast.success("Sales order updated successfully");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update sales order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Sales Order - Limited Fields
          </CardTitle>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              Only certain fields can be edited based on the current status:
              <Badge className="ml-2" variant="outline">
                {salesOrder.sale_status || salesOrder.status}
              </Badge>
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Read-only Sales Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Sales Order Number
              </Label>
              <p className="font-medium">{salesOrder.sale_no}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                From Quotation
              </Label>
              <p className="font-medium">{salesOrder.quotation_id || "-"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Grand Total
              </Label>
              <p className="font-medium">
                {salesOrder.grand_total?.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }) || "-"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Current Status
              </Label>
              <Badge>{salesOrder.sale_status || salesOrder.status}</Badge>
            </div>
          </div>

          <Separator />

          {/* Editable Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Editable Fields</h3>

            {/* Note Field */}
            {isFieldEditable("note", permissions) && (
              <div className="space-y-2">
                <Label htmlFor="note">
                  Notes <span className="text-green-600">✓ Editable</span>
                </Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  placeholder="Add notes or comments about this sales order..."
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500">
                  {formData.note.length}/1000 characters
                </p>
              </div>
            )}

            {/* Customer PO File Field */}
            {isFieldEditable("file_po_customer", permissions) && (
              <div className="space-y-2">
                <Label
                  htmlFor="file_po_customer"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Customer PO File{" "}
                  <span className="text-green-600">✓ Editable</span>
                </Label>
                <Input
                  id="file_po_customer"
                  value={formData.file_po_customer}
                  onChange={(e) =>
                    handleInputChange("file_po_customer", e.target.value)
                  }
                  placeholder="Enter file path or URL of customer's PO document"
                />
                <p className="text-xs text-gray-500">
                  Upload or link to the customer's purchase order document
                </p>
              </div>
            )}

            {/* Payment Status Field */}
            {isFieldEditable("payment_status", permissions) && (
              <div className="space-y-2">
                <Label
                  htmlFor="payment_status"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Payment Status{" "}
                  <span className="text-green-600">✓ Editable</span>
                </Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) =>
                    handleInputChange("payment_status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PAYMENT_STATUSES.UNPAID}>
                      Unpaid
                    </SelectItem>
                    <SelectItem value={PAYMENT_STATUSES.PARTIAL}>
                      Partial
                    </SelectItem>
                    <SelectItem value={PAYMENT_STATUSES.PAID}>Paid</SelectItem>
                    <SelectItem value={PAYMENT_STATUSES.OVERDUE}>
                      Overdue
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Show message if no editable fields */}
            {permissions.editableFields.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                <p>No fields can be edited in the current status.</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            {permissions.editableFields.length > 0 && (
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Sales Order"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
