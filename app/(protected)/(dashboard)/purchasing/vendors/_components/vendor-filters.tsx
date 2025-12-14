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

interface VendorFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export default function VendorFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: VendorFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search Vendor Code, Name, Contact..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Payment Term" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Terms</SelectItem>
          <SelectItem value="net-30">Net 30</SelectItem>
          <SelectItem value="net-45">Net 45</SelectItem>
          <SelectItem value="net-60">Net 60</SelectItem>
          <SelectItem value="cod">COD</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
