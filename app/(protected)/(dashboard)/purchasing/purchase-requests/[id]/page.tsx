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
  Calendar,
  Package,
  DollarSign,
  Building2,
  ShoppingCart,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import PurchaseRequestRelatedData from "../_components/purchase-request-related-data";

// Mock data - replace with actual API call
const mockPurchaseRequest = {
  id: "1",
  pr_no: "PR-001",
  so_no: "SO-001",
  requested_by: "John Doe",
  department: "Sales",
  items_count: 5,
  total_amount: 25000000,
  request_date: "2025-12-10",
  required_date: "2025-12-20",
  status: "Approved",
  created_at: "2025-12-10",
  updated_at: "2025-12-10",
  notes: "Urgent request for customer order",
};

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "converted to po":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

export default function PurchaseRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [purchaseRequest, setPurchaseRequest] = useState(mockPurchaseRequest);

  // TODO: Fetch purchase request detail by id
  useEffect(() => {
    // Replace with actual API call
    console.log("Fetching purchase request with id:", id);
    setPurchaseRequest({ ...mockPurchaseRequest, id: id as string });
  }, [id]);

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete purchase request:", id);
    router.push("/purchasing/purchase-requests");
  };

  const canConvertToPO = purchaseRequest.status.toLowerCase() === "approved";

  return (
    <>
      <DashboardBreadcrumb
        title={`Purchase Request - ${purchaseRequest.pr_no}`}
        text="View purchase request details"
      />
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {purchaseRequest.pr_no}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Purchase Request Details
                </p>
              </div>
              <Badge className={getStatusBadgeClass(purchaseRequest.status)}>
                {purchaseRequest.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Action Buttons */}
            <div className="flex gap-2 mb-6 pb-6 border-b">
              <Link
                href={`/purchasing/purchase-requests/${purchaseRequest.id}/edit`}
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
              {canConvertToPO && (
                <Link
                  href={`/purchasing/purchase-orders/new?pr_id=${purchaseRequest.id}`}
                >
                  <Button
                    size="sm"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Create PO
                  </Button>
                </Link>
              )}
            </div>

            {/* Request Information */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Request Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">PR Number</p>
                      <p className="font-medium">{purchaseRequest.pr_no}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">SO Reference</p>
                      <Link
                        href={`/crm/sales-orders/${purchaseRequest.so_no}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {purchaseRequest.so_no}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Requested By</p>
                      <p className="font-medium">
                        {purchaseRequest.requested_by}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">
                        {purchaseRequest.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Total Items</p>
                      <p className="font-medium">
                        {purchaseRequest.items_count} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium text-lg">
                        {purchaseRequest.total_amount.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Request Date</p>
                      <p className="font-medium">
                        {formatDate(purchaseRequest.request_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Required Date</p>
                      <p className="font-medium">
                        {formatDate(purchaseRequest.required_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {purchaseRequest.notes && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Notes</h3>
                  <p className="text-gray-700">{purchaseRequest.notes}</p>
                </div>
              )}

              {/* Related Data */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Related Data</h3>
                <PurchaseRequestRelatedData
                  purchaseRequestId={purchaseRequest.id}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
