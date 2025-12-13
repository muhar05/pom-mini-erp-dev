"use client";

import CustomerDetailDrawer from "../_components/customer-detail-drawer";
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

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(mockCustomer);

  // TODO: Fetch customer detail by id
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching customer with id:", id);
    setCustomer({ ...mockCustomer, id: id as string });
  }, [id]);

  const handleClose = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/crm/customers/${id}/edit`);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete customer:", id);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Customer Detail</h1>
      <CustomerDetailDrawer
        customer={customer}
        isOpen={true}
        onClose={handleClose}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
