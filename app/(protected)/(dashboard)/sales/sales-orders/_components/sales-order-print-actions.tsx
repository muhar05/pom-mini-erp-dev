"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, MoreVertical, Printer, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import SalesOrderExport, {
  SOExportHandle,
} from "@/components/sales-orders/salesOrderExport";
import { formatDate } from "@/utils/formatDate";

interface SalesOrderPrintActionsProps {
  salesOrder: any;
}

export default function SalesOrderPrintActions({
  salesOrder,
}: SalesOrderPrintActionsProps) {
  const router = useRouter();
  const exportRef = useRef<SOExportHandle>(null);

  const handleView = () => {
    router.push(`/crm/sales-orders/${salesOrder.id}`);
  };

  const handleDownloadPDF = () => {
    if (exportRef.current) {
      exportRef.current.download();
    }
  };

  // Prepare data for export
  const exportItems =
    salesOrder.sale_order_detail?.map((item: any) => ({
      product_name: item.product_name || "",
      price: Number(item.price) || 0,
      qty: Number(item.qty) || 0,
      total: Number(item.total) || 0,
      status: item.status || "ACTIVE",
    })) || [];

  return (
    <>
      {/* Hidden export component */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <SalesOrderExport
          ref={exportRef}
          soNumber={salesOrder.sale_no || ""}
          date={formatDate(salesOrder.created_at)}
          paymentTerm="Cash" // You might want to get this from the order
          currency="IDR"
          customerName={salesOrder.quotation?.customer?.customer_name || ""}
          customerAddress={salesOrder.quotation?.customer?.address || ""}
          customerEmail={salesOrder.quotation?.customer?.email || ""}
          companyName="PT. POM MINI ERP"
          companyAddress="Jl. Company Address"
          companyPhone="+62 21 1234567"
          items={exportItems}
          notes={salesOrder.note || ""}
          signatureName="Sales Manager"
          fileName={`SO_${salesOrder.sale_no}.pdf`}
          status={salesOrder.status}
          saleStatus={salesOrder.sale_status}
          paymentStatus={salesOrder.payment_status}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
