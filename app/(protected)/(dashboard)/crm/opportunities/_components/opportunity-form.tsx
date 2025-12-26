"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  OPPORTUNITY_STATUSES,
  formatStatusDisplay,
} from "@/utils/statusHelpers";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { OpportunityFormType, OpportunityFormProps } from "@/types/models";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function OpportunityForm({
  mode,
  opportunity,
  onSuccess,
}: OpportunityFormProps) {
  const [formData, setFormData] = useState<OpportunityFormType>({
    id: opportunity?.id || "",
    opportunity_no: opportunity?.opportunity_no || "",
    lead_name: opportunity?.lead_name || "",
    contact: opportunity?.contact || "",
    email: opportunity?.email || "",
    phone: opportunity?.phone || "",
    type: opportunity?.type || "",
    company: opportunity?.company || "",
    location: opportunity?.location || "",
    product_interest: opportunity?.product_interest || "",
    source: opportunity?.source || "",
    note: opportunity?.note || opportunity?.notes || "",
    id_user: opportunity?.id_user || null,
    assigned_to: opportunity?.assigned_to || null,
    status: opportunity?.status || "",
    sales_pic: opportunity?.sales_pic || "",
    potential_value: opportunity?.potential_value || 0,
    created_at: opportunity?.created_at || "",
    updated_at: opportunity?.updated_at || "",
    id_user_name: opportunity?.id_user_name || "",
    assigned_to_name: opportunity?.assigned_to_name || "",
    customer_name: opportunity?.customer_name || "",
    customer_email: opportunity?.customer_email || "",
    expected_close_date: opportunity?.expected_close_date || "",
    notes: opportunity?.notes || "",
  });

  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const router = useRouter();

  // Fungsi onClose lokal
  const handleClose = () => {
    router.push("/crm/opportunities");
  };

  // Handler untuk konfirmasi status
  const handleStatusChange = (status: string) => {
    setPendingStatus(status);
    setDialogOpen(true);
  };

  // Handler untuk submit perubahan status
  const handleConfirmStatus = async () => {
    if (!pendingStatus) return;
    setLoading(true);
    try {
      await fetch(`/api/opportunities/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pendingStatus }),
      });
      setFormData((prev) => ({
        ...prev,
        status: pendingStatus,
      }));
      onSuccess?.();
    } finally {
      setLoading(false);
      setDialogOpen(false);
      setPendingStatus(null);
    }
  };

  return (
    <Card className="w-full mx-auto dark:bg-gray-800">
      <CardContent className="pt-6">
        {/* Dialog Konfirmasi */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Status Change</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p>
                Are you sure you want to change status to{" "}
                <span className="font-semibold">
                  {pendingStatus === OPPORTUNITY_STATUSES.PROSPECTING
                    ? "Qualified"
                    : pendingStatus === OPPORTUNITY_STATUSES.SQ
                    ? "SQ"
                    : pendingStatus === OPPORTUNITY_STATUSES.LOST
                    ? "Lost"
                    : pendingStatus}
                </span>
                ?
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={
                  pendingStatus === OPPORTUNITY_STATUSES.LOST
                    ? "destructive"
                    : "default"
                }
                onClick={handleConfirmStatus}
                disabled={loading}
              >
                {loading ? "Updating..." : "Yes, Change Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {formData.opportunity_no}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="info" className="text-sm">
                {formData.status === "opp_sq"
                  ? "SQ"
                  : formatStatusDisplay(formData.status || "")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created: {formatDate(formData.created_at)}
              </span>
            </div>
          </div>
          {isEdit && (
            <div className="flex flex-wrap gap-2">
              {formData.status !== OPPORTUNITY_STATUSES.PROSPECTING && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleStatusChange(OPPORTUNITY_STATUSES.PROSPECTING)
                  }
                  disabled={loading}
                >
                  Set Qualified
                </Button>
              )}
              {formData.status !== OPPORTUNITY_STATUSES.SQ && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => handleStatusChange(OPPORTUNITY_STATUSES.SQ)}
                  disabled={loading}
                >
                  Convert to SQ
                </Button>
              )}
              {formData.status !== OPPORTUNITY_STATUSES.LOST && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleStatusChange(OPPORTUNITY_STATUSES.LOST)}
                  disabled={loading}
                >
                  Set Lost
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Customer & User Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                Customer Information
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Customer Name
                </label>
                <Input
                  value={formData.customer_name || formData.lead_name}
                  disabled
                  className="bg-muted/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Customer Email
                  </label>
                  <Input
                    value={formData.customer_email || formData.email || ""}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Phone
                  </label>
                  <Input
                    value={formData.phone || ""}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Contact Person
                  </label>
                  <Input
                    value={formData.contact || ""}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Type
                  </label>
                  <Input
                    value={formData.type || ""}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Company
                </label>
                <Input
                  value={formData.company || ""}
                  disabled
                  className="bg-muted/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Location
                  </label>
                  <Input
                    value={formData.location || ""}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Source
                  </label>
                  <Input
                    value={formData.source || ""}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
              </div>
            </section>

            {/* User Information */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                User Information
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Sales PIC
                </label>
                <Input
                  value={formData.id_user_name || formData.sales_pic || ""}
                  disabled
                  className="bg-muted/50"
                />
              </div>
              {formData.assigned_to_name && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Assigned To
                  </label>
                  <Input
                    value={formData.assigned_to_name}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
              )}
            </section>
          </div>

          {/* Right: Product & Value + Additional Info */}
          <div className="space-y-6">
            {/* Product & Value */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                Product & Value
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Product Interest
                </label>
                <Textarea
                  value={formData.product_interest || ""}
                  disabled
                  rows={4}
                  className="bg-muted/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Potential Value
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    IDR {formData.potential_value.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                Additional Information
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Notes
                </label>
                <Textarea
                  value={formData.note || formData.notes || ""}
                  disabled
                  rows={5}
                  className="bg-muted/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Created At
                  </label>
                  <div className="text-sm p-2 bg-muted/50 rounded-md">
                    {formatDate(formData.created_at)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Updated At
                  </label>
                  <div className="text-sm p-2 bg-muted/50 rounded-md">
                    {formatDate(formData.updated_at)}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Form Actions */}
        <Separator />
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="min-w-[100px]"
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
