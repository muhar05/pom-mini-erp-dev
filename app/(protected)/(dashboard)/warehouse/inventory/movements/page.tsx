"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import MovementsTable from "./_components/movements-table";
import MovementFilters from "./_components/movement-filters";
import MovementDetailDrawer from "./_components/movement-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for stock movements
const mockMovements = [
  {
    id: "1",
    movement_type: "In",
    item_code: "ITM-001",
    item_name: "Laptop Dell XPS 13",
    sku: "DELL-XPS13-001",
    quantity: 10,
    unit: "pcs",
    warehouse: "Main Warehouse",
    location: "A1-B2-C3",
    reference_no: "PO-2025-001",
    reference_type: "Purchase Order",
    batch_no: "BATCH-001",
    notes: "Purchase from PT. Dell Indonesia",
    created_by: "John Doe",
    movement_date: "2025-12-14T10:30:00",
    status: "Completed",
  },
  {
    id: "2",
    movement_type: "Out",
    item_code: "ITM-002",
    item_name: "Mouse Wireless Logitech",
    sku: "LOG-MOUSE-002",
    quantity: 5,
    unit: "pcs",
    warehouse: "Main Warehouse",
    location: "B2-C3-D4",
    reference_no: "SO-2025-001",
    reference_type: "Sales Order",
    batch_no: "BATCH-002",
    notes: "Sales order for PT. Client ABC",
    created_by: "Jane Smith",
    movement_date: "2025-12-14T14:15:00",
    status: "Completed",
  },
  {
    id: "3",
    movement_type: "Transfer",
    item_code: "ITM-003",
    item_name: "Keyboard Mechanical RGB",
    sku: "CORSAIR-K95-003",
    quantity: 3,
    unit: "pcs",
    warehouse: "Main Warehouse",
    location: "C3-D4-E5",
    reference_no: "TRF-2025-001",
    reference_type: "Transfer Order",
    batch_no: "BATCH-003",
    notes: "Transfer to Secondary Warehouse",
    created_by: "Mike Johnson",
    movement_date: "2025-12-14T09:00:00",
    status: "Completed",
  },
  {
    id: "4",
    movement_type: "Adjustment",
    item_code: "ITM-004",
    item_name: "Monitor 24 inch 4K",
    sku: "ASUS-MON24-004",
    quantity: -2,
    unit: "pcs",
    warehouse: "Main Warehouse",
    location: "D4-E5-F6",
    reference_no: "ADJ-2025-001",
    reference_type: "Stock Adjustment",
    batch_no: null,
    notes: "Stock adjustment due to damaged items",
    created_by: "Admin User",
    movement_date: "2025-12-13T16:45:00",
    status: "Completed",
  },
  {
    id: "5",
    movement_type: "In",
    item_code: "ITM-005",
    item_name: "RAM DDR4 16GB",
    sku: "KINGSTON-16GB-005",
    quantity: 20,
    unit: "pcs",
    warehouse: "Main Warehouse",
    location: "E5-F6-G7",
    reference_no: "PO-2025-002",
    reference_type: "Purchase Order",
    batch_no: "BATCH-005",
    notes: "Purchase from PT. Kingston Technology",
    created_by: "John Doe",
    movement_date: "2025-12-13T11:20:00",
    status: "Completed",
  },
  {
    id: "6",
    movement_type: "Out",
    item_code: "ITM-006",
    item_name: "SSD 1TB NVMe",
    sku: "SAMSUNG-1TB-006",
    quantity: 8,
    unit: "pcs",
    warehouse: "Secondary Warehouse",
    location: "F6-G7-H8",
    reference_no: "SO-2025-002",
    reference_type: "Sales Order",
    batch_no: "BATCH-006",
    notes: "Sales order for PT. Client XYZ",
    created_by: "Jane Smith",
    movement_date: "2025-12-12T15:30:00",
    status: "Completed",
  },
  {
    id: "7",
    movement_type: "In",
    item_code: "ITM-001",
    item_name: "Laptop Dell XPS 13",
    sku: "DELL-XPS13-001",
    quantity: 5,
    unit: "pcs",
    warehouse: "Main Warehouse",
    location: "A1-B2-C3",
    reference_no: "PO-2025-003",
    reference_type: "Purchase Order",
    batch_no: "BATCH-007",
    notes: "Restock from supplier",
    created_by: "John Doe",
    movement_date: "2025-12-12T10:00:00",
    status: "Completed",
  },
  {
    id: "8",
    movement_type: "Transfer",
    item_code: "ITM-002",
    item_name: "Mouse Wireless Logitech",
    sku: "LOG-MOUSE-002",
    quantity: 15,
    unit: "pcs",
    warehouse: "Secondary Warehouse",
    location: "B2-C3-D4",
    reference_no: "TRF-2025-002",
    reference_type: "Transfer Order",
    batch_no: "BATCH-002",
    notes: "Transfer from Main Warehouse",
    created_by: "Mike Johnson",
    movement_date: "2025-12-11T14:00:00",
    status: "Completed",
  },
];

export default function StockMovementsPage() {
  const [search, setSearch] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockMovements.filter((movement) => {
    const matchesSearch =
      movement.item_code.toLowerCase().includes(search.toLowerCase()) ||
      movement.item_name.toLowerCase().includes(search.toLowerCase()) ||
      movement.sku.toLowerCase().includes(search.toLowerCase()) ||
      movement.reference_no.toLowerCase().includes(search.toLowerCase());

    const matchesMovementType =
      movementTypeFilter === "all" ||
      movement.movement_type.toLowerCase() === movementTypeFilter.toLowerCase();

    const matchesWarehouse =
      warehouseFilter === "all" ||
      movement.warehouse.toLowerCase() === warehouseFilter.toLowerCase();

    const movementDate = new Date(movement.movement_date);
    const matchesStartDate = !startDate || movementDate >= new Date(startDate);
    const matchesEndDate = !endDate || movementDate <= new Date(endDate);

    return (
      matchesSearch &&
      matchesMovementType &&
      matchesWarehouse &&
      matchesStartDate &&
      matchesEndDate
    );
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
        title="Stock Movements"
        text="View history of all stock movements across warehouses"
      />

      <MovementFilters
        search={search}
        setSearch={setSearch}
        movementTypeFilter={movementTypeFilter}
        setMovementTypeFilter={setMovementTypeFilter}
        warehouseFilter={warehouseFilter}
        setWarehouseFilter={setWarehouseFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Stock Movement History</h2>
          <MovementsTable
            movements={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <MovementDetailDrawer
            movement={
              mockMovements.find((movement) => movement.id === selected) || null
            }
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
