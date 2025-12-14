"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PurchaseRequestActions from "./purchase-request-actions";
import { formatDate } from "@/utils/formatDate";

type PurchaseRequest = {
  id: string;
  pr_no: string;
  so_no: string;
  requested_by: string;
  department: string;
  items_count: number;
  total_amount: number;
  request_date: string;
  required_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface PurchaseRequestsTableProps {
  purchaseRequests: PurchaseRequest[];
  onRowClick?: (id: string) => void;
}

// Helper function to get status badge styling
function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "converted to po":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "cancelled":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

export default function PurchaseRequestsTable({
  purchaseRequests,
  onRowClick,
}: PurchaseRequestsTableProps) {
  const handleRowClick = (id: string) => {
    if (onRowClick) {
      onRowClick(id);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>PR No</TableHead>
          <TableHead>SO Reference</TableHead>
          <TableHead>Requested By</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Request Date</TableHead>
          <TableHead>Required Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchaseRequests.map((pr, idx) => (
          <TableRow
            key={pr.id}
            onClick={() => handleRowClick(pr.id)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{pr.pr_no}</TableCell>
            <TableCell>{pr.so_no}</TableCell>
            <TableCell>{pr.requested_by}</TableCell>
            <TableCell>{pr.department}</TableCell>
            <TableCell>{pr.items_count}</TableCell>
            <TableCell>
              {pr.total_amount.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </TableCell>
            <TableCell>{formatDate(pr.request_date)}</TableCell>
            <TableCell>{formatDate(pr.required_date)}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  pr.status
                )}`}
              >
                {pr.status}
              </span>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <PurchaseRequestActions
                purchaseRequest={pr}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </TableCell>
          </TableRow>
        ))}
        {purchaseRequests.length === 0 && (
          <TableRow>
            <TableCell colSpan={11} className="text-center py-8 text-gray-500">
              No purchase requests found.
              <a
                href="/purchasing/purchase-requests/new"
                className="text-blue-600 hover:underline ml-1"
              >
                Create your first purchase request
              </a>
              .
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
