"use client";

import PurchaseRequestForm from "../../_components/purchase-request-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

// Mock data - replace with actual API call
const mockPurchaseRequest = {
  id: "1",
  pr_no: "PR-001",
  so_no: "SO-001",
  requested_by: "John Doe",
  department: "Sales",
  items_count: 5,
  total_amount: 25000000,
  request_date: "2025-12-10",
  required_date: "2025-12-20",
  status: "Pending",
  created_at: "2025-12-10",
  updated_at: "2025-12-10",
  notes: "Urgent request for customer order",
};

export default function PurchaseRequestEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [purchaseRequest, setPurchaseRequest] = useState(mockPurchaseRequest);

  // TODO: Fetch purchase request detail by id for editing
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching purchase request for edit with id:", id);
    setPurchaseRequest({ ...mockPurchaseRequest, id: id as string });
  }, [id]);

  const handleSuccess = () => {
    router.push("/purchasing/purchase-requests");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Purchase Request - ${purchaseRequest.pr_no}`}
        text="Update purchase request information"
      />
      <div className="max-w-4xl mx-auto py-8">
        <PurchaseRequestForm
          mode="edit"
          purchaseRequest={purchaseRequest}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
