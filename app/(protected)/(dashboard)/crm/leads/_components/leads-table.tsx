"use client";

import React, { useState, useEffect } from "react";
import { leads } from "@/types/models";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/formatDate";
import { formatStatusDisplay } from "@/utils/statusHelpers";
import Link from "next/link";
import { filterLeads, getStatusBadgeClass } from "@/utils/leadTableHelpers";
import LeadDeleteDialog from "./lead-delete-dialog";
import { deleteLeadAction } from "@/app/actions/leads";
import { useRouter } from "next/navigation";

interface LeadsTableProps {
  leads: leads[];
  filters?: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default function LeadsTable({ leads, filters }: LeadsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [localLeads, setLocalLeads] = useState<leads[]>(leads);

  // Sync localLeads with props.leads jika leads berubah dari parent
  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  // Filter leads based on provided filters
  const filteredLeads = filterLeads(localLeads, filters);

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fungsi hapus lead
  async function handleDeleteLead(formData: FormData) {
    const result = await deleteLeadAction(formData);
    if (result?.success) {
      const deletedId = Number(formData.get("id"));
      setLocalLeads((prev) => prev.filter((l) => l.id !== deletedId));
    }
    return result;
  }

  return (
    <div className="space-y-4">
      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        Showing {paginatedLeads.length} of {filteredLeads.length} leads
        {filters?.search && ` matching "${filters.search}"`}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead Name</TableHead>
              <TableHead>Reference No</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Potential Value</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No leads found
                  {filters?.search && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your search criteria
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/crm/leads/${lead.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {lead.lead_name}
                    </Link>
                  </TableCell>
                  <TableCell>{lead.reference_no || "-"}</TableCell>
                  <TableCell>{lead.company || "-"}</TableCell>
                  <TableCell>{lead.email || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeClass(lead.status)}
                    >
                      {formatStatusDisplay(lead.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.potential_value != null
                      ? formatCurrency(Number(lead.potential_value))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {lead.created_at ? formatDate(lead.created_at) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/crm/leads/${lead.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/crm/leads/${lead.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit lead
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <LeadDeleteDialog
                            leadId={lead.id}
                            leadName={lead.lead_name}
                            onDelete={handleDeleteLead}
                            trigger={
                              <span className="flex ml-2 items-center text-red-600 cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete lead
                              </span>
                            }
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
