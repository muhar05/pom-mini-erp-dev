"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import PurchaseOrdersTable from "./_components/purchase-orders-table";
import AddPurchaseOrderButton from "./_components/add-purchase-order-button";
import PurchaseOrderFilters from "./_components/purchase-order-filters";
import { Input } from "@/components/ui/input";
import PurchaseOrderDetailDrawer from "./_components/purchase-order-detail-drawer";
import Pagination from "@/components/ui/pagination";

import { usePurchaseOrders } from "@/hooks/purchase-orders/usePurchaseOrders";
import { useI18n } from "@/contexts/i18n-context";

export default function PurchaseOrdersPage() {
  const { t } = useI18n();
  const { purchaseOrders, loading, refetch } = usePurchaseOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = purchaseOrders.filter((po: any) => {
    const matchesSearch =
      po.po_no?.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier?.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
      po.pr_id?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      po.status?.toLowerCase() === statusFilter.toLowerCase();

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
        title={t("page.purchasing.title")}
        text={t("page.purchasing.list")}
      />
      <AddPurchaseOrderButton onRefresh={refetch} />
      <PurchaseOrderFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{t("page.purchasing.list")}</h2>
          {loading ? (
            <div className="flex justify-center items-center p-16">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <PurchaseOrdersTable
                purchaseOrders={pagedData.map((po: any) => ({
                  ...po,
                  vendor_name: po.supplier?.supplier_name || "N/A",
                  total_amount: po.total,
                }))}
                onRowClick={(id: string) => setSelected(id)}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
          <PurchaseOrderDetailDrawer
            purchaseOrder={
              purchaseOrders.find((po: any) => po.id === selected) || null
            }
            open={!!selected}
            onClose={() => setSelected(null)}
            onRefresh={refetch}
          />
        </div>
      </div>
    </>
  );
}

