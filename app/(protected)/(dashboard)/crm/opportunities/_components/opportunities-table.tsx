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

type Opportunity = {
  no: string;
  date: string;
  customer: string;
  email: string;
  sales: string;
  type: string;
  company: string;
  total: number;
  status: string;
  lastUpdate: string;
};

type OpportunitiesTableProps = {
  isSuperadmin?: boolean;
  data?: Opportunity[];
};

export default function OpportunitiesTable({
  isSuperadmin,
  data = [],
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
          <TableHead>Last Update</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item, idx) => (
            <TableRow key={item.no}>
              <TableCell>{item.no}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.customer}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.sales}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.company}</TableCell>
              <TableCell>{item.total.toLocaleString()}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.lastUpdate}</TableCell>
              <TableCell>
                <OpportunityActions item={item} isSuperadmin={isSuperadmin} />
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
