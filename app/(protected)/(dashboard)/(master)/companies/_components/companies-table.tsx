"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { company } from "@/types/models";
import { formatDate } from "@/utils/formatDate";
import CompanyActions from "./company-actions";

interface CompaniesTableProps {
  companies: company[];
  filters?: any;
}

export default function CompaniesTable({ companies }: CompaniesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Company Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>NPWP</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company, idx) => (
          <TableRow key={company.id}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{company.company_name}</TableCell>
            <TableCell>{company.address || "-"}</TableCell>
            <TableCell>{company.npwp || "-"}</TableCell>
            <TableCell>
              {company.company_level ? company.company_level.level_name : "-"}
            </TableCell>
            <TableCell>{formatDate(company.created_at)}</TableCell>
            <TableCell>
              <CompanyActions company={company} />
            </TableCell>
          </TableRow>
        ))}
        {companies.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              No companies found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
