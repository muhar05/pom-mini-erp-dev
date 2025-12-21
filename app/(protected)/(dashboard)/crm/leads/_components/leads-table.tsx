"use client";

import React, { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/formatDate";
import { formatStatusDisplay, getStatusPrefix } from "@/utils/statusHelpers";
import Link from "next/link";

interface LeadsTableProps {
  leads: leads[];
  filters?: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

// Helper function to get status badge styling based on prefix and status
function getStatusBadgeClass(status: string | null | undefined): string {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

  const statusLower = status.toLowerCase();
  const prefix = getStatusPrefix(statusLower);

  // Handle prefixed statuses
  if (prefix === "lead") {
    switch (statusLower) {
      case "lead_new":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "lead_contacted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "lead_interested":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "lead_qualified":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "lead_unqualified":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "lead_converted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  }

  if (prefix === "opp") {
    switch (statusLower) {
      case "opp_new":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "opp_qualified":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "opp_proposal":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "opp_negotiation":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "opp_won":
        return "bg-green-100 text-green-800 border-green-200";
      case "opp_lost":
        return "bg-red-100 text-red-800 border-red-200";
      case "opp_cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  // Legacy status handling for backward compatibility
  switch (statusLower) {
    case "new":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "contacted":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "qualified":
    case "leadqualified":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "prospecting":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "closed_won":
      return "bg-green-100 text-green-800 border-green-200";
    case "closed_lost":
      return "bg-red-100 text-red-800 border-red-200";
    case "nurturing":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "unqualified":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "invalid":
      return "bg-red-100 text-red-800 border-red-200";
    case "converted":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Filter function
function filterLeads(
  leads: leads[],
  filters?: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): leads[] {
  if (!filters) return leads;

  return leads.filter((lead) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        lead.lead_name?.toLowerCase().includes(searchTerm) ||
        lead.reference_no?.toLowerCase().includes(searchTerm) ||
        lead.company?.toLowerCase().includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      const leadStatus = lead.status?.toLowerCase() || "";
      const filterStatus = filters.status.toLowerCase();

      // Handle both prefixed and legacy status filtering
      const statusMatches =
        leadStatus === filterStatus ||
        leadStatus.includes(filterStatus) ||
        filterStatus.includes(leadStatus);

      if (!statusMatches) return false;
    }

    // Date filters
    if (filters.dateFrom || filters.dateTo) {
      const leadDate = lead.created_at ? new Date(lead.created_at) : null;
      if (!leadDate) return false;

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (leadDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (leadDate > toDate) return false;
      }
    }

    return true;
  });
}

export default function LeadsTable({ leads, filters }: LeadsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter leads based on provided filters
  const filteredLeads = filterLeads(leads, filters);

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete lead
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
