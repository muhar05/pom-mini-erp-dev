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
  Calendar,
  Package,
  DollarSign,
  Building2,
  CreditCard,
  Truck,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import PurchaseOrderRelatedData from "../_components/purchase-order-related-data";

// Mock data - replace with actual API call
const mockPurchaseOrder = {
  id: "1",
  po_no: "PO-001",
  pr_no: "PR-001",
  vendor_name: "PT. Supplier Tech",
  vendor_email: "sales@suppliertech.com",
  contact_person: "Budi Vendor",
  items_count: 5,
  total_amount: 25000000,
  order_date: "2025-12-13",
  delivery_date: "2025-12-25",
  payment_term: "Net 30",
  status: "Open",
  created_at: "2025-12-13",
  updated_at: "2025-12-13",
  notes: "Urgent order for customer project",
};

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "received":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [purchaseOrder, setPurchaseOrder] = useState(mockPurchaseOrder);

  // TODO: Fetch purchase order detail by id
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching purchase order with id:", id);
    setPurchaseOrder({ ...mockPurchaseOrder, id: id as string });
  }, [id]);

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete purchase order:", id);
    router.push("/purchasing/purchase-orders");
  };

  return (
    <>
      <DashboardBreadcrumb
        title={`Purchase Order - ${purchaseOrder.po_no}`}
        text="View purchase order details"
      />
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {purchaseOrder.po_no}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Purchase Order Details
                </p>
              </div>
              <Badge className={getStatusBadgeClass(purchaseOrder.status)}>
                {purchaseOrder.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Action Buttons */}
            <div className="flex gap-2 mb-6 pb-6 border-b">
              <Link
                href={`/purchasing/purchase-orders/${purchaseOrder.id}/edit`}
              >
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
            </div>

            {/* Order Information */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Order Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">PO Number</p>
                      <p className="font-medium">{purchaseOrder.po_no}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">PR Reference</p>
                      <Link
                        href={`/purchasing/purchase-requests/${purchaseOrder.pr_no}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {purchaseOrder.pr_no}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Vendor Name</p>
                      <p className="font-medium">{purchaseOrder.vendor_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Vendor Email</p>
                      <p className="font-medium">
                        {purchaseOrder.vendor_email || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">
                        {purchaseOrder.contact_person || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Total Items</p>
                      <p className="font-medium">
                        {purchaseOrder.items_count} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium text-lg">
                        {purchaseOrder.total_amount.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Term</p>
                      <p className="font-medium">
                        {purchaseOrder.payment_term || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium">
                        {formatDate(purchaseOrder.order_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Delivery Date</p>
                      <p className="font-medium">
                        {formatDate(purchaseOrder.delivery_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {purchaseOrder.notes && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Notes</h3>
                  <p className="text-gray-700">{purchaseOrder.notes}</p>
                </div>
              )}

              {/* Related Data */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Related Data</h3>
                <PurchaseOrderRelatedData purchaseOrderId={purchaseOrder.id} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
