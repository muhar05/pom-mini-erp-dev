"use client";

import CustomerForm from "../../_components/customer-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Mock data - replace with actual API call
const mockCustomer = {
  id: "1",
  customer_name: "PT. ABC Technology",
  email: "contact@abctech.com",
  phone: "+62-21-1234567",
  company: "PT. ABC Technology",
  contact_person: "John Doe",
  address: "Jl. Sudirman No. 123",
  city: "Jakarta",
  country: "Indonesia",
  customer_type: "Corporate",
  status: "active",
  created_at: "2025-12-01",
  updated_at: "2025-12-13",
};

export default function CustomerEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(mockCustomer);

  // TODO: Fetch customer detail by id for editing
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching customer for edit with id:", id);
    setCustomer({ ...mockCustomer, id: id as string });
  }, [id]);

  const handleSuccess = () => {
    router.push("/crm/customers");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <CustomerForm
        mode="edit"
        customer={customer}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
