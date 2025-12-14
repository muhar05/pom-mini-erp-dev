"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import PurchaseOrdersTable from "./_components/purchase-orders-table";
import AddPurchaseOrderButton from "./_components/add-purchase-order-button";
import PurchaseOrderFilters from "./_components/purchase-order-filters";
import { Input } from "@/components/ui/input";
import PurchaseOrderDetailDrawer from "./_components/purchase-order-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for now - replace with actual API call
const mockPurchaseOrders = [
  {
    id: "1",
    po_no: "PO-001",
    pr_no: "PR-001",
    vendor_name: "PT. Supplier Tech",
    vendor_email: "sales@suppliertech.com",
    contact_person: "Budi Vendor",
    items_count: 5,
    total_amount: 25000000,
    order_date: "2025-12-13",
    delivery_date: "2025-12-25",
    payment_term: "Net 30",
    status: "Open",
    created_at: "2025-12-13",
    updated_at: "2025-12-13",
  },
  {
    id: "2",
    po_no: "PO-002",
    pr_no: "PR-002",
    vendor_name: "CV. Indo Supplies",
    vendor_email: "contact@indosupplies.co.id",
    contact_person: "Siti Vendor",
    items_count: 3,
    total_amount: 15000000,
    order_date: "2025-12-14",
    delivery_date: "2025-12-28",
    payment_term: "Net 45",
    status: "Confirmed",
    created_at: "2025-12-14",
    updated_at: "2025-12-14",
  },
  {
    id: "3",
    po_no: "PO-003",
    pr_no: "PR-003",
    vendor_name: "PT. Global Distributor",
    vendor_email: "info@globaldist.com",
    contact_person: "Ahmad Vendor",
    items_count: 8,
    total_amount: 40000000,
    order_date: "2025-12-12",
    delivery_date: "2025-12-30",
    payment_term: "Net 30",
    status: "Received",
    created_at: "2025-12-12",
    updated_at: "2025-12-13",
  },
];

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockPurchaseOrders.filter((po) => {
    const matchesSearch =
      po.po_no.toLowerCase().includes(search.toLowerCase()) ||
      po.pr_no.toLowerCase().includes(search.toLowerCase()) ||
      po.vendor_name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      po.status.toLowerCase() === statusFilter.toLowerCase();

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
        title="Purchase Orders"
        text="Manage and monitor your purchase orders"
      />
      <AddPurchaseOrderButton />
      <PurchaseOrderFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Purchase Orders</h2>
          <PurchaseOrdersTable
            purchaseOrders={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <PurchaseOrderDetailDrawer
            purchaseOrder={
              mockPurchaseOrders.find((po) => po.id === selected) || null
            }
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
