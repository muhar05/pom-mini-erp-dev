"use client";

import PurchaseRequestForm from "../_components/purchase-request-form";
import { useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function PurchaseRequestNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/purchasing/purchase-requests");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title="Create Purchase Request"
        text="Create a new purchase request from sales order"
      />
      <div className="max-w-4xl mx-auto py-8">
        <PurchaseRequestForm
          mode="add"
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
