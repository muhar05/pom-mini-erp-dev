"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import SalesOrdersTable from "./_components/sales-orders-table";
import AddSalesOrderButton from "./_components/add-sales-order-button";
import SalesOrderFilters from "./_components/sales-order-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/session-context";
import SalesOrderDetailDrawer from "./_components/sales-order-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for now - replace with actual API call
const mockSalesOrders = [
  {
    id: "1",
    so_no: "SO-001",
    quotation_no: "QT-001",
    customer_name: "PT. ABC Technology",
    customer_email: "contact@abctech.com",
    sales_pic: "John Sales",
    items_count: 3,
    total_amount: 50000000,
    payment_term: "Net 30",
    delivery_date: "2025-12-20",
    status: "Open",
    created_at: "2025-12-13",
    updated_at: "2025-12-13",
  },
  {
    id: "2",
    so_no: "SO-002",
    quotation_no: "QT-002",
    customer_name: "CV. Digital Solutions",
    customer_email: "info@digitalsol.co.id",
    sales_pic: "Jane Sales",
    items_count: 5,
    total_amount: 75000000,
    payment_term: "Net 45",
    delivery_date: "2025-12-25",
    status: "Confirmed",
    created_at: "2025-12-10",
    updated_at: "2025-12-12",
  },
];

export default function SalesOrdersPage() {
  const { user } = useSession();
  const isSuperadmin = user?.role === "superadmin";
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic dummy
  const filteredData = mockSalesOrders.filter(
    (so) =>
      so.so_no.toLowerCase().includes(search.toLowerCase()) ||
      so.customer_name.toLowerCase().includes(search.toLowerCase())
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
        title="Sales Orders"
        text="Manage and monitor your sales orders"
      />
      <AddSalesOrderButton />
      <SalesOrderFilters />
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
          </div>
          <SalesOrdersTable salesOrders={pagedData} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <SalesOrderDetailDrawer
            salesOrder={
              mockSalesOrders.find((so) => so.id === selected) || null
            }
            isOpen={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
