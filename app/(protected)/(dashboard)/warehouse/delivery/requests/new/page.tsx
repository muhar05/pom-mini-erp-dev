"use client";

import DeliveryRequestForm from "../_components/delivery-request-form";
import { useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function DeliveryRequestNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/warehouse/delivery/requests");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title="Create Delivery Request"
        text="Create new delivery request for sales order"
      />
      <div className="max-w-4xl mx-auto py-8">
        <DeliveryRequestForm
          mode="add"
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
