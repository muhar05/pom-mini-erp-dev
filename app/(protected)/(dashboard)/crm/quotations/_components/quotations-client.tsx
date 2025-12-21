"use client";

import React, { useState, useMemo } from "react";
import QuotationsTable from "./quotations-table";
import QuotationDetailDrawer from "./quotation-detail-drawer";
import QuotationFilters from "./quotation-filters";
import Pagination from "@/components/ui/pagination";
import AddQuotationButton from "./add-quotation-button";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AvailableLead {
  id: number;
  reference_no: string;
  customer_name: string;
  customer_email?: string;
  company?: string;
  type?: string;
  sales_pic?: string;
  location?: string;
  product_interest?: string;
  created_at?: string;
}
interface QuotationsClientProps {
  availableLeads: AvailableLead[];
}

export default function QuotationsClient({
  availableLeads,
}: QuotationsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleCreateQuotation = (lead: AvailableLead) => {
    // Redirect ke halaman create quotation dengan data lead sebagai query params
    const queryParams = new URLSearchParams({
      leadId: String(lead.id),
      customerName: lead.customer_name,
      customerEmail: lead.customer_email || "",
      company: lead.company || "",
      referenceNo: lead.reference_no,
    });

    router.push(`/crm/quotations/new?${queryParams.toString()}`);
  };

  return (
    <>
      {" "}
      <QuotationFilters search={""} setSearch={() => {}} />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <AddQuotationButton />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Reference No</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sales PIC</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Product Interest</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableLeads.length > 0 ? (
                availableLeads.map((lead, idx) => (
                  <TableRow key={lead.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{lead.reference_no}</TableCell>
                    <TableCell>{lead.customer_name}</TableCell>
                    <TableCell>{lead.customer_email || "-"}</TableCell>
                    <TableCell>{lead.company || "-"}</TableCell>
                    <TableCell>{lead.type || "-"}</TableCell>
                    <TableCell>{lead.sales_pic || "-"}</TableCell>
                    <TableCell>{lead.location || "-"}</TableCell>
                    <TableCell>{lead.product_interest || "-"}</TableCell>
                    <TableCell>{lead.created_at || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-8 text-gray-500"
                  >
                    No available Quotations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
