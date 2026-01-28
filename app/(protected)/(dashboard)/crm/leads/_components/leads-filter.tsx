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

import { isManagerSales, isSuperuser } from "@/utils/userHelpers";
import { useSession } from "@/contexts/session-context";

export default function LeadsFilter({
  onFilterChange,
  filters,
}: LeadsFilterProps) {
  const { t } = useI18n();
  const session = useSession();
  const user = session?.user;
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const canShowDateFilters = user && (isManagerSales(user) || isSuperuser(user));

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

  const handleDateFromChange = (value: string) => {
    onFilterChange({ ...filters, dateFrom: value });
  };

  const handleDateToChange = (value: string) => {
    onFilterChange({ ...filters, dateTo: value });
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

      {canShowDateFilters && (
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">{t("common.from") || "Dari"}</label>
          <Input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="w-auto h-10"
          />
          <label className="text-sm font-medium">{t("common.to") || "Sampai"}</label>
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
