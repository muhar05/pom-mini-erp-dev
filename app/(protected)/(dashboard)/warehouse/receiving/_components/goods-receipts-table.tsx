"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import GoodsReceiptActions from "./goods-receipt-actions";
import { formatDate } from "@/utils/formatDate";

type GoodsReceipt = {
  id: string;
  gr_no: string;
  po_no: string;
  vendor_name: string;
  receiver_name: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  receipt_date: string;
  delivery_note: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface GoodsReceiptsTableProps {
  goodsReceipts: GoodsReceipt[];
  onRowClick?: (id: string) => void;
}

// Helper function to get status badge styling
function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "received":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "quality check":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "partial":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "cancelled":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-purple-100 text-purple-800 border-purple-200";
  }
}

export default function GoodsReceiptsTable({
  goodsReceipts,
  onRowClick,
}: GoodsReceiptsTableProps) {
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
          <TableHead>GR No</TableHead>
          <TableHead>PO Reference</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Delivery Note</TableHead>
          <TableHead>Receiver</TableHead>
          <TableHead>Warehouse</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total Qty</TableHead>
          <TableHead>Receipt Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {goodsReceipts.map((gr, idx) => (
          <TableRow
            key={gr.id}
            onClick={() => handleRowClick(gr.id)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{gr.gr_no}</TableCell>
            <TableCell>{gr.po_no}</TableCell>
            <TableCell>{gr.vendor_name}</TableCell>
            <TableCell>{gr.delivery_note}</TableCell>
            <TableCell>{gr.receiver_name}</TableCell>
            <TableCell>{gr.warehouse}</TableCell>
            <TableCell>{gr.items_count}</TableCell>
            <TableCell>{gr.total_qty}</TableCell>
            <TableCell>{formatDate(gr.receipt_date)}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  gr.status
                )}`}
              >
                {gr.status}
              </span>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <GoodsReceiptActions
                goodsReceipt={gr}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </TableCell>
          </TableRow>
        ))}
        {goodsReceipts.length === 0 && (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-8 text-gray-500">
              No goods receipts found.
              <a
                href="/warehouse/receiving/new"
                className="text-blue-600 hover:underline ml-1"
              >
                Create your first goods receipt
              </a>
              .
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
