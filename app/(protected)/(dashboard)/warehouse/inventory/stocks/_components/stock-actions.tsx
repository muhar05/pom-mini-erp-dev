"use client";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

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

interface StockActionsProps {
  stock: Stock;
}

export default function StockActions({ stock }: StockActionsProps) {
  return (
    <div className="flex gap-2">
      {/* View */}
      <Link href={`/warehouse/inventory/stocks/${stock.id}`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
