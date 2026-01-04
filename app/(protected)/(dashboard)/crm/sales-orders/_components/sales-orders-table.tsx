"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SalesOrderActions from "./sales-order-actions";
import SalesOrderDetailDrawer from "./sales-order-detail-drawer";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";

type SalesOrder = {
  id: string;
  so_no: string;
  quotation_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  items_count: number;
  total_amount: number;
  payment_term: string;
  delivery_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface SalesOrdersTableProps {
  salesOrders: SalesOrder[];
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
    case "completed":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function SalesOrdersTable({
  salesOrders,
}: SalesOrdersTableProps) {
  const [selectedSalesOrder, setSelectedSalesOrder] =
    useState<SalesOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (salesOrder: SalesOrder) => {
    setSelectedSalesOrder(salesOrder);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedSalesOrder(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>SO No</TableHead>
            <TableHead>Quotation No</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Delivery Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salesOrders.map((salesOrder, idx) => (
            <TableRow
              key={salesOrder.id}
              onClick={() => handleRowClick(salesOrder)}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <TableCell>{idx + 1}</TableCell>
              <TableCell className="font-medium">{salesOrder.so_no}</TableCell>
              <TableCell>{salesOrder.quotation_no}</TableCell>
              <TableCell>{salesOrder.customer_name}</TableCell>
              <TableCell>{salesOrder.customer_email || "-"}</TableCell>
              <TableCell>{salesOrder.items_count}</TableCell>
              <TableCell>
                {salesOrder.total_amount.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </TableCell>
              <TableCell>{formatDate(salesOrder.delivery_date)}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                    salesOrder.status
                  )}`}
                >
                  {salesOrder.status}
                </span>
              </TableCell>
              <TableCell>{formatDate(salesOrder.created_at)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <SalesOrderActions
                  salesOrder={salesOrder}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </TableCell>
            </TableRow>
          ))}
          {salesOrders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={12}
                className="text-center py-8 text-gray-500"
              >
                No sales orders found.
                <a
                  href="/crm/sales-orders/new"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Create your first sales order
                </a>
                .
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Sales Order Detail Drawer */}
      <SalesOrderDetailDrawer
        salesOrder={selectedSalesOrder}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </>
  );
}
