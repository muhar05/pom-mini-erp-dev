"use client";

import React, { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import PaymentScheduleTable from "./_components/payment-schedule-table";
import PaymentScheduleFilters from "./_components/payment-schedule-filters";
import PaymentScheduleDetailDrawer from "./_components/payment-schedule-detail-drawer";
import Pagination from "@/components/ui/pagination";

// Mock data for payment schedules derived from invoices
const mockPaymentSchedules = [
  {
    id: "1",
    invoice_no: "INV-001",
    invoice_id: "1",
    customer_name: "PT. Client Technology",
    customer_email: "finance@clienttech.com",
    amount_due: 27000000,
    due_date: "2025-12-25",
    payment_status: "Pending",
    days_overdue: 0,
    invoice_date: "2025-12-10",
    payment_term: "Net 15",
    notes: "Payment due in 9 days",
    created_at: "2025-12-10",
    updated_at: "2025-12-15",
  },
  {
    id: "2",
    invoice_no: "INV-002",
    invoice_id: "2",
    customer_name: "CV. Digital Solutions",
    customer_email: "accounting@digitalsol.id",
    amount_due: 16500000,
    due_date: "2025-12-26",
    payment_status: "Unpaid",
    days_overdue: 0,
    invoice_date: "2025-12-11",
    payment_term: "Net 15",
    notes: "Payment due in 10 days",
    created_at: "2025-12-11",
    updated_at: "2025-12-15",
  },
  {
    id: "3",
    invoice_no: "INV-003",
    invoice_id: "3",
    customer_name: "PT. Business Corp",
    customer_email: "finance@businesscorp.id",
    amount_due: 12000000,
    due_date: "2025-12-20",
    payment_status: "Overdue",
    days_overdue: 5,
    invoice_date: "2025-12-05",
    payment_term: "Net 15",
    notes: "Payment overdue by 5 days",
    created_at: "2025-12-05",
    updated_at: "2025-12-15",
  },
  {
    id: "4",
    invoice_no: "INV-004",
    invoice_id: "4",
    customer_name: "CV. Startup Hub",
    customer_email: "admin@startuphub.co.id",
    amount_due: 8500000,
    due_date: "2025-12-28",
    payment_status: "Pending",
    days_overdue: 0,
    invoice_date: "2025-12-13",
    payment_term: "Net 15",
    notes: "Payment due in 12 days",
    created_at: "2025-12-13",
    updated_at: "2025-12-15",
  },
  {
    id: "5",
    invoice_no: "INV-005",
    invoice_id: "5",
    customer_name: "PT. Enterprise Solutions",
    customer_email: "billing@enterprisesol.com",
    amount_due: 35000000,
    due_date: "2025-12-18",
    payment_status: "Overdue",
    days_overdue: 7,
    invoice_date: "2025-12-03",
    payment_term: "Net 15",
    notes: "Payment overdue by 7 days - follow up required",
    created_at: "2025-12-03",
    updated_at: "2025-12-15",
  },
  {
    id: "6",
    invoice_no: "INV-006",
    invoice_id: "6",
    customer_name: "CV. Creative Agency",
    customer_email: "finance@creativeagency.id",
    amount_due: 22000000,
    due_date: "2025-12-30",
    payment_status: "Pending",
    days_overdue: 0,
    invoice_date: "2025-12-15",
    payment_term: "Net 15",
    notes: "Payment due in 14 days",
    created_at: "2025-12-15",
    updated_at: "2025-12-15",
  },
];

export default function PaymentSchedulePage() {
  const [search, setSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [dueDateFilter, setDueDateFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & search logic
  const filteredData = mockPaymentSchedules.filter((schedule) => {
    const matchesSearch =
      schedule.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      schedule.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      schedule.customer_email.toLowerCase().includes(search.toLowerCase());

    const matchesPaymentStatus =
      paymentStatusFilter === "all" ||
      schedule.payment_status.toLowerCase() ===
        paymentStatusFilter.toLowerCase();

    let matchesDueDate = true;
    if (dueDateFilter !== "all") {
      const today = new Date();
      const dueDate = new Date(schedule.due_date);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (dueDateFilter) {
        case "overdue":
          matchesDueDate = diffDays < 0;
          break;
        case "today":
          matchesDueDate = diffDays === 0;
          break;
        case "this-week":
          matchesDueDate = diffDays >= 0 && diffDays <= 7;
          break;
        case "this-month":
          matchesDueDate = diffDays >= 0 && diffDays <= 30;
          break;
        default:
          matchesDueDate = true;
      }
    }

    return matchesSearch && matchesPaymentStatus && matchesDueDate;
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
        title="Payment Schedule"
        text="Monitor payment schedules and due dates from invoices"
      />
      <PaymentScheduleFilters
        search={search}
        setSearch={setSearch}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        dueDateFilter={dueDateFilter}
        setDueDateFilter={setDueDateFilter}
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Schedules</h2>
          <PaymentScheduleTable
            paymentSchedules={pagedData}
            onRowClick={(id: string) => setSelected(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <PaymentScheduleDetailDrawer
            paymentSchedule={
              mockPaymentSchedules.find(
                (schedule) => schedule.id === selected
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
