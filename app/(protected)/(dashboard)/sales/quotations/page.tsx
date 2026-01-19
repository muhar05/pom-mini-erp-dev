"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import QuotationsTable from "./_components/quotations-table";
import QuotationFilters from "./_components/quotation-filters";
import { useQuotations } from "@/hooks/quotations/useQuotations";
import { Button } from "@/components/ui/button";

export default function QuotationsPage() {
  const { quotations, loading, refetch } = useQuotations(); // Gunakan refetch
  const [search, setSearch] = useState("");

  // Filter quotations berdasarkan search
  const filteredQuotations = quotations.filter(
    (q: any) =>
      q.quotation_no?.toLowerCase().includes(search.toLowerCase()) ||
      q.customer_name?.toLowerCase().includes(search.toLowerCase()),
  );

  // Setelah filter
  const mappedQuotations = filteredQuotations.map((q: any) => ({
    ...q,
    grand_total: q.grand_total ?? q.total_amount ?? 0,
    total_amount: q.grand_total ?? q.total_amount ?? 0,
  }));

  return (
    <>
      <DashboardBreadcrumb
        title="Quotations"
        text="Manage and monitor your sales quotations"
      />
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={() =>
            (window.location.href = "/sales/quotations/term-of-payment")
          }
        >
          Term of Payment
        </Button>
      </div>
      <QuotationFilters search={search} setSearch={setSearch} />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Quotations</h2>
          {loading ? (
            <div className="flex justify-center items-center p-16 w-full h-full">
              <div className="flex flex-col w-full justify-center items-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            </div>
          ) : (
            <QuotationsTable
              quotations={mappedQuotations}
              onRefresh={refetch} // Pass refetch function
            />
          )}
        </div>
      </div>
    </>
  );
}
