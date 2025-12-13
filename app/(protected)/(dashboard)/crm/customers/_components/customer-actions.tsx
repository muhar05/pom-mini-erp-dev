"use client";

import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import CustomerDeleteDialog from "./customer-delete-dialog";

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

interface CustomerActionsProps {
  customer: Customer;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CustomerActions({
  customer,
  onEdit,
  onDelete,
}: CustomerActionsProps) {
  return (
    <div className="flex gap-2">
      {/* View */}
      <Link href={`/crm/customers/${customer.id}`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </Link>

      {/* Edit */}
      <Link href={`/crm/customers/${customer.id}/edit`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </Link>

      {/* Delete */}
      <CustomerDeleteDialog
        customer={customer}
        trigger={
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        }
        onDelete={() => onDelete?.()}
      />
    </div>
  );
}
