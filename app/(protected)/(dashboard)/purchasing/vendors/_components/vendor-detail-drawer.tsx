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
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import VendorRelatedData from "./vendor-related-data";

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

interface VendorDetailDrawerProps {
  vendor: Vendor | null;
  open: boolean;
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
      return "bg-blue-100 text-blue-800";
  }
}

export default function VendorDetailDrawer({
  vendor,
  open,
  onClose,
  onEdit,
  onDelete,
}: VendorDetailDrawerProps) {
  if (!vendor) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">
                {vendor.vendor_name}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                {vendor.vendor_code}
              </SheetDescription>
            </div>
            <Badge className={getStatusBadgeClass(vendor.status)}>
              {vendor.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link href={`/purchasing/vendors/${vendor.id}/edit`}>
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
          <Link href={`/purchasing/purchase-orders/new?vendor_id=${vendor.id}`}>
            <Button
              size="sm"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <ShoppingCart className="w-4 h-4" />
              Create PO
            </Button>
          </Link>
        </div>

        {/* Vendor Information */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Vendor Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Vendor Code</p>
                  <p className="font-medium">{vendor.vendor_code}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Vendor Name</p>
                  <p className="font-medium">{vendor.vendor_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">{vendor.contact_person}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{vendor.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{vendor.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{vendor.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Tax ID (NPWP)</p>
                  <p className="font-medium">{vendor.tax_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Payment Term</p>
                  <p className="font-medium">{vendor.payment_term}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Purchase Orders</p>
                  <p className="font-medium">{vendor.total_pos} POs</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{formatDate(vendor.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(vendor.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Data */}
          <VendorRelatedData vendorId={vendor.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
