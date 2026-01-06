"use client";

import { Button } from "@/components/ui/button";
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  FileUp,
  CreditCard,
  Truck,
  XCircle,
  Download,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import SalesOrderDeleteDialog from "./sales-order-delete-dialog";
import {
  getSalesOrderPermissions,
  isActionAvailable,
} from "@/utils/salesOrderPermissions";
import { useSession } from "@/contexts/session-context";
import { useState, useRef } from "react";
import { confirmSalesOrderAction } from "@/app/actions/sales-orders";
import toast from "react-hot-toast";
import SalesOrderExport, {
  SOExportHandle,
} from "@/components/sales-orders/salesOrderExport";
import { formatDate } from "@/utils/formatDate";

type SalesOrder = {
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

interface SalesOrderActionsProps {
  salesOrder: SalesOrder;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void; // Callback for updates
}

export default function SalesOrderActions({
  salesOrder,
  onEdit,
  onDelete,
  onUpdate,
}: SalesOrderActionsProps) {
  const { user } = useSession();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const exportRef = useRef<SOExportHandle>(null);

  const permissions = getSalesOrderPermissions(salesOrder, user);

  const handleAction = async (action: string, actionFn: () => Promise<any>) => {
    setLoading((prev) => ({ ...prev, [action]: true }));
    try {
      const result = await actionFn();
      if (result?.success) {
        toast.success(result.message);
        onUpdate?.(); // Refresh data
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  const handleConfirm = async () => {
    await handleAction("confirm", () => confirmSalesOrderAction(salesOrder.id));
  };

  const handleDownloadPDF = () => {
    if (exportRef.current) {
      exportRef.current.download();
    }
  };

  const handleDeleteCallback = () => {
    onUpdate?.(); // Refresh the table data
    onDelete?.(); // Call additional delete callback if provided
  };

  // Prepare basic data for export (we don't have full details in table view)
  const exportItems = [
    {
      product_name: `${salesOrder.items_count} item(s)`,
      price: salesOrder.total_amount,
      qty: 1,
      total: salesOrder.total_amount,
      status: "ACTIVE",
    },
  ];

  // Only show actions that are available based on permissions
  return (
    <>
      {/* Hidden export component */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <SalesOrderExport
          ref={exportRef}
          soNumber={salesOrder.so_no || ""}
          date={formatDate(salesOrder.created_at)}
          paymentTerm={salesOrder.payment_term || "Cash"}
          currency="IDR"
          customerName={salesOrder.customer_name || ""}
          customerAddress="" // Not available in table view
          customerEmail={salesOrder.customer_email || ""}
          companyName="PT. POM MINI ERP"
          companyAddress="Jl. Company Address"
          companyPhone="+62 21 1234567"
          items={exportItems}
          notes="Summary export from table view - for detailed items please view full details"
          signatureName="Sales Manager"
          fileName={`SO_${salesOrder.so_no}_summary.pdf`}
          status={salesOrder.status}
          saleStatus={salesOrder.sale_status}
          paymentStatus={salesOrder.payment_status}
        />
      </div>

      <div className="flex gap-1">
        {/* View - Always available */}
        <Link href={`/crm/sales-orders/${salesOrder.id}`}>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </Link>

        {/* Edit - Only for limited fields based on status */}
        {permissions.editableFields.length > 0 && (
          <Link href={`/crm/sales-orders/${salesOrder.id}/edit`}>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Edit (Limited)"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
        )}

        {/* Confirm - Only for OPEN status */}
        {isActionAvailable("confirm", permissions) && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            title="Confirm Sales Order"
            onClick={handleConfirm}
            disabled={loading.confirm}
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
        )}

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              title="More Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Download PDF */}
            <DropdownMenuItem onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>

            {/* Request Finance - Only after confirmed */}
            {isActionAvailable("request_finance", permissions) && (
              <DropdownMenuItem
                onClick={() => {
                  toast("Finance request feature coming soon", {
                    icon: "ℹ️",
                  });
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Request Finance
              </DropdownMenuItem>
            )}

            {/* Create Delivery - Only after finance approved */}
            {isActionAvailable("create_delivery", permissions) && (
              <DropdownMenuItem
                onClick={() => {
                  toast("Delivery request feature coming soon", {
                    icon: "ℹ️",
                  });
                }}
              >
                <Truck className="mr-2 h-4 w-4" />
                Create Delivery
              </DropdownMenuItem>
            )}

            {/* Cancel - Based on permissions */}
            {isActionAvailable("cancel", permissions) && (
              <DropdownMenuItem
                onClick={() => {
                  toast("Cancel feature coming soon", {
                    icon: "ℹ️",
                  });
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete - Only for superadmin and specific statuses */}
        {permissions.canCancel && user?.role === "superadmin" && (
          <SalesOrderDeleteDialog
            salesOrder={salesOrder}
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
            onDelete={handleDeleteCallback}
          />
        )}
      </div>
    </>
  );
}
