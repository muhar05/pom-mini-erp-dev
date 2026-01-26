"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import SalesOrderDeleteDialog from "./sales-order-delete-dialog";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import Link from "next/link";
import { useSession } from "@/contexts/session-context";
import { getSalesOrderPermissions } from "@/utils/salesOrderPermissions";
import { useI18n } from "@/contexts/i18n-context";

type SalesOrder = {
  id: string;
  so_no: string;
  quotation_no: string;
  quotation_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
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
  items_details?: Array<{
    id: string;
    product_name: string;
    qty: number;
    price: number;
    total: number;
  }>;
};

interface SalesOrdersTableProps {
  salesOrders: SalesOrder[];
  onUpdate?: () => void;
}

// Enhanced status badge styling
function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "completed":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getPaymentBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "partial":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "unpaid":
      return "bg-red-100 text-red-800 border-red-200";
    case "overdue":
      return "bg-red-200 text-red-900 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function SalesOrdersTable({
  salesOrders,
  onUpdate,
}: SalesOrdersTableProps) {
  const { user } = useSession();
  const { t } = useI18n();

  const handleDeleteSuccess = () => {
    onUpdate?.(); // Refresh table data
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>{t("sales_order.no")}</TableHead>
          <TableHead>{t("sales_order.from_quotation")}</TableHead>
          <TableHead>{t("sales_order.customer")}</TableHead>
          <TableHead>{t("sales_order.items")}</TableHead>
          <TableHead>{t("sales_order.amount")}</TableHead>
          <TableHead>{t("sales_order.status")}</TableHead>
          <TableHead>{t("sales_order.payment")}</TableHead>
          <TableHead>{t("common.created_at")}</TableHead>
          <TableHead className="w-[150px]">{t("common.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {salesOrders.map((salesOrder, idx) => {
          return (
            <TableRow
              key={salesOrder.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <TableCell>{idx + 1}</TableCell>
              <TableCell className="font-medium">{salesOrder.so_no}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {salesOrder.quotation_no}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-sm">
                    {salesOrder.customer_name}
                  </div>
                  {salesOrder.customer_email && (
                    <div className="text-xs text-gray-500">
                      {salesOrder.customer_email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {salesOrder.items_count} item(s)
                  </span>
                  {salesOrder.items_details &&
                    salesOrder.items_details.length > 0 && (
                      <div className="text-xs text-gray-500 max-w-[200px]">
                        {salesOrder.items_details
                          .slice(0, 2)
                          .map((item, idx) => (
                            <div key={idx} className="truncate">
                              {item.product_name} (x{item.qty})
                            </div>
                          ))}
                        {salesOrder.items_details.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{salesOrder.items_details.length - 2} more...
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {formatCurrency(salesOrder.total_amount)}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass(
                    salesOrder.sale_status || salesOrder.status
                  )}
                >
                  {t(`status.${(salesOrder.sale_status || salesOrder.status || "draft").toLowerCase()}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getPaymentBadgeClass(
                    salesOrder.payment_status || "unpaid"
                  )}
                >
                  {t(`status.${(salesOrder.payment_status || "unpaid").toLowerCase()}`)}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(salesOrder.created_at)}</TableCell>
              <TableCell>
                {/* Actions Buttons */}
                <div className="flex gap-1 items-center">
                  {/* More Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        title="More Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/sales/sales-orders/${salesOrder.id}`}
                          className="flex items-center"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Full Details
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/sales/sales-orders/${salesOrder.id}/edit`}
                          className="flex items-center"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Sales Order
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <SalesOrderDeleteDialog
                        salesOrder={salesOrder}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-red-600 focus:text-red-600 flex items-center cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Sales Order
                          </DropdownMenuItem>
                        }
                        onDelete={handleDeleteSuccess}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {salesOrders.length === 0 && (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <p>{t("common.no_data")}</p>
              </div>
            </TableCell>
          </TableRow>
        )}

      </TableBody>
    </Table>
  );
}
