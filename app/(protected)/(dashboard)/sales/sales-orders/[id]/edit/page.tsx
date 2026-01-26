"use client";

import SalesOrderForm from "../../_components/sales-order-form";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSalesOrderByIdAction } from "@/app/actions/sales-orders";
import LoadingSkeleton from "@/components/loading-skeleton";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";

type SalesOrder = {
  id?: string;
  sale_no: string;
  customer_id?: string | null;
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
  payment_term_id?: number | null;
  created_at?: Date | null;
  sale_order_detail?: any[];
};

export default function SalesOrderEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesOrder = async () => {
      try {
        setLoading(true);
        const data = await getSalesOrderByIdAction(id as string);

        const formattedSalesOrder: SalesOrder = {
          ...data,
          id: data.id,
          sale_no: data.sale_no,
          customer_id: data.customer_id ? data.customer_id.toString() : null,
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
          payment_term_id: data.payment_term_id,
          created_at: data.created_at ? new Date(data.created_at) : null,
          sale_order_detail: data.sale_order_detail,
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
    router.push("/sales/sales-orders");
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

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Sales Order ${salesOrder.sale_no}`}
        text="Update sales order information - all fields are editable"
      />
      <div className="w-full mx-auto py-8">
        <SalesOrderForm
          mode="edit"
          salesOrder={salesOrder}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
