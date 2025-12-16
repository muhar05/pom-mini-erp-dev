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
import { formatDate } from "@/utils/formatDate";

type FarData = {
  id: string;
  asset_code: string;
  asset_name: string;
  category: string;
  subcategory: string;
  purchase_date: string;
  invoice_no: string;
  sales_order_no: string;
  supplier_name: string;
  original_cost: number;
  accumulated_depreciation: number;
  net_book_value: number;
  depreciation_method: string;
  useful_life_years: number;
  monthly_depreciation: number;
  location: string;
  condition: string;
  status: string;
  remarks: string;
  created_at: string;
  updated_at: string;
};

interface FarTableProps {
  farData: FarData[];
  onRowClick: (id: string) => void;
}

export default function FarTable({ farData, onRowClick }: FarTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "disposed":
        return "destructive";
      case "maintenance":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getConditionBadgeVariant = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
        return "default";
      case "good":
        return "secondary";
      case "fair":
        return "outline";
      case "poor":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Code</TableHead>
            <TableHead>Asset Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Invoice No</TableHead>
            <TableHead>Original Cost</TableHead>
            <TableHead>Net Book Value</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Purchase Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {farData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-gray-500 py-8"
              >
                No fixed assets found
              </TableCell>
            </TableRow>
          ) : (
            farData.map((far) => (
              <TableRow
                key={far.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                onClick={() => onRowClick(far.id)}
              >
                <TableCell className="font-medium">{far.asset_code}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{far.asset_name}</div>
                    <div className="text-sm text-gray-500">
                      {far.subcategory}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{far.category}</Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{far.invoice_no}</div>
                    <div className="text-xs text-gray-500">
                      {far.sales_order_no}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(far.original_cost)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium">
                    {formatCurrency(far.net_book_value)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Depr: {formatCurrency(far.accumulated_depreciation)}
                  </div>
                </TableCell>
                <TableCell>{far.location}</TableCell>
                <TableCell>
                  <Badge variant={getConditionBadgeVariant(far.condition)}>
                    {far.condition}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(far.status)}>
                    {far.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(far.purchase_date)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
