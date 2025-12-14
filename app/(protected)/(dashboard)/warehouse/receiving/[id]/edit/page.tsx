"use client";

import GoodsReceiptForm from "../../_components/goods-receipt-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

// Mock data - replace with actual API call
const mockGoodsReceipt = {
  id: "1",
  gr_no: "GR-001",
  po_no: "PO-001",
  vendor_name: "PT. Supplier Tech",
  receiver_name: "John Doe",
  warehouse: "Main Warehouse",
  items_count: 5,
  total_qty: 50,
  receipt_date: "2025-12-10",
  delivery_note: "DN-001",
  status: "Quality Check",
  created_at: "2025-12-10",
  updated_at: "2025-12-10",
  notes: "All items received in good condition",
};

export default function GoodsReceiptEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [goodsReceipt, setGoodsReceipt] = useState(mockGoodsReceipt);

  // TODO: Fetch goods receipt detail by id for editing
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching goods receipt for edit with id:", id);
    setGoodsReceipt({ ...mockGoodsReceipt, id: id as string });
  }, [id]);

  const handleSuccess = () => {
    router.push("/warehouse/receiving");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Goods Receipt - ${goodsReceipt.gr_no}`}
        text="Update goods receipt information"
      />
      <div className="max-w-4xl mx-auto py-8">
        <GoodsReceiptForm
          mode="edit"
          goodsReceipt={goodsReceipt}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
