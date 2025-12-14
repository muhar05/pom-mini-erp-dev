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

interface StockReservationFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export default function StockReservationFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: StockReservationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search SR No, SO No, Customer..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="reserved">Reserved</SelectItem>
          <SelectItem value="fulfilled">Fulfilled</SelectItem>
          <SelectItem value="partially fulfilled">
            Partially Fulfilled
          </SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Warehouse" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Warehouses</SelectItem>
          <SelectItem value="main">Main Warehouse</SelectItem>
          <SelectItem value="secondary">Secondary Warehouse</SelectItem>
          <SelectItem value="transit">Transit Warehouse</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
