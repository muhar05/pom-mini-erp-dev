import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import CustomersTable from "./_components/customer-table";
import AddCustomerButton from "./_components/add-customer-button";
import CustomerFilters from "./_components/customer-filters";

// Mock data for now - replace with actual API call
const mockCustomers = [
  {
    id: "1",
    customer_name: "PT. ABC Technology",
    email: "contact@abctech.com",
    phone: "+62-21-1234567",
    company: "PT. ABC Technology",
    contact_person: "John Doe",
    address: "Jakarta Selatan",
    city: "Jakarta",
    country: "Indonesia",
    customer_type: "Corporate",
    status: "active",
    created_at: "2025-12-01",
    updated_at: "2025-12-13",
  },
  {
    id: "2",
    customer_name: "CV. Digital Solutions",
    email: "info@digitalsol.co.id",
    phone: "+62-812-3456789",
    company: "CV. Digital Solutions",
    contact_person: "Jane Smith",
    address: "Bandung",
    city: "Bandung",
    country: "Indonesia",
    customer_type: "SME",
    status: "active",
    created_at: "2025-12-05",
    updated_at: "2025-12-12",
  },
];

export default async function CustomerPage() {
  // TODO: Replace with actual API call
  // const customers = await getAllCustomersAction();
  const customers = mockCustomers;

  return (
    <>
      <DashboardBreadcrumb
        title="Customer List"
        text="Manage and monitor your customers"
      />
      <AddCustomerButton />
      <CustomerFilters />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Customers</h2>
          <CustomersTable customers={customers} />
        </div>
      </div>
    </>
  );
}
