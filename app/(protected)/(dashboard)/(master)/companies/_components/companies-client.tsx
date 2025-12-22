"use client";

import React, { useState, useMemo, useEffect } from "react";
import CompaniesTable from "./companies-table";
import CompanyFilters from "./company-filters";
import AddCompanyButton from "./add-company-button";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import type { company } from "@/types/models";

type Company = company & {
  // Tambahkan field UI opsional jika perlu
};

interface CompaniesClientProps {
  companies: Company[];
}

export default function CompaniesClient({ companies }: CompaniesClientProps) {
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);

  // Filter data (misal: search by name)
  const filteredCompanies = useMemo(() => {
    let filtered = companies;
    if (filters.search) {
      filtered = filtered.filter((c) =>
        c.company_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    return filtered;
  }, [companies, filters]);

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filteredCompanies.length / pageSize);
  const paged = filteredCompanies.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className="grid grid-cols-1 gap-2">
      <DashboardBreadcrumb
        title="Company List"
        text="Manage and monitor your companies"
      />
      <AddCompanyButton />
      <CompanyFilters filters={filters} onFilterChange={setFilters} />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">List Companies</h2>
        <CompaniesTable companies={paged} filters={filters} />
        <div className="flex justify-end items-center gap-2 mt-2">
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
