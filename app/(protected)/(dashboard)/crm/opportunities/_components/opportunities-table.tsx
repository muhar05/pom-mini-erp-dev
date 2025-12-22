"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import { formatStatusDisplay } from "@/utils/statusHelpers";
import { MoreHorizontal, Eye, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react"; // Tambahkan jika belum ada
import {
  setOpportunityLost,
  setOpportunityQualified,
  setOpportunitySQ,
} from "@/app/actions/opportunities";
import { Badge } from "@/components/ui/badge";

type Opportunity = {
  id: string;
  opportunity_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  potential_value: number;
  stage: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type OpportunitiesTableProps = {
  isSuperadmin?: boolean;
  data?: Opportunity[];
  onRowClick?: (item: Opportunity) => void;
  onEdit?: (item: Opportunity) => void;
  onDelete?: (item: Opportunity) => void;
};

function getStatusColor(status: string) {
  if (status.includes("qualified") || status === "opp_qualified")
    return "green";
  if (status.includes("lost") || status === "opp_lost") return "red";
  if (status === "opp_sq") return "blue";
  if (status.includes("new")) return "yellow";
  return "gray";
}

function getStatusVariant(status: string) {
  if (status.includes("qualified") || status === "opp_qualified")
    return "success";
  if (status.includes("lost") || status === "opp_lost") return "danger";
  if (status === "opp_sq") return "info";
  if (status.includes("new")) return "warning";
  return "default";
}

export default function OpportunitiesTable({
  isSuperadmin,
  data = [],
  onRowClick,
  onEdit,
  onDelete,
}: OpportunitiesTableProps) {
  // Handler untuk update status (dummy, ganti dengan logic update status)
  const handleStatusChange = async (item: Opportunity, status: string) => {
    const statusLabel =
      status === "opp_qualified"
        ? "Qualified"
        : status === "opp_lost"
        ? "Lost"
        : status === "opp_sq"
        ? "SQ"
        : status;

    const loadingId = toast.loading(`Mengubah status ke ${statusLabel}...`);
    try {
      if (status === "opp_qualified") {
        await setOpportunityQualified(item.id);
      } else if (status === "opp_lost") {
        await setOpportunityLost(item.id);
      } else if (status === "opp_sq") {
        await setOpportunitySQ(item.id);
      }
      toast.success(
        `Status ${item.opportunity_no} berhasil diubah ke ${statusLabel}`,
        { id: loadingId }
      );
    } catch (err) {
      toast.error("Gagal mengubah status", { id: loadingId });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No Opportunity</TableHead>
          <TableHead>Tanggal Input</TableHead>
          <TableHead>Nama Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Perusahaan</TableHead>
          <TableHead>Total Harga</TableHead>
          <TableHead>Status</TableHead>
          {/* <TableHead>Last Update</TableHead> */}
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item, idx) => (
            <React.Fragment key={item.id}>
              <TableRow
                onClick={() => onRowClick?.(item)}
                className="cursor-pointer"
              >
                <TableCell>{item.opportunity_no}</TableCell>
                <TableCell>{item.created_at}</TableCell>
                <TableCell>{item.customer_name}</TableCell>
                <TableCell>{item.customer_email}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.company}</TableCell>
                <TableCell>{item.potential_value.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(item.status)}>
                    {formatStatusDisplay(item.status)}
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
                      <DropdownMenuItem asChild>
                        <Link href={`/crm/opportunities/${item.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow key={`${item.id}-actions`}>
                <TableCell colSpan={10}>
                  <div className="flex justify-end gap-2 py-2">
                    Change Status To:
                    <Button
                      size="sm"
                      variant="default"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleStatusChange(item, "opp_qualified");
                      }}
                    >
                      Qualified
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleStatusChange(item, "opp_lost");
                      }}
                    >
                      Lost
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleStatusChange(item, "opp_sq");
                      }}
                    >
                      SQ
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={11} className="text-center py-8 text-gray-500">
              No opportunities found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
