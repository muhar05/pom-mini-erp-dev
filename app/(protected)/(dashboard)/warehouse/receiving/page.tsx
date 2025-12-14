"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import GoodsReceiptsTable from "./_components/goods-receipts-table";
import AddGoodsReceiptButton from "./_components/add-goods-receipt-button";
import GoodsReceiptFilters from "./_components/goods-receipt-filters";
import GoodsReceiptDetailDrawer from "./_components/goods-receipt-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for now - replace with actual API call
const mockGoodsReceipts = [
  {
    id: "1",
    gr_no: "GR-001",
    po_no: "PO-001",
    vendor_name: "PT. Supplier Tech",
    receiver_name: "John Doe",
    warehouse: "Main Warehouse",
    items_count: 5,
    total_qty: 50,
    receipt_date: "2025-12-10",
    delivery_note: "DN-001",
    status: "Received",
    created_at: "2025-12-10",
    updated_at: "2025-12-10",
  },
  {
    id: "2",
    gr_no: "GR-002",
    po_no: "PO-002",
    vendor_name: "CV. Indo Supplies",
    receiver_name: "Jane Smith",
    warehouse: "Main Warehouse",
    items_count: 3,
    total_qty: 30,
    receipt_date: "2025-12-11",
    delivery_note: "DN-002",
    status: "Quality Check",
    created_at: "2025-12-11",
    updated_at: "2025-12-12",
  },
  {
    id: "3",
    gr_no: "GR-003",
    po_no: "PO-003",
    vendor_name: "PT. Global Distributor",
    receiver_name: "Bob Wilson",
    warehouse: "Secondary Warehouse",
    items_count: 8,
    total_qty: 80,
    receipt_date: "2025-12-12",
    delivery_note: "DN-003",
    status: "Completed",
    created_at: "2025-12-12",
    updated_at: "2025-12-13",
  },
  {
    id: "4",
    gr_no: "GR-004",
    po_no: "PO-004",
    vendor_name: "PT. Tech Solutions",
    receiver_name: "Alice Johnson",
    warehouse: "Main Warehouse",
    items_count: 2,
    total_qty: 20,
    receipt_date: "2025-12-13",
    delivery_note: "DN-004",
    status: "Partial",
    created_at: "2025-12-13",
    updated_at: "2025-12-13",
  },
];

export default function GoodsReceiptsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockGoodsReceipts.filter((gr) => {
    const matchesSearch =
      gr.gr_no.toLowerCase().includes(search.toLowerCase()) ||
      gr.po_no.toLowerCase().includes(search.toLowerCase()) ||
      gr.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      gr.delivery_note.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      gr.status.toLowerCase() === statusFilter.toLowerCase();

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
        title="Goods Receipt"
        text="Manage and monitor incoming goods from purchase orders"
      />
      <AddGoodsReceiptButton />
      <GoodsReceiptFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Goods Receipts</h2>
          <GoodsReceiptsTable
            goodsReceipts={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <GoodsReceiptDetailDrawer
            goodsReceipt={
              mockGoodsReceipts.find((gr) => gr.id === selected) || null
            }
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
