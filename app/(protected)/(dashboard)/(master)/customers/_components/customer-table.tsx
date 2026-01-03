"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomerActions from "./customer-actions";
import CustomerDetailDrawer from "./customer-detail-drawer";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";
import type { customers } from "@/types/models";

// Extend customers type for UI-only fields if needed
type Customer = customers & {
  status?: string | null;
  customer_type?: string | null;
  contact_person?: string | null;
  city?: string | null;
  country?: string | null;
  updated_at?: string | Date | null;
};

// Props
interface CustomersTableProps {
  customers: Customer[];
  filters?: any;
  onDeleteSuccess?: () => void; // Tambahkan prop ini
}

// Helper function to get status badge styling
function getStatusBadgeClass(status?: string | null): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "suspended":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getTypeBadgeClass(type?: string | null): string {
  switch (type?.toLowerCase()) {
    case "corporate":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "sme":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "individual":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function CustomersTable({
  customers,
  filters,
  onDeleteSuccess,
}: CustomersTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCustomer(null);
  };

  // Optional: filter data di sini jika ingin filter di client
  let filteredCustomers = customers;
  if (filters) {
    if (filters.search) {
      filteredCustomers = filteredCustomers.filter((c) =>
        c.customer_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.customer_type && filters.customer_type !== "all") {
      filteredCustomers = filteredCustomers.filter(
        (c) => c.type?.toLowerCase() === filters.customer_type.toLowerCase()
      );
    }
    if (filters.status && filters.status !== "all") {
      filteredCustomers = filteredCustomers.filter(
        (c) => c.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.map((customer, idx) => (
            <TableRow
              key={customer.id}
              onClick={() => handleRowClick(customer)}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <TableCell>{idx + 1}</TableCell>
              <TableCell className="font-medium">
                {customer.customer_name}
              </TableCell>
              <TableCell>{customer.email || "-"}</TableCell>
              <TableCell>{customer.phone || "-"}</TableCell>
              <TableCell>
                {typeof customer.company === "object"
                  ? customer.company?.company_name || "-"
                  : customer.company || "-"}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeClass(
                    customer.type
                  )}`}
                >
                  {customer.type || "-"}
                </span>
              </TableCell>
              <TableCell>
                {customer.created_at
                  ? formatDate(
                      typeof customer.created_at === "string"
                        ? customer.created_at
                        : customer.created_at instanceof Date
                        ? customer.created_at.toISOString()
                        : String(customer.created_at)
                    )
                  : "-"}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <CustomerActions
                  customer={customer}
                  onEdit={() => {}}
                  onDelete={onDeleteSuccess} // Teruskan ke CustomerActions
                />
              </TableCell>
            </TableRow>
          ))}
          {filteredCustomers.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                No customers found.
                <a
                  href="/crm/customers/new"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Create your first customer
                </a>
                .
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
