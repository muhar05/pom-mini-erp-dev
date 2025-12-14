"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface StockFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  warehouseFilter: string;
  setWarehouseFilter: (warehouse: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

export default function StockFilters({
  search,
  setSearch,
  warehouseFilter,
  setWarehouseFilter,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}: StockFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search item code, name, SKU, supplier..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Warehouse" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Warehouses</SelectItem>
          <SelectItem value="main warehouse">Main Warehouse</SelectItem>
          <SelectItem value="secondary warehouse">
            Secondary Warehouse
          </SelectItem>
          <SelectItem value="distribution center">
            Distribution Center
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="electronics">Electronics</SelectItem>
          <SelectItem value="accessories">Accessories</SelectItem>
          <SelectItem value="components">Components</SelectItem>
          <SelectItem value="software">Software</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="low stock">Low Stock</SelectItem>
          <SelectItem value="out of stock">Out of Stock</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
