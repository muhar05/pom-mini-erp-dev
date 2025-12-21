"use client";

import CustomerForm from "../_components/customer-form";
import { useRouter } from "next/navigation";

export default function CustomerNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/crm/customers");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <CustomerForm
        mode="add"
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
