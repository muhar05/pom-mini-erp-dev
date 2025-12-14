"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StockActions from "./stock-actions";
import { formatDate } from "@/utils/formatDate";

type Stock = {
  id: string;
  item_code: string;
  item_name: string;
  category: string;
  sku: string;
  warehouse: string;
  location: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  unit: string;
  unit_cost: number;
  total_value: number;
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  last_updated: string;
  status: string;
  supplier: string;
  batch_no: string | null;
  expiry_date: string | null;
};

interface StocksTableProps {
  stocks: Stock[];
  onRowClick?: (id: string) => void;
}

// Helper function to get stock level badge styling
function getStockLevelClass(stock: Stock): string {
  if (stock.current_stock === 0) {
    return "bg-red-100 text-red-800 border-red-200";
  } else if (stock.current_stock <= stock.reorder_point) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  } else {
    return "bg-green-100 text-green-800 border-green-200";
  }
}

// Helper function to get status badge styling
function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "low stock":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "out of stock":
      return "bg-red-100 text-red-800 border-red-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
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

export default function StocksTable({ stocks, onRowClick }: StocksTableProps) {
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
          <TableHead>Item Code</TableHead>
          <TableHead>Item Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Warehouse</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Reserved</TableHead>
          <TableHead>Available</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Unit Cost</TableHead>
          <TableHead>Total Value</TableHead>
          <TableHead>Stock Level</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.map((stock, idx) => (
          <TableRow
            key={stock.id}
            onClick={() => handleRowClick(stock.id)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{stock.item_code}</TableCell>
            <TableCell>{stock.item_name}</TableCell>
            <TableCell>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                {stock.category}
              </span>
            </TableCell>
            <TableCell className="font-mono text-sm">{stock.sku}</TableCell>
            <TableCell>{stock.warehouse}</TableCell>
            <TableCell className="font-mono text-sm">
              {stock.location}
            </TableCell>
            <TableCell className="text-center font-semibold">
              {stock.current_stock}
            </TableCell>
            <TableCell className="text-center text-orange-600">
              {stock.reserved_stock}
            </TableCell>
            <TableCell className="text-center text-green-600 font-semibold">
              {stock.available_stock}
            </TableCell>
            <TableCell>{stock.unit}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(stock.unit_cost)}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(stock.total_value)}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockLevelClass(
                  stock
                )}`}
              >
                {stock.current_stock === 0
                  ? "Out of Stock"
                  : stock.current_stock <= stock.reorder_point
                  ? "Low Stock"
                  : "In Stock"}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  stock.status
                )}`}
              >
                {stock.status}
              </span>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <StockActions stock={stock} />
            </TableCell>
          </TableRow>
        ))}
        {stocks.length === 0 && (
          <TableRow>
            <TableCell colSpan={16} className="text-center py-8 text-gray-500">
              No stocks found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
