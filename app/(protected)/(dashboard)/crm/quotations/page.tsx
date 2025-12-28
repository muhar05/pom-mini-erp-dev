"use client";

import React, { useEffect, useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import QuotationsTable from "./_components/quotations-table";
import QuotationFilters from "./_components/quotation-filters";
import AddQuotationButton from "./_components/add-quotation-button";
import { useQuotations } from "@/hooks/quotations/useQuotations";

export default function QuotationsPage() {
  const { quotations, loading, setQuotations } = useQuotations();
  const [search, setSearch] = useState(""); // Tambahkan state search

  console.log("All Quotations:", quotations); 

  // Filter quotations berdasarkan search (opsional)
  const filteredQuotations = quotations.filter(
    (q: any) =>
      q.quotation_no?.toLowerCase().includes(search.toLowerCase()) ||
      q.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

   console.log("Filtered Quotations:", filteredQuotations);

  return (
    <>
      <DashboardBreadcrumb
        title="Quotations"
        text="Manage and monitor your sales quotations"
      />
      <QuotationFilters search={search} setSearch={setSearch} />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <AddQuotationButton />
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
            <QuotationsTable quotations={filteredQuotations} />
          )}
        </div>
      </div>
    </>
  );
}
