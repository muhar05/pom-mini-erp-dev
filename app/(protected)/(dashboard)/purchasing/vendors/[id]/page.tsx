"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import VendorRelatedData from "../_components/vendor-related-data";

// Mock data - replace with actual API call
const mockVendor = {
  id: "1",
  vendor_code: "VND-001",
  vendor_name: "PT. Supplier Tech",
  contact_person: "Budi Vendor",
  email: "sales@suppliertech.com",
  phone: "+62 21 1234567",
  address: "Jl. Sudirman No. 123, Jakarta",
  tax_id: "01.234.567.8-901.000",
  payment_term: "Net 30",
  status: "Active",
  total_pos: 15,
  created_at: "2025-01-15",
  updated_at: "2025-12-10",
  notes: "Preferred vendor for tech supplies",
};

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

export default function VendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState(mockVendor);

  // TODO: Fetch vendor detail by id
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching vendor with id:", id);
    setVendor({ ...mockVendor, id: id as string });
  }, [id]);

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete vendor:", id);
    router.push("/purchasing/vendors");
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Vendor - ${vendor.vendor_name}`}
        text="View vendor details and purchase history"
      />
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {vendor.vendor_name}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {vendor.vendor_code}
                </p>
              </div>
              <Badge className={getStatusBadgeClass(vendor.status)}>
                {vendor.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
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
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
              <Link
                href={`/purchasing/purchase-orders/new?vendor_id=${vendor.id}`}
              >
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">
                  Contact Information
                </h3>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{vendor.contact_person}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{vendor.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{vendor.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{vendor.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">
                  Business Information
                </h3>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Vendor Code</p>
                    <p className="font-medium">{vendor.vendor_code}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tax ID (NPWP)</p>
                    <p className="font-medium">{vendor.tax_id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Payment Term</p>
                    <p className="font-medium">{vendor.payment_term}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShoppingCart className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Purchase Orders
                    </p>
                    <p className="font-medium">{vendor.total_pos} POs</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">
                      {formatDate(vendor.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {formatDate(vendor.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {vendor.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-2">Notes</h3>
                <p className="text-gray-600">{vendor.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Data */}
        <div className="mt-6">
          <VendorRelatedData vendorId={vendor.id} />
        </div>
      </div>
    </>
  );
}
