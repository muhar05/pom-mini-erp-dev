"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OPPORTUNITY_STATUS_OPTIONS } from "@/utils/statusHelpers";

interface OpportunitiesFilterProps {
  onFilterChange: (filters: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
  filters: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

import { useSession } from "@/contexts/session-context";
import { isManagerSales, isSuperuser } from "@/utils/userHelpers";

export default function OpportunitiesFilter({
  onFilterChange,
  filters,
}: OpportunitiesFilterProps) {
  const session = useSession();
  const user = session?.user;
  const canShowDateFilters = user && (isManagerSales(user) || isSuperuser(user));
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value === "all" ? undefined : value });
  };

  const handleDateFromChange = (value: string) => {
    onFilterChange({ ...filters, dateFrom: value });
  };

  const handleDateToChange = (value: string) => {
    onFilterChange({ ...filters, dateTo: value });
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    ...OPPORTUNITY_STATUS_OPTIONS,
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <Input
        placeholder="Search Nama Customer / No Opportunity"
        value={filters.search || ""}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="min-w-[250px]"
      />

      <Select
        value={filters.status || "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {canShowDateFilters && (
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Dari</label>
          <Input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="w-auto h-10"
          />
          <label className="text-sm font-medium">Sampai</label>
          <Input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => handleDateToChange(e.target.value)}
            className="w-auto h-10"
          />
        </div>
      )}
    </div>
  );
}
