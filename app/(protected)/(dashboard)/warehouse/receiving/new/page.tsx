"use client";

import GoodsReceiptForm from "../_components/goods-receipt-form";
import { useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function GoodsReceiptNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/warehouse/receiving");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title="Create Goods Receipt"
        text="Record incoming goods from purchase order"
      />
      <div className="max-w-4xl mx-auto py-8">
        <GoodsReceiptForm
          mode="add"
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
