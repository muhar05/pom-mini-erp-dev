"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import CustomerPaymentTable from "./_components/customer-payment-table";
import CustomerPaymentFilters from "./_components/customer-payment-filters";
import CustomerPaymentDetailDrawer from "./_components/customer-payment-datail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for customer payment status aggregated from invoices and payment schedules
const mockCustomerPayments = [
  {
    id: "1",
    customer_name: "PT. Client Technology",
    customer_email: "finance@clienttech.com",
    customer_address: "Jl. Sudirman No. 123, Jakarta",
    total_invoices: 3,
    total_amount: 75000000,
    paid_amount: 25000000,
    pending_amount: 27000000,
    overdue_amount: 23000000,
    outstanding_amount: 50000000,
    payment_status: "Partial",
    last_payment_date: "2025-12-10",
    days_since_last_payment: 6,
    average_payment_days: 18,
    created_at: "2025-11-01",
    updated_at: "2025-12-15",
    invoices: [
      {
        invoice_no: "INV-001",
        amount: 27000000,
        due_date: "2025-12-25",
        status: "Pending",
      },
      {
        invoice_no: "INV-007",
        amount: 25000000,
        due_date: "2025-12-10",
        status: "Paid",
      },
      {
        invoice_no: "INV-009",
        amount: 23000000,
        due_date: "2025-12-18",
        status: "Overdue",
      },
    ],
  },
  {
    id: "2",
    customer_name: "CV. Digital Solutions",
    customer_email: "accounting@digitalsol.id",
    customer_address: "Jl. Gatot Subroto No. 456, Jakarta",
    total_invoices: 2,
    total_amount: 31500000,
    paid_amount: 31500000,
    pending_amount: 0,
    overdue_amount: 0,
    outstanding_amount: 0,
    payment_status: "Paid",
    last_payment_date: "2025-12-14",
    days_since_last_payment: 2,
    average_payment_days: 12,
    created_at: "2025-11-15",
    updated_at: "2025-12-14",
    invoices: [
      {
        invoice_no: "INV-002",
        amount: 16500000,
        due_date: "2025-12-26",
        status: "Paid",
      },
      {
        invoice_no: "INV-008",
        amount: 15000000,
        due_date: "2025-12-14",
        status: "Paid",
      },
    ],
  },
  {
    id: "3",
    customer_name: "PT. Business Corp",
    customer_email: "finance@businesscorp.id",
    customer_address: "Jl. Thamrin No. 789, Jakarta",
    total_invoices: 4,
    total_amount: 82000000,
    paid_amount: 35000000,
    pending_amount: 22000000,
    overdue_amount: 25000000,
    outstanding_amount: 47000000,
    payment_status: "Overdue",
    last_payment_date: "2025-11-28",
    days_since_last_payment: 18,
    average_payment_days: 22,
    created_at: "2025-10-01",
    updated_at: "2025-12-15",
    invoices: [
      {
        invoice_no: "INV-003",
        amount: 12000000,
        due_date: "2025-12-20",
        status: "Overdue",
      },
      {
        invoice_no: "INV-010",
        amount: 35000000,
        due_date: "2025-11-28",
        status: "Paid",
      },
      {
        invoice_no: "INV-011",
        amount: 22000000,
        due_date: "2025-12-30",
        status: "Pending",
      },
      {
        invoice_no: "INV-012",
        amount: 13000000,
        due_date: "2025-12-15",
        status: "Overdue",
      },
    ],
  },
  {
    id: "4",
    customer_name: "CV. Startup Hub",
    customer_email: "admin@startuphub.co.id",
    customer_address: "Jl. Kuningan No. 321, Jakarta",
    total_invoices: 1,
    total_amount: 8500000,
    paid_amount: 0,
    pending_amount: 8500000,
    overdue_amount: 0,
    outstanding_amount: 8500000,
    payment_status: "Pending",
    last_payment_date: null,
    days_since_last_payment: null,
    average_payment_days: null,
    created_at: "2025-12-13",
    updated_at: "2025-12-15",
    invoices: [
      {
        invoice_no: "INV-004",
        amount: 8500000,
        due_date: "2025-12-28",
        status: "Pending",
      },
    ],
  },
  {
    id: "5",
    customer_name: "PT. Enterprise Solutions",
    customer_email: "billing@enterprisesol.com",
    customer_address: "Jl. HR Rasuna Said No. 654, Jakarta",
    total_invoices: 2,
    total_amount: 67000000,
    paid_amount: 0,
    pending_amount: 0,
    overdue_amount: 67000000,
    outstanding_amount: 67000000,
    payment_status: "Overdue",
    last_payment_date: "2025-10-15",
    days_since_last_payment: 62,
    average_payment_days: 35,
    created_at: "2025-10-01",
    updated_at: "2025-12-15",
    invoices: [
      {
        invoice_no: "INV-005",
        amount: 35000000,
        due_date: "2025-12-18",
        status: "Overdue",
      },
      {
        invoice_no: "INV-013",
        amount: 32000000,
        due_date: "2025-12-12",
        status: "Overdue",
      },
    ],
  },
  {
    id: "6",
    customer_name: "CV. Creative Agency",
    customer_email: "finance@creativeagency.id",
    customer_address: "Jl. Senopati No. 987, Jakarta",
    total_invoices: 1,
    total_amount: 22000000,
    paid_amount: 0,
    pending_amount: 22000000,
    overdue_amount: 0,
    outstanding_amount: 22000000,
    payment_status: "Pending",
    last_payment_date: "2025-11-20",
    days_since_last_payment: 26,
    average_payment_days: 15,
    created_at: "2025-12-15",
    updated_at: "2025-12-15",
    invoices: [
      {
        invoice_no: "INV-006",
        amount: 22000000,
        due_date: "2025-12-30",
        status: "Pending",
      },
    ],
  },
];

export default function CustomerPaymentPage() {
  const [search, setSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [riskLevelFilter, setRiskLevelFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockCustomerPayments.filter((customer) => {
    const matchesSearch =
      customer.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      customer.customer_email.toLowerCase().includes(search.toLowerCase());

    const matchesPaymentStatus =
      paymentStatusFilter === "all" ||
      customer.payment_status.toLowerCase() ===
        paymentStatusFilter.toLowerCase();

    let matchesRiskLevel = true;
    if (riskLevelFilter !== "all") {
      switch (riskLevelFilter) {
        case "high":
          matchesRiskLevel =
            customer.overdue_amount > 0 &&
            customer.days_since_last_payment !== null &&
            customer.days_since_last_payment > 30;
          break;
        case "medium":
          matchesRiskLevel =
            customer.overdue_amount > 0 ||
            (customer.days_since_last_payment !== null &&
              customer.days_since_last_payment > 15);
          break;
        case "low":
          matchesRiskLevel =
            customer.overdue_amount === 0 &&
            (customer.days_since_last_payment === null ||
              customer.days_since_last_payment <= 15);
          break;
        default:
          matchesRiskLevel = true;
      }
    }

    return matchesSearch && matchesPaymentStatus && matchesRiskLevel;
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
        title="Customer Payment Status"
        text="Monitor customer payment behavior and outstanding balances"
      />
      <CustomerPaymentFilters
        search={search}
        setSearch={setSearch}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        riskLevelFilter={riskLevelFilter}
        setRiskLevelFilter={setRiskLevelFilter}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Customer Payment Status
          </h2>
          <CustomerPaymentTable
            customerPayments={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <CustomerPaymentDetailDrawer
            customerPayment={
              mockCustomerPayments.find(
                (customer) => customer.id === selected
              ) || null
            }
            open={!!selected}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>
    </>
  );
}
