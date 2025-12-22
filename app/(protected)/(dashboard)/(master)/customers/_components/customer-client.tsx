"use client";

import React, { useState, useMemo, useEffect } from "react";
import CustomersTable from "./customer-table";
import CustomerFilters from "./customer-filters";
import AddCustomerButton from "./add-customer-button";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import type { customers } from "@/types/models";

type Customer = customers & {
  status?: string | null;
  customer_type?: string | null;
  contact_person?: string | null;
  city?: string | null;
  country?: string | null;
  updated_at?: string | Date | null;
};

interface CustomersClientProps {
  customers: Customer[];
}

export default function CustomersClient({ customers }: CustomersClientProps) {
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);

  // Filter data berdasarkan search, type, status
  const filteredCustomers = useMemo(() => {
    let filtered = customers;
    if (filters.search) {
      filtered = filtered.filter((c) =>
        c.customer_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.customer_type && filters.customer_type !== "all") {
      filtered = filtered.filter(
        (c) =>
          (c.customer_type || c.type || "").toLowerCase() ===
          filters.customer_type.toLowerCase()
      );
    }
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(
        (c) => (c.status || "").toLowerCase() === filters.status.toLowerCase()
      );
    }
    return filtered;
  }, [customers, filters]);

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paged = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

  // Reset page jika filter berubah
  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className="grid grid-cols-1 gap-6 mt-2">
      <AddCustomerButton />
      <CustomerFilters filters={filters} onFilterChange={setFilters} />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">List Customers</h2>
        <CustomersTable customers={paged} filters={filters} />
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded border"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <button
            className="px-3 py-1 rounded border"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
