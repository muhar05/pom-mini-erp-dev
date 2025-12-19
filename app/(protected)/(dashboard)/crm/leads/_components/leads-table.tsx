"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { deleteLeadAction, convertLeadAction } from "@/app/actions/leads";

interface LeadsTableProps {
  leads: leads[];
  filters?: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
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
    case "leadqualified":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "opportunityqualified":
      return "bg-green-100 text-green-800 border-green-200";
    case "proposal":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "negotiation":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
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
      if (lead.status?.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const leadDate = lead.created_at ? new Date(lead.created_at) : null;
      if (!leadDate) return false;

      const leadDateStr = leadDate.toISOString().split("T")[0];

      if (filters.dateFrom && leadDateStr < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && leadDateStr > filters.dateTo) {
        return false;
      }
    }

    return true;
  });
}

export default function LeadsTable({ leads, filters }: LeadsTableProps) {
  const [deleteDialog, setDeleteDialog] = React.useState<{
    isOpen: boolean;
    leadId: number | null;
    leadName: string;
  }>({
    isOpen: false,
    leadId: null,
    leadName: "",
  });

  const [convertDialog, setConvertDialog] = React.useState<{
    isOpen: boolean;
    leadId: number | null;
    leadName: string;
  }>({
    isOpen: false,
    leadId: null,
    leadName: "",
  });

  const [loading, setLoading] = React.useState(false);

  // Filter leads based on provided filters
  const filteredLeads = React.useMemo(() => {
    return filterLeads(leads, filters);
  }, [leads, filters]);

  const handleDelete = async () => {
    if (!deleteDialog.leadId) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", deleteDialog.leadId.toString());

      const result = await deleteLeadAction(formData);

      if (result.success) {
        window.location.reload(); // Simple reload for now
      } else {
        alert(result.message || "Failed to delete lead");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete lead");
    } finally {
      setLoading(false);
      setDeleteDialog({ isOpen: false, leadId: null, leadName: "" });
    }
  };

  const handleConvert = async () => {
    if (!convertDialog.leadId) return;

    setLoading(true);
    try {
      const result = await convertLeadAction(convertDialog.leadId);

      if (result.success) {
        alert(result.message);
        window.location.reload(); // Simple reload for now
      } else {
        alert("Failed to convert lead");
      }
    } catch (error) {
      console.error("Convert error:", error);
      alert("Failed to convert lead");
    } finally {
      setLoading(false);
      setConvertDialog({ isOpen: false, leadId: null, leadName: "" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredLeads.length} of {leads.length} leads
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Ref No</TableHead>
              <TableHead>Lead Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-muted-foreground"
                >
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead, index) => (
                <TableRow key={lead.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {lead.reference_no || `LE${lead.id}`}
                  </TableCell>
                  <TableCell>{lead.lead_name}</TableCell>
                  <TableCell>{lead.company || "-"}</TableCell>
                  <TableCell>{lead.contact || "-"}</TableCell>
                  <TableCell>{lead.email || "-"}</TableCell>
                  <TableCell>{lead.phone || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                        lead.status
                      )}`}
                    >
                      {formatStatusDisplay(lead.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {lead.created_at ? formatDate(lead.created_at) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {/* View Button */}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/crm/leads/${lead.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      {/* Edit Button */}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/crm/leads/${lead.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      {/* Convert Button - Only show for Qualified leads */}
                      {lead.status?.toLowerCase() === "qualified" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setConvertDialog({
                              isOpen: true,
                              leadId: lead.id,
                              leadName: lead.lead_name,
                            })
                          }
                          className="text-green-600 hover:text-green-800"
                        >
                          Convert
                        </Button>
                      )}

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteDialog({
                            isOpen: true,
                            leadId: lead.id,
                            leadName: lead.lead_name,
                          })
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          !loading &&
          setDeleteDialog({ isOpen: open, leadId: null, leadName: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete lead "{deleteDialog.leadName}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert Confirmation Dialog */}
      <Dialog
        open={convertDialog.isOpen}
        onOpenChange={(open) =>
          !loading &&
          setConvertDialog({ isOpen: open, leadId: null, leadName: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to convert lead "{convertDialog.leadName}"
              to opportunity? This will change the status to "Lead Qualified".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleConvert}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Converting..." : "Convert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
