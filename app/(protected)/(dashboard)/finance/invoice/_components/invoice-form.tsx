"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

type InvoiceFormData = {
  sales_order_no: string;
  customer_name: string;
  customer_email: string;
  billing_address: string;
  invoice_date: string;
  due_date: string;
  payment_term: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string;
  status: string;
};

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  isEdit?: boolean;
}

export default function InvoiceForm({
  initialData,
  isEdit = false,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    sales_order_no: initialData?.sales_order_no || "",
    customer_name: initialData?.customer_name || "",
    customer_email: initialData?.customer_email || "",
    billing_address: initialData?.billing_address || "",
    invoice_date:
      initialData?.invoice_date || new Date().toISOString().split("T")[0],
    due_date: initialData?.due_date || "",
    payment_term: initialData?.payment_term || "Net 15",
    subtotal: initialData?.subtotal || 0,
    tax_rate: 10, // Default 10%
    tax_amount: initialData?.tax_amount || 0,
    discount_amount: initialData?.discount_amount || 0,
    total_amount: initialData?.total_amount || 0,
    notes: initialData?.notes || "",
    status: initialData?.status || "draft",
  });

  // Calculate amounts when subtotal, tax_rate, or discount changes
  const updateCalculations = (
    subtotal: number,
    taxRate: number,
    discount: number
  ) => {
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discount;

    setFormData((prev) => ({
      ...prev,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    }));
  };

  const handleInputChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Recalculate if relevant fields change
      if (
        field === "subtotal" ||
        field === "tax_rate" ||
        field === "discount_amount"
      ) {
        const subtotal =
          field === "subtotal" ? parseFloat(value) || 0 : prev.subtotal;
        const taxRate = field === "tax_rate" ? parseFloat(value) || 0 : 10;
        const discount =
          field === "discount_amount"
            ? parseFloat(value) || 0
            : prev.discount_amount;

        const taxAmount = (subtotal * taxRate) / 100;
        const totalAmount = subtotal + taxAmount - discount;

        updated.tax_amount = taxAmount;
        updated.total_amount = totalAmount;
      }

      return updated;
    });
  };

  // Auto-calculate due date based on payment term
  const handlePaymentTermChange = (term: string) => {
    setFormData((prev) => {
      const invoiceDate = new Date(prev.invoice_date);
      let daysToAdd = 15; // Default

      if (term === "Net 15") daysToAdd = 15;
      else if (term === "Net 30") daysToAdd = 30;
      else if (term === "Net 45") daysToAdd = 45;
      else if (term === "Net 60") daysToAdd = 60;

      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      return {
        ...prev,
        payment_term: term,
        due_date: dueDate.toISOString().split("T")[0],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Implement submit logic here
      console.log("Submitting invoice:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to invoice list
      router.push("/finance/invoice");
    } catch (error) {
      console.error("Error submitting invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/finance/invoice");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Invoice" : "Create New Invoice"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sales_order_no">Sales Order No</Label>
                <Select
                  value={formData.sales_order_no}
                  onValueChange={(value) =>
                    handleInputChange("sales_order_no", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sales Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SO-001">SO-001</SelectItem>
                    <SelectItem value="SO-002">SO-002</SelectItem>
                    <SelectItem value="SO-003">SO-003</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) =>
                      handleInputChange("customer_name", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer_email">Customer Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) =>
                      handleInputChange("customer_email", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="billing_address">Billing Address</Label>
                <Textarea
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) =>
                    handleInputChange("billing_address", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* Date and Payment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Date & Payment Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoice_date">Invoice Date</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) =>
                      handleInputChange("invoice_date", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="payment_term">Payment Term</Label>
                  <Select
                    value={formData.payment_term}
                    onValueChange={handlePaymentTermChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      handleInputChange("due_date", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Amount Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Amount Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subtotal">Subtotal (IDR)</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    value={formData.subtotal}
                    onChange={(e) =>
                      handleInputChange(
                        "subtotal",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    value={10}
                    onChange={(e) =>
                      handleInputChange(
                        "tax_rate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="tax_amount">Tax Amount (IDR)</Label>
                  <Input
                    id="tax_amount"
                    type="number"
                    value={formData.tax_amount}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="discount_amount">Discount Amount (IDR)</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    value={formData.discount_amount}
                    onChange={(e) =>
                      handleInputChange(
                        "discount_amount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(formData.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes or comments..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEdit
                  ? "Update Invoice"
                  : "Create Invoice"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
