"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import SalesOrdersTable from "./_components/sales-orders-table";
import Filters from "./_components/filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/session-context";
import SalesOrderDetailDrawer from "./_components/sales-order-detail-drawer";
import Pagination from "@/components/ui/pagination";

const dummyData = [
  {
    id: 1,
    so_no: "SO-001",
    created_at: "2025-12-13",
    customer: "PT. ABC",
    email: "abc@email.com",
    quotation_no: "QT-001",
    items: 3,
    total: 15000000,
    status: "Open",
    lastUpdate: "2025-12-13",
  },
  // Tambahkan data lain sesuai kebutuhan
];

export default function SalesOrdersPage() {
  const { user } = useSession();
  const isSuperadmin = user?.role === "superadmin";
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic dummy
  const filteredData = dummyData.filter(
    (so) =>
      so.so_no.toLowerCase().includes(search.toLowerCase()) ||
      so.customer.toLowerCase().includes(search.toLowerCase())
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
        title="Sales Order"
        text="Manage your sales orders here."
      />
      {isSuperadmin && (
        <Button asChild>
          <a href="/crm/sales-orders/new">Add Sales Order</a>
        </Button>
      )}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Sales Orders</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <Input
              placeholder="Search SO No / Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Filters />
          </div>
          <SalesOrdersTable
            data={pagedData}
            isSuperadmin={isSuperadmin}
            onRowClick={(id: number) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <SalesOrderDetailDrawer
            open={!!selected}
            salesOrder={dummyData.find((so) => so.id === selected)}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
