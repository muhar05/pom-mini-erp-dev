"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import CustomerRelatedData from "./customer-related-data";

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

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getTypeBadgeClass(type: string): string {
  switch (type?.toLowerCase()) {
    case "corporate":
      return "bg-blue-100 text-blue-800";
    case "sme":
      return "bg-purple-100 text-purple-800";
    case "individual":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function CustomerDetailDrawer({
  customer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CustomerDetailDrawerProps) {
  if (!customer) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {customer.customer_name}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                Customer Details
              </SheetDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusBadgeClass(customer.status)}>
                {customer.status}
              </Badge>
              <Badge className={getTypeBadgeClass(customer.customer_type)}>
                {customer.customer_type}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link href={`/crm/customers/${customer.id}/edit`}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>

        {/* Customer Information */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{customer.company || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">
                    {customer.contact_person || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{customer.email || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{customer.phone || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {customer.address
                      ? `${customer.address}, ${customer.city}, ${customer.country}`
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {formatDate(customer.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Data */}
          <CustomerRelatedData customerId={customer.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
