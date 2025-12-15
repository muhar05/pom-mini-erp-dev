"use client";

import React from "react";
import { useParams } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/formatDate";
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  FileText,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
  CreditCard,
  Printer,
  Download,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

// Mock data - in real app, this would come from API
const mockCustomerPayment = {
  id: "1",
  customer_name: "PT. Client Technology",
  customer_email: "finance@clienttech.com",
  customer_address: "Jl. Sudirman No. 123, Jakarta Pusat 10220",
  phone: "+62 21 1234567",
  customer_since: "2025-11-01",
  total_invoices: 3,
  total_amount: 75000000,
  paid_amount: 25000000,
  pending_amount: 27000000,
  overdue_amount: 23000000,
  outstanding_amount: 50000000,
  payment_status: "Partial",
  last_payment_date: "2025-12-10",
  days_since_last_payment: 6,
  average_payment_days: 18,
  payment_terms: "Net 15",
  credit_limit: 100000000,
  created_at: "2025-11-01",
  updated_at: "2025-12-15",
  invoices: [
    {
      id: "1",
      invoice_no: "INV-001",
      amount: 27000000,
      due_date: "2025-12-25",
      status: "Pending",
      invoice_date: "2025-12-10",
      days_overdue: 0,
    },
    {
      id: "7",
      invoice_no: "INV-007",
      amount: 25000000,
      due_date: "2025-12-10",
      status: "Paid",
      invoice_date: "2025-11-25",
      payment_date: "2025-12-10",
      days_overdue: 0,
    },
    {
      id: "9",
      invoice_no: "INV-009",
      amount: 23000000,
      due_date: "2025-12-18",
      status: "Overdue",
      invoice_date: "2025-12-03",
      days_overdue: 7,
    },
  ],
  payment_history: [
    {
      date: "2025-12-10",
      amount: 25000000,
      invoice_no: "INV-007",
      method: "Bank Transfer",
    },
    {
      date: "2025-11-28",
      amount: 15000000,
      invoice_no: "INV-002",
      method: "Bank Transfer",
    },
  ],
};

// Helper functions
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

function getRiskLevelBadge(customer: any) {
  if (customer.overdue_amount > 0 && customer.days_since_last_payment > 30) {
    return {
      level: "High Risk",
      class: "bg-red-100 text-red-800 border-red-200",
      icon: AlertTriangle,
    };
  } else if (
    customer.overdue_amount > 0 ||
    customer.days_since_last_payment > 15
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getPaymentPercentage(paid: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((paid / total) * 100);
}

function getCreditUtilization(outstanding: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.round((outstanding / limit) * 100);
}

export default function CustomerPaymentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // In real app, fetch customer payment by id
  const customerPayment = mockCustomerPayment;

  if (!customerPayment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Customer Not Found
          </h3>
          <p className="text-gray-600 mt-2">
            The customer payment data you're looking for doesn't exist.
          </p>
          <Link href="/finance/customer-payment">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customer Payments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const riskBadge = getRiskLevelBadge(customerPayment);
  const RiskIcon = riskBadge.icon;
  const paymentPercentage = getPaymentPercentage(
    customerPayment.paid_amount,
    customerPayment.total_amount
  );
  const creditUtilization = getCreditUtilization(
    customerPayment.outstanding_amount,
    customerPayment.credit_limit
  );

  return (
    <>
      <DashboardBreadcrumb
        title={`Customer Payment - ${customerPayment.customer_name}`}
        text="Detailed customer payment status and history"
      />

      <div className="flex justify-between items-center mb-6">
        <Link href="/finance/customer-payment">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customer Payments
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Payment Analytics
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold">
                    {customerPayment.customer_name}
                  </h2>
                  <p className="text-gray-600">
                    Customer since {formatDate(customerPayment.customer_since)}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={riskBadge.class}>
                <RiskIcon className="h-3 w-3 mr-1" />
                {riskBadge.level}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">
                    {customerPayment.customer_email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Address</div>
                  <div className="font-medium">
                    {customerPayment.customer_address}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Payment Terms</div>
                  <div className="font-medium">
                    {customerPayment.payment_terms}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Amount</div>
              <div className="text-2xl font-bold">
                {formatCurrency(customerPayment.total_amount)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {customerPayment.total_invoices} invoices
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Paid Amount</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(customerPayment.paid_amount)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {paymentPercentage}% paid
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Outstanding</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(customerPayment.outstanding_amount)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {100 - paymentPercentage}% remaining
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Overdue Amount</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(customerPayment.overdue_amount)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Needs attention</div>
            </div>
          </div>

          {/* Payment Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Payment Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Payment Completion</span>
                  <span>{paymentPercentage}%</span>
                </div>
                <Progress value={paymentPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    Paid: {formatCurrency(customerPayment.paid_amount)}
                  </span>
                  <span>
                    Outstanding:{" "}
                    {formatCurrency(customerPayment.outstanding_amount)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Credit Utilization</span>
                  <span>{creditUtilization}%</span>
                </div>
                <Progress value={creditUtilization} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    Used: {formatCurrency(customerPayment.outstanding_amount)}
                  </span>
                  <span>
                    Limit: {formatCurrency(customerPayment.credit_limit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Invoice Details</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerPayment.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_no}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell
                        className={
                          invoice.status === "Overdue"
                            ? "text-red-600"
                            : "text-gray-900"
                        }
                      >
                        {formatDate(invoice.due_date)}
                      </TableCell>
                      <TableCell>
                        {invoice.days_overdue > 0 ? (
                          <span className="text-red-600 font-medium">
                            {invoice.days_overdue} days
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getInvoiceStatusBadgeClass(invoice.status)}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Payment History</h3>
            <div className="space-y-4">
              {customerPayment.payment_history.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{payment.invoice_no}</div>
                      <div className="text-sm text-gray-600">
                        {formatDate(payment.date)} • {payment.method}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                </div>
              ))}
              {customerPayment.payment_history.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No payment history available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Current Status</h3>
            <div className="space-y-4">
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
                    <span className="text-gray-500">No payments</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Payment Days:</span>
                <span className="font-medium">
                  {customerPayment.average_payment_days} days
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View All Invoices
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Payment Schedule
              </Button>
              {customerPayment.outstanding_amount > 0 && (
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Payment Reminder
                </Button>
              )}
              <Button className="w-full" variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Update Credit Limit
              </Button>
            </div>
          </div>

          {/* Account Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Credit Limit:</span>
                <span className="font-bold">
                  {formatCurrency(customerPayment.credit_limit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Credit:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(
                    customerPayment.credit_limit -
                      customerPayment.outstanding_amount
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Total Invoices:</span>
                <span className="font-medium">
                  {customerPayment.total_invoices}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Since:</span>
                <span className="font-medium">
                  {formatDate(customerPayment.customer_since)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
