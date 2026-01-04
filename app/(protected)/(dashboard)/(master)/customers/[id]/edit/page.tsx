"use client";

import CustomerForm from "../../_components/customer-form";
import { useParams, useRouter } from "next/navigation";
import { useCustomerById } from "@/hooks/customers/useCustomerById";

export default function CustomerEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { customer, loading, error } = useCustomerById(id as string);

  const handleSuccess = () => {
    router.push("/customers");
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (error)
    return <div className="py-8 text-center text-red-500">{error}</div>;
  if (!customer)
    return <div className="py-8 text-center">Customer not found</div>;

  // Map API data ke tipe yang diharapkan form
  const customerFormData = {
    id: customer.id ? String(customer.id) : "",
    customer_name: customer.customer_name ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    contact_person: "", // string kosong jika tidak ada data
    status: "", // string kosong jika tidak ada data
    customer_type: customer.type ?? "",
    company_id: customer.company_id ?? customer.company?.id,
  };

  return (
    <div className="w-full mx-auto py-8">
      <CustomerForm
        mode="edit"
        customer={customerFormData}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
