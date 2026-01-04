"use client";

import SalesOrderForm from "../_components/sales-order-form";
import { useRouter } from "next/navigation";

export default function SalesOrderNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/crm/sales-orders");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="w-full mx-auto py-8">
      <SalesOrderForm
        mode="add"
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
