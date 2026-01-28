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
import { useSession } from "@/contexts/session-context";
import { isManagerSales, isSuperuser } from "@/utils/userHelpers";
import { SQ_STATUS_OPTIONS } from "@/utils/statusHelpers";

interface QuotationFiltersProps {
  filters: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  setFilters: (filters: any) => void;
}

export default function QuotationFilters({
  filters,
  setFilters,
}: QuotationFiltersProps) {
  const session = useSession();
  const user = session?.user;
  const canShowDateFilters = user && (isManagerSales(user) || isSuperuser(user));

  const handleSearchChange = (v: string) => {
    setFilters((prev: any) => ({ ...prev, search: v }));
  };

  const handleStatusChange = (v: string) => {
    setFilters((prev: any) => ({ ...prev, status: v }));
  };

  const handleDateFromChange = (v: string) => {
    setFilters((prev: any) => ({ ...prev, dateFrom: v }));
  };

  const handleDateToChange = (v: string) => {
    setFilters((prev: any) => ({ ...prev, dateTo: v }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-center mt-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search quotation no / customer..."
          className="pl-10"
          value={filters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {SQ_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {canShowDateFilters && (
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Dari</label>
          <Input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="w-auto h-10"
          />
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sampai</label>
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
