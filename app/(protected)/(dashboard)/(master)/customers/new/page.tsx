"use client";

import CustomerForm from "../_components/customer-form";
import { useRouter } from "next/navigation";

export default function CustomerNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/customers");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="w-full mx-auto py-8">
      <CustomerForm
        mode="add"
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
