"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import SalesOrdersTable from "./_components/sales-orders-table";
import AddSalesOrderButton from "./_components/add-sales-order-button";
import SalesOrderFilters from "./_components/sales-order-filters";
import { useSession } from "@/contexts/session-context";
import SalesOrderDetailDrawer from "./_components/sales-order-detail-drawer";
import Pagination from "@/components/ui/pagination";
import {
  useSalesOrders,
  SalesOrder as HookSalesOrder,
} from "@/hooks/sales-orders/useSalesOrders";

// Type for components (matches existing component interfaces)
type ComponentSalesOrder = {
  id: string;
  so_no: string;
  quotation_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  items_count: number;
  total_amount: number;
  payment_term: string;
  delivery_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function SalesOrdersPage() {
  const { user } = useSession();
  const { salesOrders, loading, error } = useSalesOrders();
  const isSuperadmin = user?.role === "superadmin";

  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    saleStatus?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (newFilters: {
    search?: string;
    status?: string;
    saleStatus?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Convert hook data to component format
  const convertToComponentFormat = (
    hookData: HookSalesOrder[]
  ): ComponentSalesOrder[] => {
    return hookData.map((so) => ({
      id: so.id,
      so_no: so.sale_no,
      quotation_no: so.quotation_id || "",
      customer_name:
        so.quotation?.customer?.customer_name || "Unknown Customer",
      customer_email: so.quotation?.customer?.email || "",
      sales_pic: "Sales Person", // TODO: Add user relation
      items_count: so.sale_order_detail?.length || 0,
      total_amount: so.grand_total || 0,
      payment_term: "Net 30", // TODO: Add payment term field
      delivery_date: new Date().toISOString().split("T")[0], // TODO: Add delivery date
      status: so.sale_status || so.status || "DRAFT",
      created_at: so.created_at
        ? new Date(so.created_at).toISOString()
        : new Date().toISOString(),
      updated_at: so.created_at
        ? new Date(so.created_at).toISOString()
        : new Date().toISOString(),
    }));
  };

  // Filter & search logic
  const filteredData = salesOrders.filter((so) => {
    const searchMatch =
      !filters.search ||
      so.sale_no.toLowerCase().includes(filters.search.toLowerCase()) ||
      (so.quotation_id &&
        so.quotation_id.toLowerCase().includes(filters.search.toLowerCase()));

    const statusMatch = !filters.status || so.status === filters.status;
    const saleStatusMatch =
      !filters.saleStatus || so.sale_status === filters.saleStatus;
    const paymentStatusMatch =
      !filters.paymentStatus || so.payment_status === filters.paymentStatus;

    let dateMatch = true;
    if (filters.dateFrom || filters.dateTo) {
      const soDate = so.created_at ? new Date(so.created_at) : null;
      if (soDate) {
        if (filters.dateFrom) {
          dateMatch = dateMatch && soDate >= new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          dateMatch = dateMatch && soDate <= new Date(filters.dateTo);
        }
      }
    }

    return (
      searchMatch &&
      statusMatch &&
      saleStatusMatch &&
      paymentStatusMatch &&
      dateMatch
    );
  });

  const convertedData = convertToComponentFormat(filteredData);
  const pageSize = 10;
  const totalPages = Math.ceil(convertedData.length / pageSize);
  const pagedData = convertedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <>
        <DashboardBreadcrumb
          title="Sales Orders"
          text="Manage and monitor your sales orders"
        />
        <div className="flex justify-center items-center p-16 w-full h-full">
          <div className="flex flex-col w-full justify-center items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm text-muted-foreground">
              Loading sales orders...
            </span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardBreadcrumb
          title="Sales Orders"
          text="Manage and monitor your sales orders"
        />
        <div className="flex justify-center items-center p-16 w-full h-full">
          <div className="flex flex-col w-full justify-center items-center">
            <div className="text-red-500 text-sm mb-3">Error: {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardBreadcrumb
        title="Sales Orders"
        text="Manage and monitor your sales orders"
      />
      <SalesOrderFilters
        onFilterChange={handleFilterChange}
        filters={filters}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Sales Orders</h2>
          <SalesOrdersTable salesOrders={pagedData} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
          <SalesOrderDetailDrawer
            salesOrder={convertedData.find((so) => so.id === selected) || null}
            isOpen={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
