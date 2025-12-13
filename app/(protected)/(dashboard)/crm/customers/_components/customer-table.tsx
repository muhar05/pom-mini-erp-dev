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

type Customer = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  company: string;
  contact_person: string;
  address: string;
  city: string;
  country: string;
  customer_type: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface CustomersTableProps {
  customers: Customer[];
}

// Helper function to get status badge styling
function getStatusBadgeClass(status: string): string {
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

function getTypeBadgeClass(type: string): string {
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

export default function CustomersTable({ customers }: CustomersTableProps) {
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
            <TableHead>Contact Person</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer, idx) => (
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
              <TableCell>{customer.company || "-"}</TableCell>
              <TableCell>{customer.contact_person || "-"}</TableCell>
              <TableCell>{customer.city || "-"}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeClass(
                    customer.customer_type
                  )}`}
                >
                  {customer.customer_type}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                    customer.status
                  )}`}
                >
                  {customer.status}
                </span>
              </TableCell>
              <TableCell>{formatDate(customer.created_at)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <CustomerActions
                  customer={customer}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={11}
                className="text-center py-8 text-gray-500"
              >
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

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </>
  );
}
