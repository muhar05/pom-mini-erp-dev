"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";

interface MovementFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  movementTypeFilter: string;
  setMovementTypeFilter: (type: string) => void;
  warehouseFilter: string;
  setWarehouseFilter: (warehouse: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

export default function MovementFilters({
  search,
  setSearch,
  movementTypeFilter,
  setMovementTypeFilter,
  warehouseFilter,
  setWarehouseFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: MovementFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search item code, name, SKU, reference..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={movementTypeFilter}
          onValueChange={setMovementTypeFilter}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Movement Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="in">In</SelectItem>
            <SelectItem value="out">Out</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>

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
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Date Range:</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-40"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="date"
            className="w-40"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
          />
        </div>
      </div>
    </div>
  );
}
