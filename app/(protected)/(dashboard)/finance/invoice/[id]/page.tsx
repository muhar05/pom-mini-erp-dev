"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/utils/formatDate";
import { useRouter } from "next/navigation";
import { Edit, Download, Send, ArrowLeft } from "lucide-react";

// Mock invoice data - replace with actual API call
const mockInvoice = {
  id: "1",
  invoice_no: "INV-001",
  sales_order_no: "SO-001",
  customer_name: "PT. Client Technology",
  customer_email: "finance@clienttech.com",
  billing_address: "Jl. Sudirman No. 123, Jakarta",
  items_count: 5,
  subtotal: 25000000,
  tax_amount: 2500000,
  discount_amount: 500000,
  total_amount: 27000000,
  invoice_date: "2025-12-10",
  due_date: "2025-12-25",
  payment_term: "Net 15",
  status: "Sent",
  payment_status: "Pending",
  notes: "Please process payment by due date",
  created_at: "2025-12-10",
  updated_at: "2025-12-10",
  items: [
    {
      id: "1",
      description: "Product A",
      quantity: 10,
      unit_price: 1000000,
      total: 10000000,
    },
    {
      id: "2",
      description: "Product B",
      quantity: 5,
      unit_price: 2000000,
      total: 10000000,
    },
    {
      id: "3",
      description: "Service Fee",
      quantity: 1,
      unit_price: 5000000,
      total: 5000000,
    },
  ],
};

// Helper functions for styling
function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "sent":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "viewed":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getPaymentStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "unpaid":
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    case "partial":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState(mockInvoice);
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.push("/finance/invoice");
  };

  const handleEdit = () => {
    router.push(`/finance/invoice/${params.id}/edit`);
  };

  const handleDownload = () => {
    console.log("Download invoice PDF");
  };

  const handleSend = () => {
    console.log("Send invoice email");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DashboardBreadcrumb
        title={`Invoice ${invoice.invoice_no}`}
        text="View and manage invoice details"
      />

      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleSend}>
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{invoice.invoice_no}</CardTitle>
                <p className="text-muted-foreground">
                  Sales Order: {invoice.sales_order_no}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusBadgeClass(invoice.status)}>
                  {invoice.status}
                </Badge>
                <Badge
                  className={getPaymentStatusBadgeClass(invoice.payment_status)}
                >
                  {invoice.payment_status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer & Date Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <div className="space-y-1">
                  <p className="font-medium">{invoice.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.customer_email}
                  </p>
                  <p className="text-sm">{invoice.billing_address}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Invoice Date:</span>
                  <span>{formatDate(invoice.invoice_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Due Date:</span>
                  <span>{formatDate(invoice.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment Term:</span>
                  <span>{invoice.payment_term}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="text-right py-2">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />

            {/* Amount Summary */}
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="text-red-600">
                  -{formatCurrency(invoice.discount_amount)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
