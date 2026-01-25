"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatStatusDisplay } from "@/utils/statusHelpers";
import { MoreHorizontal, Eye, Edit, Trash, Repeat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/utils/opportunityTableHelpers";
import { Opportunity, SessionUser } from "@/types/models";
import { useUpdateOpportunityStatus } from "@/hooks/opportunities/useUpdateOpportunitiesStatus";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import OpportunityDeleteDialog from "@/app/(protected)/(dashboard)/crm/opportunities/_components/opportunity-delete-dialog";
import { useConvertOpportunityToSQ } from "@/hooks/opportunities/useConvertOpportunityToSQ";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/utils/formatCurrency";
import { isSuperuser, isSales, isManagerSales } from "@/utils/userHelpers";

type OpportunitiesTableProps = {
  isSuperadmin?: boolean;
  data?: Opportunity[];
  onRowClick?: (item: Opportunity) => void;
  onEdit?: (item: Opportunity) => void;
  onDelete?: () => void; // callback untuk refresh data
  currentUser: SessionUser;
};

type TableOpportunity = Opportunity & { stage: string };

export default function OpportunitiesTable({
  isSuperadmin,
  data = [],
  onRowClick,
  currentUser,
  onEdit,
  onDelete,
}: OpportunitiesTableProps) {
  // Filter hanya status dengan prefix "opp"
  const filteredData = data.filter(
    (item) =>
      item.status === "opp_prospecting" ||
      item.status === "opp_lost" ||
      item.status === "opp_sq",
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<TableOpportunity | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertId, setConvertId] = useState<string | null>(null);

  const { updateStatus, isLoading } = useUpdateOpportunityStatus(
    selectedId || "",
  );
  const { convert, loading, error, result } = useConvertOpportunityToSQ();

  const handleConvertSQ = (id: string) => {
    setConvertId(id);
    setConvertDialogOpen(true);
  };

  const handleConfirmConvert = async () => {
    if (!convertId) return;
    const success = await convert(convertId, null);
    if (success) {
      setConvertDialogOpen(false);
      setConvertId(null);
      onDelete?.();
    } else {
      toast.error(error || "Gagal convert ke SQ");
    }
  };

  const handleConfirm = async () => {
    if (!pendingStatus || !selectedId) return;
    const success = await updateStatus(pendingStatus);
    if (success) {
      setDialogOpen(false);
      setPendingStatus(null);
      setSelectedId(null);
    }
  };

  function canEditDeleteConvert(item: Opportunity, currentUser: SessionUser) {
    if (isSuperuser(currentUser) || isManagerSales(currentUser)) return true;
    if (isSales(currentUser)) {
      const isOwner = Number(item.id_user) === Number(currentUser.id);
      const isAssigned = Number(item.assigned_to) === Number(currentUser.id);
      return isOwner || isAssigned;
    }
    return false;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No Opportunity</TableHead>
            <TableHead>Tanggal Input</TableHead>
            <TableHead>Nama Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Sales PIC</TableHead>
            <TableHead>Perusahaan</TableHead>
            <TableHead>Potensi Nilai</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length > 0 ? (
            filteredData.map((item, idx) => (
              <React.Fragment key={item.id}>
                <TableRow
                  onClick={() => onRowClick?.(item)}
                  className="cursor-pointer"
                >
                  <TableCell>{item.opportunity_no}</TableCell>
                  <TableCell>{item.created_at}</TableCell>
                  <TableCell>{item.customer_name}</TableCell>
                  <TableCell>{item.customer_email}</TableCell>
                  <TableCell>{item.sales_pic}</TableCell>
                  <TableCell>{item.company}</TableCell>
                  <TableCell>{formatCurrency(item.potential_value)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status === "opp_sq"
                        ? "SQ"
                        : formatStatusDisplay(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/crm/opportunities/${item.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Detail
                          </Link>
                        </DropdownMenuItem>
                        {canEditDeleteConvert(item, currentUser) && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/crm/opportunities/${item.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {isSales(currentUser) && (
                              <DropdownMenuItem
                                onClick={() => handleConvertSQ(item.id)}
                                disabled={item.status !== "opp_prospecting"}
                                className="cursor-pointer"
                              >
                                <Repeat className="mr-2 h-4 w-4" />
                                Convert SQ
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedOpportunity({
                                  ...item,
                                  stage: (item as any).stage ?? "",
                                });
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 cursor-pointer"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={11}
                className="text-center py-8 text-gray-500"
              >
                No opportunities found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Dialog Konfirmasi Convert SQ */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to SQ</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengubah opportunity ini menjadi
              SQ/Quotation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleConfirmConvert}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Ya, Convert
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Batal
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to SQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to convert this opportunity to SQ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Yes, Convert
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {selectedOpportunity && (
        <OpportunityDeleteDialog
          opportunity={selectedOpportunity}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={() => {
            setDeleteDialogOpen(false);
            setSelectedOpportunity(null);
            onDelete?.();
          }}
        />
      )}
    </>
  );
}
