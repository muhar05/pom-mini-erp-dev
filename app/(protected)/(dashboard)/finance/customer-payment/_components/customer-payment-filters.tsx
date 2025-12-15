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

interface CustomerPaymentFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  paymentStatusFilter: string;
  setPaymentStatusFilter: (status: string) => void;
  riskLevelFilter: string;
  setRiskLevelFilter: (filter: string) => void;
}

export default function CustomerPaymentFilters({
  search,
  setSearch,
  paymentStatusFilter,
  setPaymentStatusFilter,
  riskLevelFilter,
  setRiskLevelFilter,
}: CustomerPaymentFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search Customer Name, Email..."
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
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="partial">Partial</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>

      <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Risk Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Risk Levels</SelectItem>
          <SelectItem value="high">High Risk</SelectItem>
          <SelectItem value="medium">Medium Risk</SelectItem>
          <SelectItem value="low">Low Risk</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
