"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import PurchaseRequestsTable from "./_components/purchase-requests-table";
import AddPurchaseRequestButton from "./_components/add-purchase-request-button";
import PurchaseRequestFilters from "./_components/purchase-request-filters";
import { Input } from "@/components/ui/input";
import PurchaseRequestDetailDrawer from "./_components/purchase-request-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for now - replace with actual API call
const mockPurchaseRequests = [
  {
    id: "1",
    pr_no: "PR-001",
    so_no: "SO-001",
    requested_by: "John Doe",
    department: "Sales",
    items_count: 5,
    total_amount: 25000000,
    request_date: "2025-12-10",
    required_date: "2025-12-20",
    status: "Pending",
    created_at: "2025-12-10",
    updated_at: "2025-12-10",
  },
  {
    id: "2",
    pr_no: "PR-002",
    so_no: "SO-002",
    requested_by: "Jane Smith",
    department: "Sales",
    items_count: 3,
    total_amount: 15000000,
    request_date: "2025-12-11",
    required_date: "2025-12-25",
    status: "Approved",
    created_at: "2025-12-11",
    updated_at: "2025-12-12",
  },
  {
    id: "3",
    pr_no: "PR-003",
    so_no: "SO-003",
    requested_by: "Bob Wilson",
    department: "Operations",
    items_count: 8,
    total_amount: 40000000,
    request_date: "2025-12-12",
    required_date: "2025-12-30",
    status: "Converted to PO",
    created_at: "2025-12-12",
    updated_at: "2025-12-13",
  },
];

export default function PurchaseRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockPurchaseRequests.filter((pr) => {
    const matchesSearch =
      pr.pr_no.toLowerCase().includes(search.toLowerCase()) ||
      pr.so_no.toLowerCase().includes(search.toLowerCase()) ||
      pr.requested_by.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      pr.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <DashboardBreadcrumb
        title="Purchase Requests"
        text="Manage and monitor your purchase requests"
      />
      <AddPurchaseRequestButton />
      <PurchaseRequestFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Purchase Requests</h2>
          <PurchaseRequestsTable
            purchaseRequests={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <PurchaseRequestDetailDrawer
            purchaseRequest={
              mockPurchaseRequests.find((pr) => pr.id === selected) || null
            }
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
