"use client";

import PurchaseOrderForm from "../_components/purchase-order-form";
import { useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function PurchaseOrderNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/purchasing/purchase-orders");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title="Create Purchase Order"
        text="Create a new purchase order from purchase request"
      />
      <div className="max-w-4xl mx-auto py-8">
        <PurchaseOrderForm
          mode="add"
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
