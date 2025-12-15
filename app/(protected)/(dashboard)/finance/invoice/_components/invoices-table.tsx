"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InvoiceActions from "./invoice-actions";
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

interface InvoicesTableProps {
  invoices: Invoice[];
  onRowClick?: (id: string) => void;
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

export default function InvoicesTable({
  invoices,
  onRowClick,
}: InvoicesTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Invoice No</TableHead>
            <TableHead className="w-[120px]">SO No</TableHead>
            <TableHead className="w-[200px]">Customer</TableHead>
            <TableHead className="w-[100px] text-center">Items</TableHead>
            <TableHead className="w-[130px] text-right">Total Amount</TableHead>
            <TableHead className="w-[110px] text-center">
              Invoice Date
            </TableHead>
            <TableHead className="w-[110px] text-center">Due Date</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
            <TableHead className="w-[120px] text-center">
              Payment Status
            </TableHead>
            <TableHead className="w-20 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-muted-foreground py-8"
              >
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onRowClick?.(invoice.id)}
              >
                <TableCell className="font-medium">
                  {invoice.invoice_no}
                </TableCell>
                <TableCell>{invoice.sales_order_no}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{invoice.customer_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {invoice.customer_email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {invoice.items_count}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(invoice.total_amount)}
                </TableCell>
                <TableCell className="text-center">
                  {formatDate(invoice.invoice_date)}
                </TableCell>
                <TableCell className="text-center">
                  {formatDate(invoice.due_date)}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusBadgeClass(
                      invoice.payment_status
                    )}`}
                  >
                    {invoice.payment_status}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div onClick={(e) => e.stopPropagation()}>
                    <InvoiceActions invoice={invoice} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
