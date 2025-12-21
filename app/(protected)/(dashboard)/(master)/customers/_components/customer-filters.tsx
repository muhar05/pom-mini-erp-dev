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
import React from "react";

interface CustomerFiltersProps {
  filters: any;
  onFilterChange: (newFilters: any) => void;
}

export default function CustomerFilters({
  filters,
  onFilterChange,
}: CustomerFiltersProps) {
  // Implement event handlers to call onFilterChange when filter changes
  // Example for search:
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  // Example for type:
  const handleTypeChange = (value: string) => {
    onFilterChange({ ...filters, customer_type: value });
  };

  // Example for status:
  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value });
  };

  return (
    <div className="flex gap-4 items-center mt-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search customers..."
          className="pl-10"
          value={filters.search || ""}
          onChange={handleSearchChange}
        />
      </div>

      <Select
        value={filters.customer_type || "all"}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Customer Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="corporate">Corporate</SelectItem>
          <SelectItem value="sme">SME</SelectItem>
          <SelectItem value="individual">Individual</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status || "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
