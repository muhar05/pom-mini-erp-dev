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

interface SalesOrderFiltersProps {
  filters: {
    search?: string;
    status?: string;
    saleStatus?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function SalesOrderFilters({
  filters,
  onFilterChange,
}: SalesOrderFiltersProps) {
  const session = useSession();
  const user = session?.user;
  const canShowDateFilters = user && (isManagerSales(user) || isSuperuser(user));

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value === "all" ? undefined : value,
    });
  };

  const handleSaleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      saleStatus: value === "all" ? undefined : value,
    });
  };

  const handlePaymentStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      paymentStatus: value === "all" ? undefined : value,
    });
  };

  const handleDateFromChange = (value: string) => {
    onFilterChange({ ...filters, dateFrom: value });
  };

  const handleDateToChange = (value: string) => {
    onFilterChange({ ...filters, dateTo: value });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search SO No, Quotation ID..."
          className="pl-10"
          value={filters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <Select
        value={filters.status || "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.saleStatus || "all"}
        onValueChange={handleSaleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sale Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sale Status</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.paymentStatus || "all"}
        onValueChange={handlePaymentStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment Status</SelectItem>
          <SelectItem value="UNPAID">Unpaid</SelectItem>
          <SelectItem value="PARTIAL">Partial</SelectItem>
          <SelectItem value="PAID">Paid</SelectItem>
          <SelectItem value="OVERDUE">Overdue</SelectItem>
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
