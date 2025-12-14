"use client";

import PurchaseOrderForm from "../../_components/purchase-order-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

// Mock data - replace with actual API call
const mockPurchaseOrder = {
  id: "1",
  po_no: "PO-001",
  pr_no: "PR-001",
  vendor_name: "PT. Supplier Tech",
  vendor_email: "sales@suppliertech.com",
  contact_person: "Budi Vendor",
  items_count: 5,
  total_amount: 25000000,
  order_date: "2025-12-13",
  delivery_date: "2025-12-25",
  payment_term: "Net 30",
  status: "Open",
  created_at: "2025-12-13",
  updated_at: "2025-12-13",
  notes: "Urgent order for customer project",
};

export default function PurchaseOrderEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [purchaseOrder, setPurchaseOrder] = useState(mockPurchaseOrder);

  // TODO: Fetch purchase order detail by id for editing
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching purchase order for edit with id:", id);
    setPurchaseOrder({ ...mockPurchaseOrder, id: id as string });
  }, [id]);

  const handleSuccess = () => {
    router.push("/purchasing/purchase-orders");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Purchase Order - ${purchaseOrder.po_no}`}
        text="Update purchase order information"
      />
      <div className="max-w-4xl mx-auto py-8">
        <PurchaseOrderForm
          mode="edit"
          purchaseOrder={purchaseOrder}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}