"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { leads } from "@/types/models";
import { formatDate } from "@/utils/formatDate";

interface LeadViewDialogProps {
  lead: leads;
  trigger: React.ReactNode;
}

export default function LeadViewDialog({ lead, trigger }: LeadViewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lead Detail</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {lead.lead_name}
          </p>
          <p>
            <strong>Email:</strong> {lead.email ?? "-"}
          </p>
          <p>
            <strong>Phone:</strong> {lead.phone ?? "-"}
          </p>
          <p>
            <strong>Company:</strong> {lead.company ?? "-"}
          </p>
          <p>
            <strong>Status:</strong> {lead.status ?? "-"}
          </p>
          <p>
            <strong>Note:</strong> {lead.note ?? "-"}
          </p>
          <p>
            <strong>Created At:</strong> {formatDate(lead.created_at)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
