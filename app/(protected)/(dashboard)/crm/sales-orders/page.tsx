"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import SalesOrdersTable from "./_components/sales-orders-table";
import SalesOrderFilters from "./_components/sales-order-filters";
import SalesOrderDetailDrawer from "./_components/sales-order-detail-drawer";
import LoadingSkeleton from "@/components/loading-skeleton";
import Pagination from "@/components/ui/pagination";
import { useSalesOrders } from "@/hooks/sales-orders/useSalesOrders";
import { useSession } from "@/contexts/session-context";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Type for hook data (from useSalesOrders)
interface HookSalesOrder {
  id: string;
  sale_no: string;
  quotation_id?: string | null;
  total?: number | null;
  discount?: number | null;
  shipping?: number | null;
  tax?: number | null;
  grand_total?: number | null;
  status?: string | null;
  sale_status?: string | null;
  payment_status?: string | null;
  file_po_customer?: string | null;
  created_at?: Date | null;
  quotation?: {
    id: number;
    quotation_no: string;
    customer?: {
      id: number;
      customer_name: string;
      email?: string | null;
    } | null;
  } | null;
  sale_order_detail?: Array<{
    id: string;
    product_name: string;
    qty: number;
  }> | null;
}

// Type for components (matches existing component interfaces)
type ComponentSalesOrder = {
  id: string;
  so_no: string;
  quotation_no: string;
  quotation_id?: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  items_count: number;
  total_amount: number;
  payment_term: string;
  delivery_date: string;
  status: string;
  sale_status?: string;
  payment_status?: string;
  created_at: string;
  updated_at: string;
};

export default function SalesOrdersPage() {
  const { user } = useSession();
  const { salesOrders, loading, error, refresh } = useSalesOrders();
  const isSuperadmin = user?.role === "superadmin";

  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    saleStatus?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (newFilters: {
    search?: string;
    status?: string;
    saleStatus?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Convert hook data to component format
  const convertToComponentFormat = (
    hookData: HookSalesOrder[]
  ): ComponentSalesOrder[] => {
    return hookData.map((so) => ({
      id: so.id,
      so_no: so.sale_no,
      quotation_no: so.quotation?.quotation_no || "",
      quotation_id: so.quotation_id || "",
      customer_name:
        so.quotation?.customer?.customer_name || "Unknown Customer",
      customer_email: so.quotation?.customer?.email || "",
      sales_pic: "Sales Person", // TODO: Add user relation
      items_count: so.sale_order_detail?.length || 0,
      total_amount: so.grand_total ? Number(so.grand_total) : 0,
      payment_term: "Net 30", // TODO: Add payment term field
      delivery_date: new Date().toISOString().split("T")[0], // TODO: Add delivery date
      status: so.sale_status || so.status || "DRAFT",
      sale_status: so.sale_status || "OPEN",
      payment_status: so.payment_status || "UNPAID",
      created_at: so.created_at
        ? new Date(so.created_at).toISOString()
        : new Date().toISOString(),
      updated_at: so.created_at
        ? new Date(so.created_at).toISOString()
        : new Date().toISOString(),
    }));
  };

  // Filter & search logic
  const filteredData = salesOrders.filter((so) => {
    const searchMatch =
      !filters.search ||
      so.sale_no.toLowerCase().includes(filters.search.toLowerCase()) ||
      (so.quotation_id &&
        so.quotation_id.toLowerCase().includes(filters.search.toLowerCase()));

    const statusMatch = !filters.status || so.status === filters.status;
    const saleStatusMatch =
      !filters.saleStatus || so.sale_status === filters.saleStatus;
    const paymentStatusMatch =
      !filters.paymentStatus || so.payment_status === filters.paymentStatus;

    let dateMatch = true;
    if (filters.dateFrom || filters.dateTo) {
      const soDate = so.created_at ? new Date(so.created_at) : null;
      if (soDate) {
        if (filters.dateFrom) {
          dateMatch = dateMatch && soDate >= new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          dateMatch = dateMatch && soDate <= new Date(filters.dateTo);
        }
      }
    }

    return (
      searchMatch &&
      statusMatch &&
      saleStatusMatch &&
      paymentStatusMatch &&
      dateMatch
    );
  });

  const convertedData = convertToComponentFormat(filteredData);
  const pageSize = 10;
  const totalPages = Math.ceil(convertedData.length / pageSize);
  const pagedData = convertedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <>
        <DashboardBreadcrumb
          title="Sales Orders"
          text="Monitor and manage your sales order pipeline"
        />
        <div className="flex justify-center items-center p-16 w-full h-full">
          <LoadingSkeleton />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardBreadcrumb
          title="Sales Orders"
          text="Monitor and manage your sales order pipeline"
        />
        <div className="flex justify-center items-center p-16 w-full h-full">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardBreadcrumb
        title="Sales Orders"
        text="Monitor and manage your sales order pipeline"
      />

      {/* Info Card about Sales Order Flow */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">
                Sales Order Management
              </h4>
              <p className="text-sm text-blue-800">
                Sales Orders are automatically created from approved quotations.
                Use the table below to monitor progress, confirm orders, and
                manage the fulfillment process.
              </p>
              <Link href="/crm/quotations">
                <Button size="sm" variant="outline" className="mt-2">
                  Go to Quotations →
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <SalesOrderFilters
        onFilterChange={handleFilterChange}
        filters={filters}
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sales Orders</span>
              <span className="text-sm font-normal text-gray-500">
                {convertedData.length} total orders
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalesOrdersTable
              salesOrders={pagedData}
              onUpdate={refresh} // Pass refresh to refresh data after actions
            />
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
