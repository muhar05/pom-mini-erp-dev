"use client";

import { useParams, useRouter } from "next/navigation";
import DeliveryRequestForm from "../../_components/delivery-request-form";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

// Mock data - replace with actual API call
const mockDeliveryRequest = {
  id: "1",
  dr_no: "DR-001",
  so_no: "SO-001",
  sr_no: "SR-001",
  customer_name: "PT. ABC Technology",
  delivery_address: "Jl. Sudirman No. 123, Jakarta",
  requested_by: "John Doe",
  warehouse: "Main Warehouse",
  items_count: 5,
  total_qty: 25,
  request_date: "2025-12-10",
  required_date: "2025-12-15",
  delivery_type: "Standard",
  status: "Pending",
  notes: "Urgent delivery required",
  created_at: "2025-12-10",
  updated_at: "2025-12-10",
};

export default function DeliveryRequestEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const handleSuccess = () => {
    router.push("/warehouse/delivery/requests");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Delivery Request ${mockDeliveryRequest.dr_no}`}
        text="Update delivery request information"
      />
      <div className="max-w-4xl mx-auto py-8">
        <DeliveryRequestForm
          deliveryRequest={mockDeliveryRequest}
          mode="edit"
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
