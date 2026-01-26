"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUS_OPTIONS } from "@/utils/statusHelpers";
import { useI18n } from "@/contexts/i18n-context";

interface LeadsFilterProps {
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

export default function LeadsFilter({
  onFilterChange,
  filters,
}: LeadsFilterProps) {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== (filters.search || "")) {
        onFilterChange({ ...filters, search: searchTerm });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Sync with prop if it changes externally
  useEffect(() => {
    setSearchTerm(filters.search || "");
  }, [filters.search]);

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value === "all" ? undefined : value });
  };

  const statusOptions = [
    { value: "all", label: t("common.all") },
    ...LEAD_STATUS_OPTIONS,
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <Input
        placeholder={t("common.search")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="min-w-[250px]"
      />

      <Select
        value={filters.status || "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder={t("common.status")} />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
