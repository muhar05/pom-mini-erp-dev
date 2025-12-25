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
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/utils/opportunityTableHelpers";
import { Opportunity } from "@/types/models";

type OpportunitiesTableProps = {
  isSuperadmin?: boolean;
  data?: Opportunity[];
  onRowClick?: (item: Opportunity) => void;
  onEdit?: (item: Opportunity) => void;
  onDelete?: (item: Opportunity) => void;
};

export default function OpportunitiesTable({
  isSuperadmin,
  data = [],
  onRowClick,
  onEdit,
  onDelete,
}: OpportunitiesTableProps) {
  // Filter hanya status dengan prefix "opp"
  const filteredData = data.filter(
    (item) =>
      item.status === "prospecting" ||
      item.status === "opp_lost" ||
      item.status === "opp_sq"
  );

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
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.company}</TableCell>
                <TableCell>{item.potential_value.toLocaleString()}</TableCell>
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
