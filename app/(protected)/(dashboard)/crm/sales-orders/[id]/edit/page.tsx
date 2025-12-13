"use client";

import SalesOrderForm from "../../_components/sales-order-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Mock data - replace with actual API call
const mockSalesOrder = {
  id: "1",
  so_no: "SO-001",
  quotation_no: "QT-001",
  customer_name: "PT. ABC Technology",
  customer_email: "contact@abctech.com",
  sales_pic: "John Sales",
  items_count: 3,
  total_amount: 50000000,
  payment_term: "Net 30",
  delivery_date: "2025-12-20",
  status: "Open",
  created_at: "2025-12-13",
  updated_at: "2025-12-13",
};

export default function SalesOrderEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [salesOrder, setSalesOrder] = useState(mockSalesOrder);

  // TODO: Fetch sales order detail by id for editing
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching sales order for edit with id:", id);
    setSalesOrder({ ...mockSalesOrder, id: id as string });
  }, [id]);

  const handleSuccess = () => {
    router.push("/crm/sales-orders");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <SalesOrderForm
        mode="edit"
        salesOrder={salesOrder}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
