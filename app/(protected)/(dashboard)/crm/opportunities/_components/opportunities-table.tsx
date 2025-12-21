"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import OpportunityActions from "./opportunity-actions";
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

export default function OpportunitiesTable({
  isSuperadmin,
  data = [],
  onRowClick,
  onEdit,
  onDelete,
}: OpportunitiesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No Opportunity</TableHead>
          <TableHead>Tanggal Input</TableHead>
          <TableHead>Nama Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Sales PIC</TableHead>
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
            <TableRow
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className="cursor-pointer"
            >
              <TableCell>{item.opportunity_no}</TableCell>
              <TableCell>{item.created_at}</TableCell>
              <TableCell>{item.customer_name}</TableCell>
              <TableCell>{item.customer_email}</TableCell>
              <TableCell>{item.sales_pic}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.company}</TableCell>
              <TableCell>{item.potential_value.toLocaleString()}</TableCell>
              <TableCell>{formatStatusDisplay(item.status)}</TableCell>
              {/* <TableCell>{item.updated_at}</TableCell> */}
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
