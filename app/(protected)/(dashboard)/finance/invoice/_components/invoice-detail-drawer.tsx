"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/utils/formatDate";

type Invoice = {
  id: string;
  invoice_no: string;
  sales_order_no: string;
  customer_name: string;
  customer_email: string;
  billing_address: string;
  items_count: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  invoice_date: string;
  due_date: string;
  payment_term: string;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

interface InvoiceDetailDrawerProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}

// Helper function to get status badge styling
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

// Helper function to get payment status badge styling
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

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function InvoiceDetailDrawer({
  invoice,
  open,
  onClose,
}: InvoiceDetailDrawerProps) {
  if (!invoice) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Invoice Details</SheetTitle>
          <SheetDescription>
            View detailed information about this invoice
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Header Information */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{invoice.invoice_no}</h3>
                <p className="text-sm text-muted-foreground">
                  SO: {invoice.sales_order_no}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="secondary"
                  className={getStatusBadgeClass(invoice.status)}
                >
                  {invoice.status}
                </Badge>
                <Badge
                  variant="secondary"
                  className={getPaymentStatusBadgeClass(invoice.payment_status)}
                >
                  {invoice.payment_status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-3">
            <h4 className="font-medium">Customer Information</h4>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <p className="text-sm">{invoice.customer_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm">{invoice.customer_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Billing Address</label>
                <p className="text-sm">{invoice.billing_address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice Details */}
          <div className="space-y-3">
            <h4 className="font-medium">Invoice Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Invoice Date</label>
                <p className="text-sm">{formatDate(invoice.invoice_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <p className="text-sm">{formatDate(invoice.due_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Payment Term</label>
                <p className="text-sm">{invoice.payment_term}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Items Count</label>
                <p className="text-sm">{invoice.items_count} items</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amount Information */}
          <div className="space-y-3">
            <h4 className="font-medium">Amount Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tax Amount</span>
                <span className="text-sm">
                  {formatCurrency(invoice.tax_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Discount</span>
                <span className="text-sm text-red-600">
                  -{formatCurrency(invoice.discount_amount)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          {invoice.notes && (
            <div className="space-y-3">
              <h4 className="font-medium">Notes</h4>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-3">
            <h4 className="font-medium">Record Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Created</label>
                <p className="text-sm">{formatDate(invoice.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Updated</label>
                <p className="text-sm">{formatDate(invoice.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
