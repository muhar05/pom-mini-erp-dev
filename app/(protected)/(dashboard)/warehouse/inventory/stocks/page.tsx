"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import StocksTable from "./_components/stock-tables";
import StockFilters from "./_components/stock-filters";
import StockDetailDrawer from "./_components/stock-detail-drawer";
import Pagination from "@/components/ui/pagination";
import { useI18n } from "@/contexts/i18n-context";

// Mock data for now - replace with actual API call
const mockStocks = [
  {
    id: "1",
    item_code: "ITM-001",
    item_name: "Laptop Dell XPS 13",
    category: "Electronics",
    sku: "DELL-XPS13-001",
    warehouse: "Main Warehouse",
    location: "A1-B2-C3",
    current_stock: 25,
    reserved_stock: 5,
    available_stock: 20,
    unit: "pcs",
    unit_cost: 15000000,
    total_value: 375000000,
    min_stock: 10,
    max_stock: 50,
    reorder_point: 15,
    last_updated: "2025-12-14",
    status: "Active",
    supplier: "PT. Dell Indonesia",
    batch_no: "BATCH-001",
    expiry_date: null,
  },
  {
    id: "2",
    item_code: "ITM-002",
    item_name: "Mouse Wireless Logitech",
    category: "Accessories",
    sku: "LOG-MOUSE-002",
    warehouse: "Main Warehouse",
    location: "B2-C3-D4",
    current_stock: 150,
    reserved_stock: 10,
    available_stock: 140,
    unit: "pcs",
    unit_cost: 250000,
    total_value: 37500000,
    min_stock: 20,
    max_stock: 200,
    reorder_point: 30,
    last_updated: "2025-12-14",
    status: "Active",
    supplier: "PT. Logitech Indonesia",
    batch_no: "BATCH-002",
    expiry_date: null,
  },
  {
    id: "3",
    item_code: "ITM-003",
    item_name: "Keyboard Mechanical RGB",
    category: "Accessories",
    sku: "CORSAIR-K95-003",
    warehouse: "Secondary Warehouse",
    location: "C3-D4-E5",
    current_stock: 8,
    reserved_stock: 2,
    available_stock: 6,
    unit: "pcs",
    unit_cost: 2500000,
    total_value: 20000000,
    min_stock: 10,
    max_stock: 30,
    reorder_point: 12,
    last_updated: "2025-12-13",
    status: "Low Stock",
    supplier: "PT. Corsair Indonesia",
    batch_no: "BATCH-003",
    expiry_date: null,
  },
  {
    id: "4",
    item_code: "ITM-004",
    item_name: "Monitor 24 inch 4K",
    category: "Electronics",
    sku: "ASUS-MON24-004",
    warehouse: "Main Warehouse",
    location: "D4-E5-F6",
    current_stock: 0,
    reserved_stock: 0,
    available_stock: 0,
    unit: "pcs",
    unit_cost: 3500000,
    total_value: 0,
    min_stock: 5,
    max_stock: 20,
    reorder_point: 8,
    last_updated: "2025-12-12",
    status: "Out of Stock",
    supplier: "PT. ASUS Indonesia",
    batch_no: null,
    expiry_date: null,
  },
  {
    id: "5",
    item_code: "ITM-005",
    item_name: "RAM DDR4 16GB",
    category: "Components",
    sku: "KINGSTON-16GB-005",
    warehouse: "Main Warehouse",
    location: "E5-F6-G7",
    current_stock: 45,
    reserved_stock: 8,
    available_stock: 37,
    unit: "pcs",
    unit_cost: 1200000,
    total_value: 54000000,
    min_stock: 15,
    max_stock: 60,
    reorder_point: 20,
    last_updated: "2025-12-14",
    status: "Active",
    supplier: "PT. Kingston Technology",
    batch_no: "BATCH-005",
    expiry_date: null,
  },
  {
    id: "6",
    item_code: "ITM-006",
    item_name: "SSD 1TB NVMe",
    category: "Components",
    sku: "SAMSUNG-1TB-006",
    warehouse: "Secondary Warehouse",
    location: "F6-G7-H8",
    current_stock: 75,
    reserved_stock: 15,
    available_stock: 60,
    unit: "pcs",
    unit_cost: 1800000,
    total_value: 135000000,
    min_stock: 25,
    max_stock: 100,
    reorder_point: 35,
    last_updated: "2025-12-14",
    status: "Active",
    supplier: "PT. Samsung Electronics",
    batch_no: "BATCH-006",
    expiry_date: null,
  },
];

export default function StocksPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockStocks.filter((stock) => {
    const matchesSearch =
      stock.item_code.toLowerCase().includes(search.toLowerCase()) ||
      stock.item_name.toLowerCase().includes(search.toLowerCase()) ||
      stock.sku.toLowerCase().includes(search.toLowerCase()) ||
      stock.supplier.toLowerCase().includes(search.toLowerCase());

    const matchesWarehouse =
      warehouseFilter === "all" ||
      stock.warehouse.toLowerCase() === warehouseFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      stock.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      stock.category.toLowerCase() === categoryFilter.toLowerCase();

    return (
      matchesSearch && matchesWarehouse && matchesStatus && matchesCategory
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
        title={t("page.warehouse.title")}
        text={t("page.warehouse.list")}
      />

      <StockFilters
        search={search}
        setSearch={setSearch}
        warehouseFilter={warehouseFilter}
        setWarehouseFilter={setWarehouseFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{t("page.warehouse.list")}</h2>
          <StocksTable
            stocks={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <StockDetailDrawer
            stock={mockStocks.find((stock) => stock.id === selected) || null}
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
