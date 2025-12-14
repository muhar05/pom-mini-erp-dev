"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import VendorActions from "./vendor-actions";
import { formatDate } from "@/utils/formatDate";

type Vendor = {
  id: string;
  vendor_code: string;
  vendor_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  payment_term: string;
  status: string;
  total_pos: number;
  created_at: string;
  updated_at: string;
};

interface VendorsTableProps {
  vendors: Vendor[];
  onRowClick?: (id: string) => void;
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
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

export default function VendorsTable({
  vendors,
  onRowClick,
}: VendorsTableProps) {
  const handleRowClick = (id: string) => {
    if (onRowClick) {
      onRowClick(id);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Vendor Code</TableHead>
          <TableHead>Vendor Name</TableHead>
          <TableHead>Contact Person</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Payment Term</TableHead>
          <TableHead>Total POs</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendors.map((vendor, idx) => (
          <TableRow
            key={vendor.id}
            onClick={() => handleRowClick(vendor.id)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{vendor.vendor_code}</TableCell>
            <TableCell className="font-medium">{vendor.vendor_name}</TableCell>
            <TableCell>{vendor.contact_person}</TableCell>
            <TableCell>{vendor.email}</TableCell>
            <TableCell>{vendor.phone}</TableCell>
            <TableCell>{vendor.payment_term}</TableCell>
            <TableCell>{vendor.total_pos}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  vendor.status
                )}`}
              >
                {vendor.status}
              </span>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <VendorActions
                vendor={vendor}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </TableCell>
          </TableRow>
        ))}
        {vendors.length === 0 && (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
              No vendors found.
              <a
                href="/purchasing/vendors/new"
                className="text-blue-600 hover:underline ml-1"
              >
                Create your first vendor
              </a>
              .
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
