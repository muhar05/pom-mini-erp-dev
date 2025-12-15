"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatDate";
import { Progress } from "@/components/ui/progress";

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

interface CustomerPaymentTableProps {
  customerPayments: CustomerPayment[];
  onRowClick?: (id: string) => void;
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

// Helper function to get risk level badge
function getRiskLevelBadge(customer: CustomerPayment) {
  if (
    customer.overdue_amount > 0 &&
    customer.days_since_last_payment !== null &&
    customer.days_since_last_payment > 30
  ) {
    return { level: "High", class: "bg-red-100 text-red-800 border-red-200" };
  } else if (
    customer.overdue_amount > 0 ||
    (customer.days_since_last_payment !== null &&
      customer.days_since_last_payment > 15)
  ) {
    return {
      level: "Medium",
      class: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
  } else {
    return {
      level: "Low",
      class: "bg-green-100 text-green-800 border-green-200",
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

export default function CustomerPaymentTable({
  customerPayments,
  onRowClick,
}: CustomerPaymentTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Total Invoices</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Payment Progress</TableHead>
            <TableHead>Outstanding</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Last Payment</TableHead>
            <TableHead>Avg Payment Days</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customerPayments.map((customer) => {
            const riskBadge = getRiskLevelBadge(customer);
            const paymentPercentage = getPaymentPercentage(
              customer.paid_amount,
              customer.total_amount
            );

            return (
              <TableRow
                key={customer.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => onRowClick?.(customer.id)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{customer.customer_name}</div>
                    <div className="text-sm text-gray-500">
                      {customer.customer_email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {customer.total_invoices}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(customer.total_amount)}
                </TableCell>
                <TableCell className="min-w-[150px]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{formatCurrency(customer.paid_amount)}</span>
                      <span className="text-gray-500">
                        {paymentPercentage}%
                      </span>
                    </div>
                    <Progress value={paymentPercentage} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-red-600">
                      {formatCurrency(customer.outstanding_amount)}
                    </div>
                    {customer.overdue_amount > 0 && (
                      <div className="text-xs text-red-500">
                        Overdue: {formatCurrency(customer.overdue_amount)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getPaymentStatusBadgeClass(
                      customer.payment_status
                    )}
                  >
                    {customer.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={riskBadge.class}>
                    {riskBadge.level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    {customer.last_payment_date ? (
                      <>
                        <div className="text-sm">
                          {formatDate(customer.last_payment_date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.days_since_last_payment} days ago
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">No payments</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {customer.average_payment_days !== null ? (
                    <span className="font-medium">
                      {customer.average_payment_days} days
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {customerPayments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No customer payment data found
        </div>
      )}
    </div>
  );
}
