"use client";

import { useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import SalesOrderForm from "../_components/sales-order-form";

export default function SalesOrderNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/crm/sales-orders");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title="Create Sales Order"
        text="Create a new sales order manually or from existing quotation"
      />

      <SalesOrderForm
        mode="add"
        onSuccess={handleSuccess}
        onClose={handleClose}
      />
    </>
  );
}
