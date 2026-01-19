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
import { formatStatusDisplay } from "@/utils/statusHelpers";
import { formatCurrency } from "@/utils/formatCurrency";

type Quotation = {
  id: string;
  quotation_no: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  grand_total: number;
  total_amount: number;
  status: string;
  last_update: string;
  opportunity_no: string;
  user_id?: number | null;
  lead_id?: number | null;
};

interface QuotationsTableProps {
  quotations: Quotation[];
  onRowClick?: (id: string) => void;
  onRefresh?: () => void;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "sq_draft":
    case "draft":
      return "bg-gray-800 text-gray-100 border-gray-700";
    case "sq_approved":
    case "approved":
      return "bg-green-700 text-white border-green-800";
    case "sq_sent":
    case "sent":
      return "bg-blue-700 text-white border-blue-800";
    case "sq_revised":
    case "negotiation / revised":
      return "bg-yellow-600 text-white border-yellow-700";
    case "sq_lost":
    case "lost":
      return "bg-red-700 text-white border-red-800";
    case "sq_win":
    case "win":
      return "bg-emerald-700 text-white border-emerald-800";
    case "sq_converted":
    case "converted":
      return "bg-purple-700 text-white border-purple-800";
    default:
      return "bg-gray-800 text-gray-100 border-gray-700";
  }
}

function isQuotationIncomplete(q: Quotation): boolean {
  return (
    !q.customer_name?.trim() ||
    q.customer_name === "-" ||
    !q.type?.trim() ||
    q.type === "-" ||
    !q.company?.trim() ||
    q.company === "-" ||
    !q.quotation_no?.trim() ||
    q.quotation_no === "-" ||
    q.grand_total === undefined ||
    q.grand_total === null
  );
}

export default function QuotationsTable({
  quotations,
  onRowClick,
  onRefresh,
}: QuotationsTableProps) {
  const hasIncomplete = quotations.some(isQuotationIncomplete);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Quotation No</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Sales</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          {hasIncomplete && <TableHead>Status Info</TableHead>}
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
            <TableCell>{q.sales_pic || "-"}</TableCell>
            <TableCell>{q.company || "-"}</TableCell>
            <TableCell>{formatCurrency(q.grand_total)}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  q.status,
                )}`}
              >
                {formatStatusDisplay(q.status)}
              </span>
            </TableCell>
            <TableCell>{formatDate(q.created_at)}</TableCell>
            {hasIncomplete && (
              <TableCell>
                {isQuotationIncomplete(q) && (
                  <span className="inline-block px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold border border-yellow-300">
                    Lengkapi data quotation ini
                  </span>
                )}
              </TableCell>
            )}
            <TableCell onClick={(e) => e.stopPropagation()}>
              <QuotationActions quotation={q} onRefresh={onRefresh} />
            </TableCell>
          </TableRow>
        ))}
        {quotations.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={hasIncomplete ? 11 : 10}
              className="text-center py-8 text-gray-500"
            >
              No quotations found.
              {/* <a
                href="/sales/quotations/new"
                className="text-blue-600 hover:underline ml-1"
              >
                Create your first quotation
              </a> */}
              .
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
