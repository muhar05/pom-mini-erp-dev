"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import FarTable from "./_components/far-table";
import FarFilters from "./_components/far-filters";
import FarDetailDrawer from "./_components/far-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for FAR (Fixed Asset Register) - replace with actual API call
const mockFarData = [
  {
    id: "1",
    asset_code: "FAR-001",
    asset_name: "Server Dell PowerEdge R740",
    category: "IT Equipment",
    subcategory: "Server",
    purchase_date: "2024-01-15",
    invoice_no: "INV-001",
    sales_order_no: "SO-001",
    supplier_name: "PT. Dell Indonesia",
    original_cost: 85000000,
    accumulated_depreciation: 10625000,
    net_book_value: 74375000,
    depreciation_method: "Straight Line",
    useful_life_years: 8,
    monthly_depreciation: 885417,
    location: "Data Center - Jakarta",
    condition: "Good",
    status: "Active",
    remarks: "Primary application server",
    created_at: "2024-01-15",
    updated_at: "2025-12-16",
  },
  {
    id: "2",
    asset_code: "FAR-002",
    asset_name: "MacBook Pro 16-inch",
    category: "IT Equipment",
    subcategory: "Laptop",
    purchase_date: "2024-03-20",
    invoice_no: "INV-045",
    sales_order_no: "SO-045",
    supplier_name: "PT. Apple Indonesia",
    original_cost: 35000000,
    accumulated_depreciation: 8750000,
    net_book_value: 26250000,
    depreciation_method: "Straight Line",
    useful_life_years: 4,
    monthly_depreciation: 729167,
    location: "Office - Jakarta",
    condition: "Good",
    status: "Active",
    remarks: "Development team laptop",
    created_at: "2024-03-20",
    updated_at: "2025-12-16",
  },
  {
    id: "3",
    asset_code: "FAR-003",
    asset_name: "Office Furniture Set",
    category: "Furniture",
    subcategory: "Office Equipment",
    purchase_date: "2024-02-10",
    invoice_no: "INV-023",
    sales_order_no: "SO-023",
    supplier_name: "CV. Furniture Solutions",
    original_cost: 25000000,
    accumulated_depreciation: 2500000,
    net_book_value: 22500000,
    depreciation_method: "Straight Line",
    useful_life_years: 10,
    monthly_depreciation: 208333,
    location: "Office - Jakarta",
    condition: "Good",
    status: "Active",
    remarks: "Executive office furniture",
    created_at: "2024-02-10",
    updated_at: "2025-12-16",
  },
  {
    id: "4",
    asset_code: "FAR-004",
    asset_name: "Toyota Avanza",
    category: "Vehicle",
    subcategory: "Company Car",
    purchase_date: "2023-08-15",
    invoice_no: "INV-156",
    sales_order_no: "SO-156",
    supplier_name: "PT. Toyota Astra Motor",
    original_cost: 250000000,
    accumulated_depreciation: 41666667,
    net_book_value: 208333333,
    depreciation_method: "Straight Line",
    useful_life_years: 6,
    monthly_depreciation: 3472222,
    location: "Jakarta Office",
    condition: "Good",
    status: "Active",
    remarks: "Company operational vehicle",
    created_at: "2023-08-15",
    updated_at: "2025-12-16",
  },
  {
    id: "5",
    asset_code: "FAR-005",
    asset_name: "Air Conditioner LG 2.5 PK",
    category: "Building Equipment",
    subcategory: "HVAC",
    purchase_date: "2024-06-01",
    invoice_no: "INV-089",
    sales_order_no: "SO-089",
    supplier_name: "PT. LG Electronics",
    original_cost: 12000000,
    accumulated_depreciation: 1200000,
    net_book_value: 10800000,
    depreciation_method: "Straight Line",
    useful_life_years: 10,
    monthly_depreciation: 100000,
    location: "Office - Floor 2",
    condition: "Good",
    status: "Active",
    remarks: "Main office air conditioning",
    created_at: "2024-06-01",
    updated_at: "2025-12-16",
  },
  {
    id: "6",
    asset_code: "FAR-006",
    asset_name: "Printer HP LaserJet Pro",
    category: "IT Equipment",
    subcategory: "Printer",
    purchase_date: "2024-04-12",
    invoice_no: "INV-067",
    sales_order_no: "SO-067",
    supplier_name: "PT. HP Indonesia",
    original_cost: 8500000,
    accumulated_depreciation: 1416667,
    net_book_value: 7083333,
    depreciation_method: "Straight Line",
    useful_life_years: 5,
    monthly_depreciation: 141667,
    location: "Office - Admin",
    condition: "Good",
    status: "Active",
    remarks: "Office printing needs",
    created_at: "2024-04-12",
    updated_at: "2025-12-16",
  },
  {
    id: "7",
    asset_code: "FAR-007",
    asset_name: "Conference Table",
    category: "Furniture",
    subcategory: "Meeting Equipment",
    purchase_date: "2024-01-30",
    invoice_no: "INV-012",
    sales_order_no: "SO-012",
    supplier_name: "CV. Office Interior",
    original_cost: 15000000,
    accumulated_depreciation: 1375000,
    net_book_value: 13625000,
    depreciation_method: "Straight Line",
    useful_life_years: 12,
    monthly_depreciation: 125000,
    location: "Meeting Room A",
    condition: "Excellent",
    status: "Active",
    remarks: "Main conference room table",
    created_at: "2024-01-30",
    updated_at: "2025-12-16",
  },
  {
    id: "8",
    asset_code: "FAR-008",
    asset_name: "Security Camera System",
    category: "Security Equipment",
    subcategory: "Surveillance",
    purchase_date: "2024-05-20",
    invoice_no: "INV-078",
    sales_order_no: "SO-078",
    supplier_name: "PT. Security Systems",
    original_cost: 45000000,
    accumulated_depreciation: 5250000,
    net_book_value: 39750000,
    depreciation_method: "Straight Line",
    useful_life_years: 8,
    monthly_depreciation: 468750,
    location: "Office Building",
    condition: "Good",
    status: "Active",
    remarks: "Complete CCTV system installation",
    created_at: "2024-05-20",
    updated_at: "2025-12-16",
  },
];

export default function FarPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockFarData.filter((far) => {
    const matchesSearch =
      far.asset_code.toLowerCase().includes(search.toLowerCase()) ||
      far.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      far.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      far.sales_order_no.toLowerCase().includes(search.toLowerCase()) ||
      far.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      far.location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      far.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      far.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
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
        title="FAR (Fixed Asset Register)"
        text="Monitor and review fixed assets register"
      />

      <FarFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Fixed Assets</h2>
          <FarTable
            farData={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <FarDetailDrawer
            farData={mockFarData.find((far) => far.id === selected) || null}
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
