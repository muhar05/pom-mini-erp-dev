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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/utils/formatDate";
import {
  User,
  Mail,
  MapPin,
  FileText,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
  CreditCard,
} from "lucide-react";

type CustomerPayment = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  total_invoices: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  outstanding_amount: number;
  payment_status: string;
  last_payment_date: string | null;
  days_since_last_payment: number | null;
  average_payment_days: number | null;
  created_at: string;
  updated_at: string;
  invoices: Array<{
    invoice_no: string;
    amount: number;
    due_date: string;
    status: string;
  }>;
};

interface CustomerPaymentDetailDrawerProps {
  customerPayment: CustomerPayment | null;
  open: boolean;
  onClose: () => void;
}

// Helper function to get payment status badge styling
function getPaymentStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "partial":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Helper function to get invoice status badge styling
function getInvoiceStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Helper function to get risk level badge
function getRiskLevelBadge(customer: CustomerPayment) {
  if (
    customer.overdue_amount > 0 &&
    customer.days_since_last_payment !== null &&
    customer.days_since_last_payment > 30
  ) {
    return {
      level: "High Risk",
      class: "bg-red-100 text-red-800 border-red-200",
      icon: AlertTriangle,
    };
  } else if (
    customer.overdue_amount > 0 ||
    (customer.days_since_last_payment !== null &&
      customer.days_since_last_payment > 15)
  ) {
    return {
      level: "Medium Risk",
      class: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    };
  } else {
    return {
      level: "Low Risk",
      class: "bg-green-100 text-green-800 border-green-200",
      icon: TrendingUp,
    };
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

// Helper function to calculate payment percentage
function getPaymentPercentage(paid: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((paid / total) * 100);
}

export default function CustomerPaymentDetailDrawer({
  customerPayment,
  open,
  onClose,
}: CustomerPaymentDetailDrawerProps) {
  if (!customerPayment) {
    return null;
  }

  const riskBadge = getRiskLevelBadge(customerPayment);
  const RiskIcon = riskBadge.icon;
  const paymentPercentage = getPaymentPercentage(
    customerPayment.paid_amount,
    customerPayment.total_amount
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3">
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Payment Details
          </SheetTitle>
          <SheetDescription>
            Payment status and history for {customerPayment.customer_name}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Risk Level Alert */}
          <div
            className={`p-4 rounded-lg border ${
              riskBadge.class.includes("red")
                ? "bg-red-50"
                : riskBadge.class.includes("yellow")
                ? "bg-yellow-50"
                : "bg-green-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <RiskIcon
                className={`h-5 w-5 ${
                  riskBadge.class.includes("red")
                    ? "text-red-600"
                    : riskBadge.class.includes("yellow")
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              />
              <Badge variant="outline" className={riskBadge.class}>
                {riskBadge.level}
              </Badge>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Customer Name</span>
                  <p className="font-medium">{customerPayment.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Email</span>
                  <p className="font-medium">
                    {customerPayment.customer_email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Address</span>
                  <p className="font-medium">
                    {customerPayment.customer_address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Summary</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(customerPayment.total_amount)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Paid ({paymentPercentage}%)</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(customerPayment.paid_amount)}
                    </span>
                  </div>
                  <Progress value={paymentPercentage} className="h-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-600">Outstanding</div>
                  <div className="font-bold text-red-600">
                    {formatCurrency(customerPayment.outstanding_amount)}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-600">Overdue</div>
                  <div className="font-bold text-red-600">
                    {formatCurrency(customerPayment.overdue_amount)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <Badge
                  variant="outline"
                  className={getPaymentStatusBadgeClass(
                    customerPayment.payment_status
                  )}
                >
                  {customerPayment.payment_status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Behavior */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Behavior</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Invoices:</span>
                <span className="font-medium">
                  {customerPayment.total_invoices}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Payment:</span>
                <div className="text-right">
                  {customerPayment.last_payment_date ? (
                    <>
                      <div className="font-medium">
                        {formatDate(customerPayment.last_payment_date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {customerPayment.days_since_last_payment} days ago
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">No payments yet</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Payment Days:</span>
                <span className="font-medium">
                  {customerPayment.average_payment_days !== null
                    ? `${customerPayment.average_payment_days} days`
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invoice Details</h3>
            <div className="space-y-3">
              {customerPayment.invoices.map((invoice, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{invoice.invoice_no}</div>
                      <div className="text-sm text-gray-600">
                        Due: {formatDate(invoice.due_date)}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={getInvoiceStatusBadgeClass(invoice.status)}
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">
                      {formatCurrency(invoice.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Record Information</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Since:</span>
                <span>{formatDate(customerPayment.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{formatDate(customerPayment.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                console.log("View customer invoices:", customerPayment.id);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Invoices
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                console.log("View payment schedule:", customerPayment.id);
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Payment Schedule
            </Button>
            {customerPayment.outstanding_amount > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  console.log("Send payment reminder:", customerPayment.id);
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Payment Reminder
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
