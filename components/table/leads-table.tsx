"use client";
import { useEffect, useState } from "react";
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
import { Lead } from "@/types/models";
import { formatDate } from "@/utils/formatDate";

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => setLeads(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Lead Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead, idx) => (
          <TableRow key={lead.id}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{lead.lead_name}</TableCell>
            <TableCell>{lead.email ?? "-"}</TableCell>
            <TableCell>{lead.phone ?? "-"}</TableCell>
            <TableCell>{lead.status ?? "-"}</TableCell>
            <TableCell>{formatDate(lead.created_at)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-blue-500"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-green-600"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
