"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StockReservationActions from "./stock-reservation-actions";
import { formatDate } from "@/utils/formatDate";

type StockReservation = {
  id: string;
  sr_no: string;
  so_no: string;
  customer_name: string;
  reserved_by: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  reservation_date: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface StockReservationsTableProps {
  stockReservations: StockReservation[];
  onRowClick?: (id: string) => void;
}

// Helper function to get status badge styling
function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "reserved":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "fulfilled":
      return "bg-green-100 text-green-800 border-green-200";
    case "partially fulfilled":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "expired":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-purple-100 text-purple-800 border-purple-200";
  }
}

export default function StockReservationsTable({
  stockReservations,
  onRowClick,
}: StockReservationsTableProps) {
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
          <TableHead>SR No</TableHead>
          <TableHead>SO Reference</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Reserved By</TableHead>
          <TableHead>Warehouse</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total Qty</TableHead>
          <TableHead>Reservation Date</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stockReservations.map((sr, idx) => (
          <TableRow
            key={sr.id}
            onClick={() => handleRowClick(sr.id)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{sr.sr_no}</TableCell>
            <TableCell>{sr.so_no}</TableCell>
            <TableCell>{sr.customer_name}</TableCell>
            <TableCell>{sr.reserved_by}</TableCell>
            <TableCell>{sr.warehouse}</TableCell>
            <TableCell>{sr.items_count}</TableCell>
            <TableCell>{sr.total_qty}</TableCell>
            <TableCell>{formatDate(sr.reservation_date)}</TableCell>
            <TableCell>{formatDate(sr.expiry_date)}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  sr.status
                )}`}
              >
                {sr.status}
              </span>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <StockReservationActions
                stockReservation={sr}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </TableCell>
          </TableRow>
        ))}
        {stockReservations.length === 0 && (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-8 text-gray-500">
              No stock reservations found.
              <a
                href="/warehouse/reservations/new"
                className="text-blue-600 hover:underline ml-1"
              >
                Create your first stock reservation
              </a>
              .
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
