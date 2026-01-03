"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompanyLevel } from "@/hooks/companies/useCompanyLevels";
import CompanyLevelActions from "./company-level-actions";

interface CompanyLevelsTableProps {
  levels: CompanyLevel[];
}

export default function CompanyLevelsTable({
  levels,
}: CompanyLevelsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Level Name</TableHead>
          <TableHead>Disc 1</TableHead>
          <TableHead>Disc 2</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {levels.map((level, idx) => (
          <TableRow key={level.id_level}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{level.level_name}</TableCell>
            <TableCell>{level.disc1 ?? "-"}</TableCell>
            <TableCell>{level.disc2 ?? "-"}</TableCell>
            <TableCell>
              <CompanyLevelActions level={level} />
            </TableCell>
          </TableRow>
        ))}
        {levels.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
              No company levels found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
