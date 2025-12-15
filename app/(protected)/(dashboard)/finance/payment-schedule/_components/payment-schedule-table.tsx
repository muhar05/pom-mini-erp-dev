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

interface PaymentScheduleTableProps {
  paymentSchedules: PaymentSchedule[];
  onRowClick?: (id: string) => void;
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

// Helper function to get due date styling
function getDueDateClass(dueDate: string, isOverdue: boolean): string {
  if (isOverdue) {
    return "text-red-600 font-medium";
  }

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    return "text-yellow-600 font-medium";
  }

  return "text-gray-900";
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PaymentScheduleTable({
  paymentSchedules,
  onRowClick,
}: PaymentScheduleTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice No</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount Due</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Days Overdue</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Payment Term</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentSchedules.map((schedule) => (
            <TableRow
              key={schedule.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => onRowClick?.(schedule.id)}
            >
              <TableCell className="font-medium">
                {schedule.invoice_no}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{schedule.customer_name}</div>
                  <div className="text-sm text-gray-500">
                    {schedule.customer_email}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(schedule.amount_due)}
              </TableCell>
              <TableCell
                className={getDueDateClass(
                  schedule.due_date,
                  schedule.days_overdue > 0
                )}
              >
                {formatDate(schedule.due_date)}
              </TableCell>
              <TableCell>
                {schedule.days_overdue > 0 ? (
                  <span className="text-red-600 font-medium">
                    {schedule.days_overdue} days
                  </span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getPaymentStatusBadgeClass(
                    schedule.payment_status
                  )}
                >
                  {schedule.payment_status}
                </Badge>
              </TableCell>
              <TableCell>{schedule.payment_term}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {schedule.notes}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {paymentSchedules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No payment schedules found
        </div>
      )}
    </div>
  );
}
