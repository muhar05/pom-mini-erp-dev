"use client";

import React from "react";
import { useParams } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/utils/formatDate";
import {
  ArrowLeft,
  Calendar,
  Mail,
  FileText,
  Clock,
  AlertTriangle,
  Printer,
  Download,
} from "lucide-react";
import Link from "next/link";

// Mock data - in real app, this would come from API
const mockPaymentSchedule = {
  id: "1",
  invoice_no: "INV-001",
  invoice_id: "1",
  customer_name: "PT. Client Technology",
  customer_email: "finance@clienttech.com",
  customer_address: "Jl. Sudirman No. 123, Jakarta",
  amount_due: 27000000,
  due_date: "2025-12-25",
  payment_status: "Pending",
  days_overdue: 0,
  invoice_date: "2025-12-10",
  payment_term: "Net 15",
  notes: "Payment due in 9 days",
  created_at: "2025-12-10",
  updated_at: "2025-12-15",
};

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
      bgColor: "bg-red-50 border-red-200",
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
      bgColor: "bg-yellow-50 border-yellow-200",
      icon: Clock,
    };
  } else if (diffDays <= 3) {
    return {
      level: "due-soon",
      text: `Payment due in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 border-yellow-200",
      icon: Clock,
    };
  } else {
    return {
      level: "normal",
      text: `Payment due in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      icon: Calendar,
    };
  }
}

export default function PaymentScheduleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // In real app, fetch payment schedule by id
  const paymentSchedule = mockPaymentSchedule;

  if (!paymentSchedule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Schedule Not Found
          </h3>
          <p className="text-gray-600 mt-2">
            The payment schedule you're looking for doesn't exist.
          </p>
          <Link href="/finance/payment-schedule">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payment Schedules
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const urgencyInfo = getUrgencyInfo(
    paymentSchedule.due_date,
    paymentSchedule.days_overdue > 0
  );
  const UrgencyIcon = urgencyInfo.icon;

  return (
    <>
      <DashboardBreadcrumb
        title={`Payment Schedule ${paymentSchedule.invoice_no}`}
        text="Payment schedule details and management"
      />

      <div className="flex justify-between items-center mb-6">
        <Link href="/finance/payment-schedule">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment Schedules
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgency Alert */}
          <div className={`p-6 rounded-lg border ${urgencyInfo.bgColor}`}>
            <div className="flex items-center gap-3">
              <UrgencyIcon className={`h-6 w-6 ${urgencyInfo.color}`} />
              <div>
                <h3 className={`font-semibold ${urgencyInfo.color}`}>
                  {urgencyInfo.text}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Due date: {formatDate(paymentSchedule.due_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Invoice Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">
                    Invoice Number
                  </label>
                  <p className="font-medium text-lg">
                    {paymentSchedule.invoice_no}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Invoice Date</label>
                  <p className="font-medium">
                    {formatDate(paymentSchedule.invoice_date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Payment Term</label>
                  <p className="font-medium">{paymentSchedule.payment_term}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Amount Due</label>
                  <p className="font-bold text-2xl text-blue-600">
                    {formatCurrency(paymentSchedule.amount_due)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Payment Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={getPaymentStatusBadgeClass(
                        paymentSchedule.payment_status
                      )}
                    >
                      {paymentSchedule.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Customer Name</label>
                <p className="font-medium text-lg">
                  {paymentSchedule.customer_name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">
                    {paymentSchedule.customer_email}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Billing Address</label>
                <p className="font-medium">
                  {paymentSchedule.customer_address}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Schedule Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Payment Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Invoice Created</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(paymentSchedule.invoice_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    paymentSchedule.days_overdue > 0
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="font-medium">Payment Due</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(paymentSchedule.due_date)}
                  </p>
                </div>
              </div>
              {paymentSchedule.payment_status === "paid" && (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Payment Received</p>
                    <p className="text-sm text-gray-600">Payment completed</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {paymentSchedule.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {paymentSchedule.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Invoice Details
              </Button>
              {paymentSchedule.payment_status !== "paid" && (
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Payment Reminder
                </Button>
              )}
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice PDF
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold">
                  {formatCurrency(paymentSchedule.amount_due)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium">
                  {paymentSchedule.payment_status === "paid"
                    ? formatCurrency(paymentSchedule.amount_due)
                    : "Rp 0"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding:</span>
                <span className="font-bold text-red-600">
                  {paymentSchedule.payment_status === "paid"
                    ? "Rp 0"
                    : formatCurrency(paymentSchedule.amount_due)}
                </span>
              </div>
            </div>
          </div>

          {/* Record Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Record Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="font-medium">
                  {formatDate(paymentSchedule.created_at)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <p className="font-medium">
                  {formatDate(paymentSchedule.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
