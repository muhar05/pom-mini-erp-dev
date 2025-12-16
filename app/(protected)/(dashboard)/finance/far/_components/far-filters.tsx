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

interface FarFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

export default function FarFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}: FarFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search Asset Code, Name, Invoice, Location..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Asset Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="disposed">Disposed</SelectItem>
          <SelectItem value="maintenance">Under Maintenance</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Asset Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="it equipment">IT Equipment</SelectItem>
          <SelectItem value="furniture">Furniture</SelectItem>
          <SelectItem value="vehicle">Vehicle</SelectItem>
          <SelectItem value="building equipment">Building Equipment</SelectItem>
          <SelectItem value="security equipment">Security Equipment</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
