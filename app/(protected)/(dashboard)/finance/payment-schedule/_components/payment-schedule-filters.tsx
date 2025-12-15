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

interface PaymentScheduleFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  paymentStatusFilter: string;
  setPaymentStatusFilter: (status: string) => void;
  dueDateFilter: string;
  setDueDateFilter: (filter: string) => void;
}

export default function PaymentScheduleFilters({
  search,
  setSearch,
  paymentStatusFilter,
  setPaymentStatusFilter,
  dueDateFilter,
  setDueDateFilter,
}: PaymentScheduleFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search Invoice No, Customer..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select
        value={paymentStatusFilter}
        onValueChange={setPaymentStatusFilter}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment Status</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="partial">Partial</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>

      <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Due Date Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Due Dates</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="today">Due Today</SelectItem>
          <SelectItem value="this-week">Due This Week</SelectItem>
          <SelectItem value="this-month">Due This Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
