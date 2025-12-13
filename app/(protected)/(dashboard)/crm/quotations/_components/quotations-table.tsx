"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import QuotationActions from "./quotation-actions";
import { formatDate } from "@/utils/formatDate";

type Quotation = {
  id: string;
  quotation_no: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  total_amount: number;
  status: string;
  last_update: string;
  opportunity_no: string;
};

interface QuotationsTableProps {
  quotations: Quotation[];
  onRowClick?: (id: string) => void;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "sent":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function QuotationsTable({
  quotations,
  onRowClick,
}: QuotationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Quotation No</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Sales PIC</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotations.map((q, idx) => (
          <TableRow
            key={q.id}
            onClick={() => onRowClick?.(q.id)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{q.quotation_no}</TableCell>
            <TableCell>{q.customer_name}</TableCell>
            <TableCell>{q.customer_email || "-"}</TableCell>
            <TableCell>{q.sales_pic || "-"}</TableCell>
            <TableCell>{q.type || "-"}</TableCell>
            <TableCell>{q.company || "-"}</TableCell>
            <TableCell>
              {q.total_amount.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  q.status
                )}`}
              >
                {q.status}
              </span>
            </TableCell>
            <TableCell>{formatDate(q.created_at)}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <QuotationActions item={q} />
            </TableCell>
          </TableRow>
        ))}
        {quotations.length === 0 && (
          <TableRow>
            <TableCell colSpan={11} className="text-center py-8 text-gray-500">
              No quotations found.
              <a
                href="/crm/quotations/new"
                className="text-blue-600 hover:underline ml-1"
              >
                Create your first quotation
              </a>
              .
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
