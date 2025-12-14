"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import StockReservationsTable from "./_components/stock-reservations-table";
import AddStockReservationButton from "./_components/add-stock-reservation-button";
import StockReservationFilters from "./_components/stock-reservation-filters";
import StockReservationDetailDrawer from "./_components/stock-reservation-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for now - replace with actual API call
const mockStockReservations = [
  {
    id: "1",
    sr_no: "SR-001",
    so_no: "SO-001",
    customer_name: "PT. ABC Technology",
    reserved_by: "John Doe",
    warehouse: "Main Warehouse",
    items_count: 5,
    total_qty: 25,
    reservation_date: "2025-12-10",
    expiry_date: "2025-12-20",
    status: "Reserved",
    created_at: "2025-12-10",
    updated_at: "2025-12-10",
  },
  {
    id: "2",
    sr_no: "SR-002",
    so_no: "SO-002",
    customer_name: "CV. XYZ Solutions",
    reserved_by: "Jane Smith",
    warehouse: "Main Warehouse",
    items_count: 3,
    total_qty: 15,
    reservation_date: "2025-12-11",
    expiry_date: "2025-12-25",
    status: "Fulfilled",
    created_at: "2025-12-11",
    updated_at: "2025-12-13",
  },
  {
    id: "3",
    sr_no: "SR-003",
    so_no: "SO-003",
    customer_name: "PT. Global Corp",
    reserved_by: "Bob Wilson",
    warehouse: "Secondary Warehouse",
    items_count: 8,
    total_qty: 40,
    reservation_date: "2025-12-12",
    expiry_date: "2025-12-30",
    status: "Partially Fulfilled",
    created_at: "2025-12-12",
    updated_at: "2025-12-13",
  },
  {
    id: "4",
    sr_no: "SR-004",
    so_no: "SO-004",
    customer_name: "PT. Innovative Tech",
    reserved_by: "Alice Johnson",
    warehouse: "Main Warehouse",
    items_count: 2,
    total_qty: 10,
    reservation_date: "2025-12-13",
    expiry_date: "2025-12-28",
    status: "Cancelled",
    created_at: "2025-12-13",
    updated_at: "2025-12-14",
  },
];

export default function StockReservationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockStockReservations.filter((sr) => {
    const matchesSearch =
      sr.sr_no.toLowerCase().includes(search.toLowerCase()) ||
      sr.so_no.toLowerCase().includes(search.toLowerCase()) ||
      sr.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      sr.reserved_by.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      sr.status.toLowerCase() === statusFilter.toLowerCase();

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
        title="Stock Reservations"
        text="Manage and monitor stock reservations for sales orders"
      />
      <AddStockReservationButton />
      <StockReservationFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            List Stock Reservations
          </h2>
          <StockReservationsTable
            stockReservations={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <StockReservationDetailDrawer
            stockReservation={
              mockStockReservations.find((sr) => sr.id === selected) || null
            }
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
