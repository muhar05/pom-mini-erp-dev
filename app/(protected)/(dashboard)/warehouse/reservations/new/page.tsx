"use client";

import StockReservationForm from "../_components/stock-reservation-form";
import { useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function StockReservationNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/warehouse/reservations");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title="Create Stock Reservation"
        text="Reserve stock for sales order"
      />
      <div className="max-w-4xl mx-auto py-8">
        <StockReservationForm
          mode="add"
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
