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
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Settings,
} from "lucide-react";

type Movement = {
  id: string;
  movement_type: string;
  item_code: string;
  item_name: string;
  sku: string;
  quantity: number;
  unit: string;
  warehouse: string;
  location: string;
  reference_no: string;
  reference_type: string;
  batch_no: string | null;
  notes: string;
  created_by: string;
  movement_date: string;
  status: string;
};

interface MovementsTableProps {
  movements: Movement[];
  onRowClick?: (id: string) => void;
}

// Helper function to get movement type badge styling and icon
function getMovementTypeInfo(type: string) {
  switch (type.toLowerCase()) {
    case "in":
      return {
        class: "bg-green-100 text-green-800 border-green-200",
        icon: ArrowDownCircle,
        label: "In",
      };
    case "out":
      return {
        class: "bg-red-100 text-red-800 border-red-200",
        icon: ArrowUpCircle,
        label: "Out",
      };
    case "transfer":
      return {
        class: "bg-blue-100 text-blue-800 border-blue-200",
        icon: ArrowLeftRight,
        label: "Transfer",
      };
    case "adjustment":
      return {
        class: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Settings,
        label: "Adjustment",
      };
    default:
      return {
        class: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Settings,
        label: type,
      };
  }
}

// Helper function to get status badge styling
function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

export default function MovementsTable({
  movements,
  onRowClick,
}: MovementsTableProps) {
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
          <TableHead>Movement Type</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Item Code</TableHead>
          <TableHead>Item Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Warehouse</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Reference No</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement, idx) => {
          const typeInfo = getMovementTypeInfo(movement.movement_type);
          const TypeIcon = typeInfo.icon;

          return (
            <TableRow
              key={movement.id}
              onClick={() => handleRowClick(movement.id)}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <TableCell>{idx + 1}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${typeInfo.class}`}
                >
                  <TypeIcon className="w-3.5 h-3.5" />
                  {typeInfo.label}
                </span>
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(movement.movement_date)}
              </TableCell>
              <TableCell className="font-medium">
                {movement.item_code}
              </TableCell>
              <TableCell>{movement.item_name}</TableCell>
              <TableCell className="font-mono text-sm">
                {movement.sku}
              </TableCell>
              <TableCell>
                <span
                  className={`font-semibold ${
                    movement.quantity > 0
                      ? "text-green-600"
                      : movement.quantity < 0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity} {movement.unit}
                </span>
              </TableCell>
              <TableCell>{movement.warehouse}</TableCell>
              <TableCell className="font-mono text-sm">
                {movement.location}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {movement.reference_no}
              </TableCell>
              <TableCell>{movement.created_by}</TableCell>
              <TableCell>
                <Badge
                  className={`${getStatusBadgeClass(movement.status)} border`}
                >
                  {movement.status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
        {movements.length === 0 && (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-8 text-gray-500">
              No movements found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
