"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import VendorsTable from "./_components/vendors-table";
import AddVendorButton from "./_components/add-vendor-button";
import VendorFilters from "./_components/vendor-filters";
import VendorDetailDrawer from "./_components/vendor-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for now - replace with actual API call
const mockVendors = [
  {
    id: "1",
    vendor_code: "VND-001",
    vendor_name: "PT. Supplier Tech",
    contact_person: "Budi Vendor",
    email: "sales@suppliertech.com",
    phone: "+62 21 1234567",
    address: "Jl. Sudirman No. 123, Jakarta",
    tax_id: "01.234.567.8-901.000",
    payment_term: "Net 30",
    status: "Active",
    total_pos: 15,
    created_at: "2025-01-15",
    updated_at: "2025-12-10",
  },
  {
    id: "2",
    vendor_code: "VND-002",
    vendor_name: "CV. Indo Supplies",
    contact_person: "Siti Vendor",
    email: "contact@indosupplies.co.id",
    phone: "+62 21 7654321",
    address: "Jl. Thamrin No. 456, Jakarta",
    tax_id: "01.234.567.8-902.000",
    payment_term: "Net 45",
    status: "Active",
    total_pos: 8,
    created_at: "2025-02-20",
    updated_at: "2025-12-11",
  },
  {
    id: "3",
    vendor_code: "VND-003",
    vendor_name: "PT. Global Distributor",
    contact_person: "Ahmad Vendor",
    email: "info@globaldist.com",
    phone: "+62 21 9876543",
    address: "Jl. Gatot Subroto No. 789, Jakarta",
    tax_id: "01.234.567.8-903.000",
    payment_term: "Net 30",
    status: "Inactive",
    total_pos: 3,
    created_at: "2025-03-10",
    updated_at: "2025-11-25",
  },
];

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockVendors.filter((vendor) => {
    const matchesSearch =
      vendor.vendor_code.toLowerCase().includes(search.toLowerCase()) ||
      vendor.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      vendor.contact_person.toLowerCase().includes(search.toLowerCase()) ||
      vendor.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      vendor.status.toLowerCase() === statusFilter.toLowerCase();

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
        title="Vendor List"
        text="Manage and monitor your vendors"
      />
      <AddVendorButton />
      <VendorFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Vendors</h2>
          <VendorsTable
            vendors={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <VendorDetailDrawer
            vendor={mockVendors.find((v) => v.id === selected) || null}
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
