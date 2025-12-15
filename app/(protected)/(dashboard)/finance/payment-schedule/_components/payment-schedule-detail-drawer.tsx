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
import { formatDate } from "@/utils/formatDate";
import { Calendar, Mail, FileText, Clock, AlertTriangle } from "lucide-react";

type PaymentSchedule = {
  id: string;
  invoice_no: string;
  invoice_id: string;
  customer_name: string;
  customer_email: string;
  amount_due: number;
  due_date: string;
  payment_status: string;
  days_overdue: number;
  invoice_date: string;
  payment_term: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

interface PaymentScheduleDetailDrawerProps {
  paymentSchedule: PaymentSchedule | null;
  open: boolean;
  onClose: () => void;
}

// Helper function to get payment status badge styling
function getPaymentStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "unpaid":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "partial":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
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

// Helper function to get urgency level
function getUrgencyInfo(dueDate: string, isOverdue: boolean) {
  if (isOverdue) {
    return {
      level: "overdue",
      text: "Payment is overdue",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: AlertTriangle,
    };
  }

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      level: "due-today",
      text: "Payment is due today",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      icon: Clock,
    };
  } else if (diffDays <= 3) {
    return {
      level: "due-soon",
      text: `Payment due in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      icon: Clock,
    };
  } else {
    return {
      level: "normal",
      text: `Payment due in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: Calendar,
    };
  }
}

export default function PaymentScheduleDetailDrawer({
  paymentSchedule,
  open,
  onClose,
}: PaymentScheduleDetailDrawerProps) {
  if (!paymentSchedule) {
    return null;
  }

  const urgencyInfo = getUrgencyInfo(
    paymentSchedule.due_date,
    paymentSchedule.days_overdue > 0
  );
  const UrgencyIcon = urgencyInfo.icon;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payment Schedule Details
          </SheetTitle>
          <SheetDescription>
            Payment schedule information for {paymentSchedule.invoice_no}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Urgency Alert */}
          <div className={`p-4 rounded-lg border ${urgencyInfo.bgColor}`}>
            <div className="flex items-center gap-2">
              <UrgencyIcon className={`h-5 w-5 ${urgencyInfo.color}`} />
              <span className={`font-medium ${urgencyInfo.color}`}>
                {urgencyInfo.text}
              </span>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invoice Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-medium">
                  {paymentSchedule.invoice_no}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date:</span>
                <span>{formatDate(paymentSchedule.invoice_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Term:</span>
                <span>{paymentSchedule.payment_term}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Due:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(paymentSchedule.amount_due)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">
                  {paymentSchedule.customer_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {paymentSchedule.customer_email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Schedule Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Schedule</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span
                    className={
                      paymentSchedule.days_overdue > 0
                        ? "text-red-600 font-medium"
                        : "text-gray-900"
                    }
                  >
                    {formatDate(paymentSchedule.due_date)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <Badge
                  variant="outline"
                  className={getPaymentStatusBadgeClass(
                    paymentSchedule.payment_status
                  )}
                >
                  {paymentSchedule.payment_status}
                </Badge>
              </div>
              {paymentSchedule.days_overdue > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Overdue:</span>
                  <span className="text-red-600 font-medium">
                    {paymentSchedule.days_overdue} days
                  </span>
                </div>
              )}
            </div>
          </div>

          {paymentSchedule.notes && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {paymentSchedule.notes}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Record Information</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{formatDate(paymentSchedule.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{formatDate(paymentSchedule.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Navigate to invoice detail
                console.log("View invoice:", paymentSchedule.invoice_id);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Invoice Details
            </Button>
            {paymentSchedule.payment_status !== "paid" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Send payment reminder
                  console.log("Send reminder for:", paymentSchedule.id);
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
