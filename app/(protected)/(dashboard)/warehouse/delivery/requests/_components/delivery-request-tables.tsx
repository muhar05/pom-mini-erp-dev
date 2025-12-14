"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeliveryRequestActions from "./delivery-request-actions";
import { formatDate } from "@/utils/formatDate";

type DeliveryRequest = {
  id: string;
  dr_no: string;
  so_no: string;
  sr_no: string;
  customer_name: string;
  delivery_address: string;
  requested_by: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  request_date: string;
  required_date: string;
  delivery_type: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

interface DeliveryRequestsTableProps {
  deliveryRequests: DeliveryRequest[];
  onRowClick?: (id: string) => void;
}

// Helper function to get status badge styling
function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "approved":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "in progress":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function DeliveryRequestsTable({
  deliveryRequests,
  onRowClick,
}: DeliveryRequestsTableProps) {
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
          <TableHead>DR No</TableHead>
          <TableHead>SO Reference</TableHead>
          <TableHead>SR Reference</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Requested By</TableHead>
          <TableHead>Warehouse</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total Qty</TableHead>
          <TableHead>Request Date</TableHead>
          <TableHead>Required Date</TableHead>
          <TableHead>Delivery Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveryRequests.map((dr, idx) => (
          <TableRow
            key={dr.id}
            onClick={() => handleRowClick(dr.id)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{dr.dr_no}</TableCell>
            <TableCell>{dr.so_no}</TableCell>
            <TableCell>{dr.sr_no}</TableCell>
            <TableCell>{dr.customer_name}</TableCell>
            <TableCell>{dr.requested_by}</TableCell>
            <TableCell>{dr.warehouse}</TableCell>
            <TableCell>{dr.items_count}</TableCell>
            <TableCell>{dr.total_qty}</TableCell>
            <TableCell>{formatDate(dr.request_date)}</TableCell>
            <TableCell>{formatDate(dr.required_date)}</TableCell>
            <TableCell>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                {dr.delivery_type}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  dr.status
                )}`}
              >
                {dr.status}
              </span>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DeliveryRequestActions deliveryRequest={dr} />
            </TableCell>
          </TableRow>
        ))}
        {deliveryRequests.length === 0 && (
          <TableRow>
            <TableCell colSpan={14} className="text-center py-8 text-gray-500">
              No delivery requests found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
