"use client";

import VendorForm from "../_components/vendor-form";
import { useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function VendorNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/purchasing/vendors");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title="Create Vendor"
        text="Add a new vendor to your purchasing system"
      />
      <div className="max-w-4xl mx-auto py-8">
        <VendorForm
          mode="add"
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
