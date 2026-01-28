"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PurchaseOrderActions from "./purchase-order-actions";
import { formatDate } from "@/utils/formatDate";

type PurchaseOrder = {
  id: string;
  po_no: string;
  pr_no: string;
  vendor_name: string;
  vendor_email: string;
  contact_person: string;
  items_count: number;
  total_amount: number;
  order_date: string;
  delivery_date: string;
  payment_term: string;
  status: string;
  created_at: string;
  updated_at: string;
  sales_order_no?: string;
};

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[];
  onRowClick?: (id: string) => void;
}

// Helper function to get status badge styling
function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "received":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function PurchaseOrdersTable({
  purchaseOrders,
  onRowClick,
}: PurchaseOrdersTableProps) {
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
          <TableHead>PO No</TableHead>
          <TableHead>PR Reference</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Contact Person</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Order Date</TableHead>
          <TableHead>Delivery Date</TableHead>
          <TableHead>Payment Term</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>SO Reference</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchaseOrders.map((po, idx) => (
          <TableRow
            key={po.id}
            onClick={() => handleRowClick(po.id)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{po.po_no}</TableCell>
            <TableCell>{po.pr_no}</TableCell>
            <TableCell>{po.vendor_name}</TableCell>
            <TableCell>{po.contact_person}</TableCell>
            <TableCell>{po.items_count}</TableCell>
            <TableCell>
              {po.total_amount.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </TableCell>
            <TableCell>{formatDate(po.order_date)}</TableCell>
            <TableCell>{formatDate(po.delivery_date)}</TableCell>
            <TableCell>{po.payment_term}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  po.status
                )}`}
              >
                {po.status}
              </span>
            </TableCell>
            <TableCell>
              {po.sales_order_no ? (
                <span className="font-mono text-blue-600 font-bold">{po.sales_order_no}</span>
              ) : (
                <span className="text-gray-400">Non-SO</span>
              )}
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <PurchaseOrderActions
                purchaseOrder={po}
                onEdit={() => { }}
                onDelete={() => { }}
              />
            </TableCell>
          </TableRow>
        ))}
        {purchaseOrders.length === 0 && (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-8 text-gray-500">
              No purchase orders found.
              <a
                href="/purchasing/purchase-orders/new"
                className="text-blue-600 hover:underline ml-1"
              >
                Create your first purchase order
              </a>
              .
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table >
  );
}
