"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  OPPORTUNITY_STATUSES,
  formatStatusDisplay,
  canEditOpportunity,
  canConvertToSQ,
  isFieldEditableForStatus,
} from "@/utils/statusHelpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isSuperuser, isManagerSales, isSales } from "@/utils/userHelpers";
import { useSession } from "@/contexts/session-context";
import { formatDate } from "@/utils/formatDate";
import { useState, useEffect, useRef } from "react";
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
import toast from "react-hot-toast";
import { selectStyles } from "@/utils/leadFormHelpers";
import { formatCurrency } from "@/utils/formatCurrency";
import { useConvertOpportunityToSQ } from "@/hooks/opportunities/useConvertOpportunityToSQ";

const WindowedSelect = dynamic(() => import("react-windowed-select"), {
  ssr: false,
});

export default function OpportunityForm({
  mode,
  opportunity,
  onSuccess,
  products = [],
  salesUsers = [],
}: OpportunityFormProps & {
  products?: Array<{ id: number; name: string }>;
  salesUsers?: Array<{ id: number; name: string }>;
}) {
  if (!opportunity) {
    return (
      <div className="p-6 text-center text-red-500">
        Opportunity data not found.
      </div>
    );
  }

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
  const [productInterest, setProductInterest] = useState<
    Array<{ label: string; value: string }>
  >(
    opportunity.product_interest
      ? opportunity.product_interest
        .split(",")
        .map((name: string) => ({ label: name, value: name }))
      : [],
  );
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const isEdit = mode === "edit";
  const router = useRouter();

  const {
    convert,
    loading: convertLoading,
    error: convertError,
  } = useConvertOpportunityToSQ();

  // Simpan initial value untuk deteksi perubahan
  const initialProductInterest = useRef(
    opportunity.product_interest
      ? opportunity.product_interest
        .split(",")
        .map((name: string) => ({ label: name, value: name }))
      : [],
  );
  const initialPotentialValue = useRef(
    Number(opportunity.potential_value || 0),
  );
  const initialNote = useRef(opportunity.note || opportunity.notes || "");

  const session = useSession();
  const currentUser = session?.user;
  const isManager = isManagerSales(currentUser);
  const isSuper = isSuperuser(currentUser);
  const isSalesRole = isSales(currentUser);

  // Cek perubahan
  const isProductInterestChanged =
    JSON.stringify(productInterest) !==
    JSON.stringify(initialProductInterest.current);
  const isPotentialValueChanged =
    Number(formData.potential_value) !== Number(initialPotentialValue.current);
  const isNoteChanged =
    (formData.note || formData.notes || "") !== initialNote.current;

  const isAssignmentChanged = Number(formData.assigned_to) !== Number(opportunity.assigned_to);
  const isChanged =
    isProductInterestChanged || isPotentialValueChanged || isNoteChanged || (isManager && isAssignmentChanged);

  const isEditable = !isManager && canEditOpportunity(formData.status);
  const isProspecting = formData.status === OPPORTUNITY_STATUSES.PROSPECTING;

  // Rule: Sales hanya bisa convert jika status Prospecting DAN dia adalah owner/assigned
  const isOwnerOrAssigned = Number(formData.id_user) === Number(currentUser?.id) || Number(formData.assigned_to) === Number(currentUser?.id);
  const showConvertButton = isSalesRole && canConvertToSQ(formData.status) && (isSuper || isOwnerOrAssigned);

  const isLost = formData.status === OPPORTUNITY_STATUSES.LOST;
  const isSQ = formData.status === OPPORTUNITY_STATUSES.SQ;

  // Rule: Tombol Save aktif hanya saat Prospecting (untuk Sales) ATAU jika Manager ada perubahan (status/assign)
  const canSave = (isChanged && (isProspecting && !isManager)) || (isManager && isChanged);
  // Handler update
  const handleUpdate = async () => {
    setLoading(true);
    try {
      // Build payload dynamically based on role/permissions
      const payload: any = {};

      if (isManager && !isSuper) {
        // Manager hanya boleh update assignment
        payload.assigned_to = formData.assigned_to;
      } else {
        // Sales/Super boleh update data utama
        payload.product_interest = productInterest.map((p) => p.value).join(",");
        payload.potential_value = formData.potential_value;
        payload.note = formData.note || formData.notes || "";

        // Superuser juga boleh update assignment jika diubah
        if (isSuper) {
          payload.assigned_to = formData.assigned_to;
        }
      }

      const res = await fetch(`/api/opportunities/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.message || "Gagal update data");
        return;
      }
      toast.success("Opportunity updated!");
      onSuccess?.();
      // Update initial value agar tombol update hilang setelah sukses
      initialProductInterest.current = [...productInterest];
      initialPotentialValue.current = Number(formData.potential_value);
      initialNote.current = formData.note || formData.notes || "";
    } catch (err) {
      toast.error("Terjadi kesalahan saat update data");
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk konfirmasi status
  const handleStatusChange = (status: string) => {
    setPendingStatus(status);
    setDialogOpen(true);
  };

  const handleClose = () => {
    router.push("/crm/opportunities");
  };

  // Handler untuk submit perubahan status
  const handleConfirmStatus = async () => {
    if (!pendingStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pendingStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Tampilkan pesan error dari server jika ada, jika tidak tampilkan default
        toast.error(data?.message || "Gagal update status (Unauthorized)");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        status: pendingStatus,
      }));
      onSuccess?.();
    } catch (err) {
      toast.error("Terjadi kesalahan saat update status");
    } finally {
      setLoading(false);
      setDialogOpen(false);
      setPendingStatus(null);
    }
  };

  // Handler for Convert to SQ (unified with table)
  const handleConvertToSQ = async () => {
    if (!formData.id) return;
    setConvertDialogOpen(false);
    await convert(formData.id, null);
    // No redirect here; handled by the hook
    onSuccess?.();
  };

  // Ubah products menjadi array nama produk
  const productOptions = products.map((p) => ({
    label: p.name,
    value: p.name,
  }));

  return (
    <Card className="w-full mx-auto dark:bg-gray-800">
      <CardContent className="pt-6">
        {/* Convert to SQ Dialog (same as table) */}
        <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert to SQ</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p>
                Are you sure you want to convert this opportunity to
                SQ/Quotation?
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConvertDialogOpen(false)}
                disabled={convertLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleConvertToSQ}
                disabled={convertLoading}
              >
                {convertLoading ? "Converting..." : "Yes, Convert"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                    ? "Prospecting"
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
                  variant="default"
                  size="sm"
                  onClick={() =>
                    handleStatusChange(OPPORTUNITY_STATUSES.PROSPECTING)
                  }
                  disabled={loading}
                >
                  Set Prospecting
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
                  value={formData.sales_pic || formData.id_user_name || ""}
                  disabled
                  className="bg-muted/50"
                />
              </div>
              {isManager ? (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Assigned To
                  </label>
                  <Select
                    value={formData.assigned_to?.toString() || ""}
                    onValueChange={(val) =>
                      setFormData(prev => ({ ...prev, assigned_to: val ? Number(val) : null }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Sales" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesUsers.map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : formData.assigned_to_name ? (
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
              ) : null}
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
                <WindowedSelect
                  windowThreshold={100}
                  isMulti
                  name="product_interest"
                  options={productOptions}
                  value={productInterest}
                  isDisabled={(isManager && !isSuper) || !isFieldEditableForStatus("product_interest", formData.status) || loading}
                  onChange={(newValue) =>
                    setProductInterest(Array.isArray(newValue) ? newValue : [])
                  }
                  placeholder="Select products"
                  classNamePrefix="react-select"
                  styles={{
                    ...selectStyles,
                    container: (provided) => ({
                      ...provided,
                      width: "100%",
                    }),
                    control: (provided) => ({
                      ...provided,
                      width: "100%",
                      minWidth: "100%",
                    }),
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Potential Value
                </label>
                <Input
                  type="text"
                  value={
                    formData.potential_value
                      ? formatCurrency(Number(formData.potential_value))
                      : ""
                  }
                  onChange={(e) => {
                    // Ambil angka saja dari input
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      potential_value: raw ? Number(raw) : 0,
                    }));
                  }}
                  className="font-bold"
                  placeholder="Masukkan nilai potensial"
                  disabled={(isManager && !isSuper) || !isFieldEditableForStatus("potential_value", formData.status) || loading}
                />
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                  rows={5}
                  className="resize-none"
                  disabled={(isManager && !isSuper) || !isFieldEditableForStatus("note", formData.status) || loading}
                  placeholder="Catatan tambahan (opsional)"
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
          {canSave && (
            <Button
              type="button"
              variant="default"
              onClick={handleUpdate}
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="min-w-[100px]"
          >
            Close
          </Button>
          {showConvertButton && (
            <Button
              type="button"
              variant="default"
              onClick={() => setConvertDialogOpen(true)}
              disabled={convertLoading}
            >
              Convert to SQ
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
