"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Send,
  Copy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import InvoiceDeleteDialog from "./invoice-delete-dialog";

type Invoice = {
  id: string;
  invoice_no: string;
  sales_order_no: string;
  customer_name: string;
  customer_email: string;
  billing_address: string;
  items_count: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  invoice_date: string;
  due_date: string;
  payment_term: string;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

interface InvoiceActionsProps {
  invoice: Invoice;
}

export default function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleView = () => {
    router.push(`/finance/invoice/${invoice.id}`);
  };

  const handleEdit = () => {
    router.push(`/finance/invoice/${invoice.id}/edit`);
  };

  const handleDownload = () => {
    // Implement download PDF functionality
    console.log("Download invoice:", invoice.invoice_no);
  };

  const handleSend = () => {
    // Implement send email functionality
    console.log("Send invoice:", invoice.invoice_no);
  };

  const handleDuplicate = () => {
    // Implement duplicate functionality
    console.log("Duplicate invoice:", invoice.invoice_no);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSend}>
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InvoiceDeleteDialog
        invoice={invoice}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
