"use client";

import { useParams, useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import DeliveryRequestDetailDrawer from "../_components/delivery-request-detail-drawer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

export default function DeliveryRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const handleBack = () => {
    router.push("/warehouse/delivery/requests");
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Delivery Request ${mockDeliveryRequest.dr_no}`}
        text="View delivery request details"
      />

      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <DeliveryRequestDetailDrawer
          deliveryRequest={mockDeliveryRequest}
          open={true}
          onClose={() => {}}
        />
      </div>
    </>
  );
}
