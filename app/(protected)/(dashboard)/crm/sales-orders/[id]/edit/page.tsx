"use client";

import SalesOrderLimitedEditForm from "../../_components/sales-order-limited-edit-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSalesOrderByIdAction } from "@/app/actions/sales-orders";
import LoadingSkeleton from "@/components/loading-skeleton";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { getSalesOrderPermissions } from "@/utils/salesOrderPermissions";
import { useSession } from "@/contexts/session-context";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type SalesOrder = {
  id?: string;
  sale_no: string;
  quotation_id?: string | null;
  total?: number | null;
  discount?: number | null;
  shipping?: number | null;
  tax?: number | null;
  grand_total?: number | null;
  status?: string | null;
  sale_status?: string | null;
  note?: string | null;
  payment_status?: string | null;
  file_po_customer?: string | null;
  created_at?: Date | null;
};

export default function SalesOrderEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useSession();
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesOrder = async () => {
      try {
        setLoading(true);
        const data = await getSalesOrderByIdAction(id as string);

        const formattedSalesOrder: SalesOrder = {
          id: data.id,
          sale_no: data.sale_no,
          quotation_id: data.quotation_id ? data.quotation_id.toString() : null,
          total: data.total,
          discount: data.discount,
          shipping: data.shipping,
          tax: data.tax,
          grand_total: data.grand_total,
          status: data.status,
          sale_status: data.sale_status,
          note: data.note,
          payment_status: data.payment_status,
          file_po_customer: data.file_po_customer,
          created_at: data.created_at ? new Date(data.created_at) : null,
        };

        setSalesOrder(formattedSalesOrder);
      } catch (err) {
        console.error("Error fetching sales order:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch sales order"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSalesOrder();
    }
  }, [id]);

  const handleSuccess = () => {
    router.push("/crm/sales-orders");
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <>
        <DashboardBreadcrumb
          title="Edit Sales Order"
          text="Update sales order information"
        />
        <LoadingSkeleton />
      </>
    );
  }

  if (error || !salesOrder) {
    return (
      <>
        <DashboardBreadcrumb
          title="Edit Sales Order"
          text="Update sales order information"
        />
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {error || "Sales order not found"}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Check permissions
  const permissions = getSalesOrderPermissions(salesOrder, user);

  if (permissions.editableFields.length === 0) {
    return (
      <>
        <DashboardBreadcrumb
          title="Edit Sales Order"
          text="Update sales order information"
        />
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Editable Fields
            </h2>
            <div className="text-gray-600 space-y-2 mb-6">
              <p>
                This Sales Order cannot be edited based on its current status:
                <span className="font-semibold">
                  {" "}
                  {salesOrder.sale_status || salesOrder.status}
                </span>
              </p>
              <p className="text-sm">
                Sales Orders have limited editing capabilities to maintain data
                integrity and follow the business process flow.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose}>
                Back
              </Button>
              <Button
                onClick={() =>
                  router.push(`/crm/sales-orders/${salesOrder.id}`)
                }
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Sales Order ${salesOrder.sale_no}`}
        text="Update allowed fields based on current status"
      />
      <div className="max-w-4xl mx-auto py-8">
        <SalesOrderLimitedEditForm
          salesOrder={salesOrder}
          permissions={permissions}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
