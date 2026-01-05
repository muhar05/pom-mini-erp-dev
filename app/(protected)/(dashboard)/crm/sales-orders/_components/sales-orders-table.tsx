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
import SalesOrderActions from "./sales-order-actions";
import SalesOrderDetailDrawer from "./sales-order-detail-drawer";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";

type SalesOrder = {
  id: string;
  so_no: string;
  quotation_no: string;
  quotation_id?: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  items_count: number;
  total_amount: number;
  payment_term: string;
  delivery_date: string;
  status: string;
  sale_status?: string;
  payment_status?: string;
  created_at: string;
  updated_at: string;
};

interface SalesOrdersTableProps {
  salesOrders: SalesOrder[];
  onUpdate?: () => void; // Add callback for updates
}

// Enhanced status badge styling
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
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getPaymentBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "partial":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "unpaid":
      return "bg-red-100 text-red-800 border-red-200";
    case "overdue":
      return "bg-red-200 text-red-900 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function SalesOrdersTable({
  salesOrders,
  onUpdate,
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
            <TableHead>From Quotation</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Sale Status</TableHead>
            <TableHead>Payment Status</TableHead>
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
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {salesOrder.quotation_no || salesOrder.quotation_id || "-"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{salesOrder.customer_name}</div>
                  <div className="text-sm text-gray-500">
                    {salesOrder.customer_email || "-"}
                  </div>
                </div>
              </TableCell>
              <TableCell>{salesOrder.items_count}</TableCell>
              <TableCell>
                {salesOrder.total_amount.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </TableCell>
              <TableCell>
                <Badge
                  className={`text-xs ${getStatusBadgeClass(
                    salesOrder.sale_status || salesOrder.status
                  )}`}
                >
                  {salesOrder.sale_status || salesOrder.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={`text-xs ${getPaymentBadgeClass(
                    salesOrder.payment_status || "UNPAID"
                  )}`}
                >
                  {salesOrder.payment_status || "UNPAID"}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(salesOrder.created_at)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <SalesOrderActions
                  salesOrder={salesOrder}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onUpdate={onUpdate}
                />
              </TableCell>
            </TableRow>
          ))}
          {salesOrders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center py-8 text-gray-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <p>No sales orders found.</p>
                  <p className="text-sm">
                    Sales Orders are created automatically when you{" "}
                    <a
                      href="/crm/quotations"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      convert approved quotations
                    </a>
                    .
                  </p>
                </div>
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
