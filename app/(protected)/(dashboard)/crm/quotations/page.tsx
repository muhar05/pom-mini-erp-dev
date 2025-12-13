"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import QuotationsTable from "./_components/quotations-table";
import AddQuotationButton from "./_components/add-quotation-button";
import QuotationFilters from "./_components/quotation-filters";
import QuotationDetailDrawer from "./_components/quotation-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for now - replace with actual API call
const mockQuotations = [
  {
    id: "1",
    quotation_no: "QT-001",
    created_at: "2025-12-10",
    customer_name: "PT. XYZ",
    customer_email: "xyz@email.com",
    sales_pic: "Sales 1",
    type: "Perusahaan",
    company: "PT. XYZ",
    total_amount: 20000000,
    status: "Open",
    last_update: "2025-12-11",
    opportunity_no: "OPP-001",
  },
  {
    id: "2",
    quotation_no: "QT-002",
    created_at: "2025-12-12",
    customer_name: "PT. ABC",
    customer_email: "abc@email.com",
    sales_pic: "Sales 2",
    type: "Perusahaan",
    company: "PT. ABC",
    total_amount: 35000000,
    status: "Confirmed",
    last_update: "2025-12-13",
    opportunity_no: "OPP-002",
  },
];

export default function QuotationsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic dummy
  const filteredData = mockQuotations.filter(
    (q) =>
      q.quotation_no.toLowerCase().includes(search.toLowerCase()) ||
      q.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const pageSize = 10;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <DashboardBreadcrumb
        title="Quotations"
        text="Manage and monitor your sales quotations"
      />
      <AddQuotationButton />
      <QuotationFilters search={search} setSearch={setSearch} />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Quotations</h2>
          <QuotationsTable
            quotations={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <QuotationDetailDrawer
            quotation={mockQuotations.find((q) => q.id === selected) || null}
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
