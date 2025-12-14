"use client";

import StockReservationForm from "../../_components/stock-reservation-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

// Mock data - replace with actual API call
const mockStockReservation = {
  id: "1",
  sr_no: "SR-001",
  so_no: "SO-001",
  customer_name: "PT. ABC Technology",
  reserved_by: "John Doe",
  warehouse: "Main Warehouse",
  items_count: 5,
  total_qty: 25,
  reservation_date: "2025-12-10",
  expiry_date: "2025-12-20",
  status: "Reserved",
  created_at: "2025-12-10",
  updated_at: "2025-12-10",
  notes: "Urgent reservation for priority customer",
};

export default function StockReservationEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [stockReservation, setStockReservation] =
    useState(mockStockReservation);

  // TODO: Fetch stock reservation detail by id for editing
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching stock reservation for edit with id:", id);
    setStockReservation({ ...mockStockReservation, id: id as string });
  }, [id]);

  const handleSuccess = () => {
    router.push("/warehouse/reservations");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Stock Reservation - ${stockReservation.sr_no}`}
        text="Update stock reservation information"
      />
      <div className="max-w-4xl mx-auto py-8">
        <StockReservationForm
          mode="edit"
          stockReservation={stockReservation}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
