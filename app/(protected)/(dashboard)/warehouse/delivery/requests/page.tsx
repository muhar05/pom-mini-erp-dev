"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import DeliveryRequestsTable from "./_components/delivery-request-tables";
import AddDeliveryRequestButton from "./_components/add-delivery-request-button";
import DeliveryRequestFilters from "./_components/delivery-request-filters";
import DeliveryRequestDetailDrawer from "./_components/delivery-request-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for now - replace with actual API call
const mockDeliveryRequests = [
  {
    id: "1",
    dr_no: "DR-001",
    so_no: "SO-001",
    sr_no: "SR-001",
    customer_name: "PT. ABC Technology",
    delivery_address: "Jl. Sudirman No. 123, Jakarta",
    requested_by: "John Doe",
    warehouse: "Main Warehouse",
    items_count: 5,
    total_qty: 25,
    request_date: "2025-12-10",
    required_date: "2025-12-15",
    delivery_type: "Standard",
    status: "Pending",
    notes: "Urgent delivery required",
    created_at: "2025-12-10",
    updated_at: "2025-12-10",
  },
  {
    id: "2",
    dr_no: "DR-002",
    so_no: "SO-002",
    sr_no: "SR-002",
    customer_name: "CV. XYZ Solutions",
    delivery_address: "Jl. Thamrin No. 456, Jakarta",
    requested_by: "Jane Smith",
    warehouse: "Main Warehouse",
    items_count: 3,
    total_qty: 15,
    request_date: "2025-12-11",
    required_date: "2025-12-16",
    delivery_type: "Express",
    status: "Approved",
    notes: "",
    created_at: "2025-12-11",
    updated_at: "2025-12-13",
  },
  {
    id: "3",
    dr_no: "DR-003",
    so_no: "SO-003",
    sr_no: "SR-003",
    customer_name: "PT. Global Corp",
    delivery_address: "Jl. Gatot Subroto No. 789, Jakarta",
    requested_by: "Bob Wilson",
    warehouse: "Secondary Warehouse",
    items_count: 8,
    total_qty: 40,
    request_date: "2025-12-12",
    required_date: "2025-12-18",
    delivery_type: "Standard",
    status: "In Progress",
    notes: "Fragile items - handle with care",
    created_at: "2025-12-12",
    updated_at: "2025-12-13",
  },
  {
    id: "4",
    dr_no: "DR-004",
    so_no: "SO-004",
    sr_no: "SR-004",
    customer_name: "PT. Innovative Tech",
    delivery_address: "Jl. Kuningan No. 101, Jakarta",
    requested_by: "Alice Johnson",
    warehouse: "Main Warehouse",
    items_count: 2,
    total_qty: 10,
    request_date: "2025-12-13",
    required_date: "2025-12-17",
    delivery_type: "Same Day",
    status: "Completed",
    notes: "",
    created_at: "2025-12-13",
    updated_at: "2025-12-14",
  },
  {
    id: "5",
    dr_no: "DR-005",
    so_no: "SO-005",
    sr_no: "SR-005",
    customer_name: "PT. Future Systems",
    delivery_address: "Jl. Rasuna Said No. 202, Jakarta",
    requested_by: "David Brown",
    warehouse: "Main Warehouse",
    items_count: 6,
    total_qty: 30,
    request_date: "2025-12-14",
    required_date: "2025-12-20",
    delivery_type: "Standard",
    status: "Cancelled",
    notes: "Customer requested cancellation",
    created_at: "2025-12-14",
    updated_at: "2025-12-14",
  },
];

export default function DeliveryRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockDeliveryRequests.filter((dr) => {
    const matchesSearch =
      dr.dr_no.toLowerCase().includes(search.toLowerCase()) ||
      dr.so_no.toLowerCase().includes(search.toLowerCase()) ||
      dr.sr_no.toLowerCase().includes(search.toLowerCase()) ||
      dr.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      dr.requested_by.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      dr.status.toLowerCase() === statusFilter.toLowerCase();

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
        title="Delivery Request"
        text="Manage and monitor delivery requests for sales orders"
      />
      <AddDeliveryRequestButton />
      <DeliveryRequestFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Delivery Request</h2>
          <DeliveryRequestsTable
            deliveryRequests={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <DeliveryRequestDetailDrawer
            deliveryRequest={
              mockDeliveryRequests.find((dr) => dr.id === selected) || null
            }
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
