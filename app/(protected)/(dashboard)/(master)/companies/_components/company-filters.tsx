"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

interface CompanyFiltersProps {
  filters: any;
  onFilterChange: (newFilters: any) => void;
}

export default function CompanyFilters({
  filters,
  onFilterChange,
}: CompanyFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  return (
    <div className="flex gap-4 items-center mt-4 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search companies..."
          className="pl-10"
          value={filters.search || ""}
          onChange={handleSearchChange}
        />
      </div>
      {/* Tambahkan filter lain jika perlu */}
    </div>
  );
}
