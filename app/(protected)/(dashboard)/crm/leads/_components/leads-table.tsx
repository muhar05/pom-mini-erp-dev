"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { leads } from "@/types/models";
import { formatDate } from "@/utils/formatDate";
import { formatStatusDisplay } from "@/utils/formatStatus";
import Link from "next/link";
import LeadDeleteDialog from "./lead-delete-dialog";
import { deleteLeadAction } from "@/app/actions/leads";

interface LeadsTableProps {
  leads: leads[];
}

// Helper function to get status badge styling
function getStatusBadgeClass(status: string | null | undefined): string {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case "new":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "contacted":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "qualified":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "proposal":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "negotiation":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "closed_won":
      return "bg-green-100 text-green-800 border-green-200";
    case "closed_lost":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  // Wrapper function for delete action
  async function handleDeleteLead(formData: FormData) {
    return await deleteLeadAction(formData);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Lead Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Sales</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead, idx) => (
          <TableRow key={lead.id}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{lead.lead_name}</TableCell>
            <TableCell>{lead.email ?? "-"}</TableCell>
            <TableCell>{lead.phone ?? "-"}</TableCell>
            <TableCell>{lead.company ?? "-"}</TableCell>
            <TableCell>
              {/* Tampilkan nama Sales dari relasi */}
              {lead.users_leads_id_userTousers?.name ?? "-"}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  lead.status
                )}`}
              >
                {formatStatusDisplay(lead.status)}
              </span>
            </TableCell>
            <TableCell>{formatDate(lead.created_at)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {/* View */}
                <Link href={`/crm/leads/${lead.id}`}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                {/* Edit */}
                <Link href={`/crm/leads/${lead.id}/edit`}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                {/* Delete */}
                <LeadDeleteDialog
                  leadId={lead.id}
                  leadName={lead.lead_name}
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
                  onDelete={handleDeleteLead}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
        {leads.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              No leads found.
              <Link
                href="/crm/leads/new"
                className="text-blue-600 hover:underline"
              >
                Create your first lead
              </Link>
              .
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
