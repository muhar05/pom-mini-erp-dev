"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import InvoicesTable from "./_components/invoices-table";
import AddInvoiceButton from "./_components/add-invoice-button";
import InvoiceFilters from "./_components/invoice-filters";
import InvoiceDetailDrawer from "./_components/invoice-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for now - replace with actual API call
const mockInvoices = [
  {
    id: "1",
    invoice_no: "INV-001",
    sales_order_no: "SO-001",
    customer_name: "PT. Client Technology",
    customer_email: "finance@clienttech.com",
    billing_address: "Jl. Sudirman No. 123, Jakarta",
    items_count: 5,
    subtotal: 25000000,
    tax_amount: 2500000,
    discount_amount: 500000,
    total_amount: 27000000,
    invoice_date: "2025-12-10",
    due_date: "2025-12-25",
    payment_term: "Net 15",
    status: "Sent",
    payment_status: "Pending",
    notes: "Please process payment by due date",
    created_at: "2025-12-10",
    updated_at: "2025-12-10",
  },
  {
    id: "2",
    invoice_no: "INV-002",
    sales_order_no: "SO-002",
    customer_name: "CV. Digital Solutions",
    customer_email: "accounting@digitalsol.id",
    billing_address: "Jl. Gatot Subroto No. 456, Jakarta",
    items_count: 3,
    subtotal: 15000000,
    tax_amount: 1500000,
    discount_amount: 0,
    total_amount: 16500000,
    invoice_date: "2025-12-11",
    due_date: "2025-12-26",
    payment_term: "Net 15",
    status: "Draft",
    payment_status: "Unpaid",
    notes: "Draft invoice - review before sending",
    created_at: "2025-12-11",
    updated_at: "2025-12-12",
  },
  {
    id: "3",
    invoice_no: "INV-003",
    sales_order_no: "SO-003",
    customer_name: "PT. Global Enterprise",
    customer_email: "finance@globalent.com",
    billing_address: "Jl. Thamrin No. 789, Jakarta",
    items_count: 8,
    subtotal: 40000000,
    tax_amount: 4000000,
    discount_amount: 1000000,
    total_amount: 43000000,
    invoice_date: "2025-12-12",
    due_date: "2025-12-27",
    payment_term: "Net 15",
    status: "Sent",
    payment_status: "Paid",
    notes: "Payment received on time",
    created_at: "2025-12-12",
    updated_at: "2025-12-13",
  },
  {
    id: "4",
    invoice_no: "INV-004",
    sales_order_no: "SO-004",
    customer_name: "PT. Innovation Hub",
    customer_email: "billing@innovhub.id",
    billing_address: "Jl. Kuningan No. 321, Jakarta",
    items_count: 2,
    subtotal: 12000000,
    tax_amount: 1200000,
    discount_amount: 200000,
    total_amount: 13000000,
    invoice_date: "2025-12-13",
    due_date: "2025-12-28",
    payment_term: "Net 15",
    status: "Sent",
    payment_status: "Overdue",
    notes: "Follow up required for payment",
    created_at: "2025-12-13",
    updated_at: "2025-12-14",
  },
];

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      invoice.sales_order_no.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer_email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      invoice.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPaymentStatus =
      paymentStatusFilter === "all" ||
      invoice.payment_status.toLowerCase() ===
        paymentStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPaymentStatus;
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
        title="Invoice"
        text="Manage customer invoices and billing"
      />
      <AddInvoiceButton />
      <InvoiceFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Invoices</h2>
          <InvoicesTable
            invoices={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <InvoiceDetailDrawer
            invoice={
              mockInvoices.find((invoice) => invoice.id === selected) || null
            }
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
