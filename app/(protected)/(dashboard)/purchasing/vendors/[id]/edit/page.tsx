"use client";

import VendorForm from "../../_components/vendor-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

// Mock data - replace with actual API call
const mockVendor = {
  id: "1",
  vendor_code: "VND-001",
  vendor_name: "PT. Supplier Tech",
  contact_person: "Budi Vendor",
  email: "sales@suppliertech.com",
  phone: "+62 21 1234567",
  address: "Jl. Sudirman No. 123, Jakarta",
  tax_id: "01.234.567.8-901.000",
  payment_term: "Net 30",
  status: "Active",
  notes: "Preferred vendor for tech supplies",
};

export default function VendorEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState(mockVendor);

  // TODO: Fetch vendor detail by id for editing
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching vendor for edit with id:", id);
    setVendor({ ...mockVendor, id: id as string });
  }, [id]);

  const handleSuccess = () => {
    router.push("/purchasing/vendors");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Vendor - ${vendor.vendor_name}`}
        text="Update vendor information"
      />
      <div className="max-w-4xl mx-auto py-8">
        <VendorForm
          mode="edit"
          vendor={vendor}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
