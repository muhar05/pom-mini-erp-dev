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
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import { useI18n } from "@/contexts/i18n-context";
import SalesOrderActions from "./sales-order-actions";

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
  switch (status?.toUpperCase()) {
    case "NEW":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PR":
    case "PO":
    case "SR":
    case "FAR":
    case "DR":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "DELIVERY":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "DELIVERED":
      return "bg-green-100 text-green-800 border-green-200";
    case "RECEIVED":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "COMPLETED":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
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
  const { t } = useI18n();

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
                    {t("sales_order.items_count", { count: salesOrder.items_count })}
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
                            +{salesOrder.items_details.length - 2} {t("sales_order.more")}
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
                <SalesOrderActions
                  salesOrder={salesOrder}
                  onUpdate={onUpdate}
                />
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
