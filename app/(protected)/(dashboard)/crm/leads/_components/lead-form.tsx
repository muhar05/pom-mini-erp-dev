"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leads } from "@/types/models";
import { useRouter } from "next/navigation";
import { createLeadSchema, updateLeadSchema } from "@/lib/schemas";
import { ZodError } from "zod";
import toast from "react-hot-toast";
import { formatStatusDisplay } from "@/utils/formatStatus";
import dynamic from "next/dynamic";
import { LEAD_STATUS_OPTIONS } from "@/utils/statusHelpers";
import {
  TYPE_OPTIONS,
  SOURCE_OPTIONS,
  PROVINCES,
  LOCATION_OPTIONS,
  findOptionValue,
  selectStyles,
} from "@/utils/leadFormHelpers";

interface LeadFormProps {
  mode: "create" | "edit";
  lead?: leads;
  onSubmit: (
    formData: FormData
  ) => Promise<void> | Promise<{ success: boolean; message: string }>;
  products: Array<{ id: number; name: string }>;
}

interface FormErrors {
  [key: string]: string;
}

// Ganti konstanta STATUS_OPTIONS:
const STATUS_OPTIONS = LEAD_STATUS_OPTIONS;

const WindowedSelect = dynamic(() => import("react-windowed-select"), {
  ssr: false,
});

export default function LeadForm({
  mode,
  lead,
  onSubmit,
  products,
}: // customers,
// companies,
LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [productInterest, setProductInterest] = useState<
    Array<{ label: string; value: string }>
  >(
    lead?.product_interest
      ? lead.product_interest
          .split(",")
          .map((name: string) => ({ label: name, value: name }))
      : []
  );
  const [selectedLocation, setSelectedLocation] = useState<string>(
    lead?.location || ""
  );
  const [foreignCountry, setForeignCountry] = useState<string>("");
  const [selectedCustomers, setSelectedCustomers] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [selectedCompany, setSelectedCompany] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const router = useRouter();

  // Ubah products menjadi array nama produk
  const productOptions = products.map((p) => ({
    label: p.name,
    value: p.name,
  }));

  // Client-side validation
  const validateForm = (formData: FormData): boolean => {
    const data: Record<string, any> = {};

    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue === "") {
          data[key] = undefined;
        } else {
          // Handle numeric fields
          if (key === "id_user" || key === "assigned_to") {
            const numValue = Number(trimmedValue);
            data[key] = isNaN(numValue) ? undefined : numValue;
          } else {
            data[key] = trimmedValue;
          }
        }
      } else {
        data[key] = value;
      }
    }

    try {
      // Use appropriate schema based on mode
      if (mode === "create") {
        createLeadSchema.parse(data);
      } else {
        updateLeadSchema.parse(data);
      }
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof FormErrors;
          newErrors[path] = err.message;
        });
        setFormErrors(newErrors);
        return false;
      }
      return false;
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      if (mode === "edit" && lead) {
        formData.append("id", lead.id.toString());
      }

      // Set product_interest as comma separated string
      formData.set(
        "product_interest",
        productInterest.map((p) => p.value).join(",")
      );

      // Set customers as comma separated string
      formData.set(
        "customers",
        selectedCustomers.map((c) => c.value).join(",")
      );
      formData.set("company_id", selectedCompany?.value ?? "");

      // Ensure status is not empty: set sensible default if missing
      const statusValue = (formData.get("status") as string) ?? "";
      if (statusValue.trim() === "") {
        const defaultStatus = mode === "create" ? "new" : lead?.status ?? "new";
        formData.set("status", defaultStatus);
      }

      // Location and country handling
      formData.set("location", selectedLocation);
      if (selectedLocation === "luar_negeri") {
        formData.set("country_name", foreignCountry);
      } else {
        formData.delete("country_name");
      }

      // Client-side validation
      if (!validateForm(formData)) {
        setLoading(false);
        return;
      }

      // Get the lead name for success message
      const leadName = formData.get("lead_name") as string;

      // Show loading toast
      const loadingToastId = toast.loading(
        mode === "create" ? "Creating lead..." : "Updating lead..."
      );

      await onSubmit(formData);

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Show success toast with custom styling
      toast.success(
        mode === "create"
          ? `Lead "${leadName}" created successfully!`
          : `Lead "${leadName}" updated successfully!`,
        {
          duration: 4000,
          style: {
            background: "#10B981",
            color: "#fff",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        }
      );

      // Short delay before redirect for better UX
      setTimeout(() => {
        router.push("/crm/leads");
      }, 1500);
    } catch (error) {
      console.error("Error submitting form:", error);

      // Handle specific error types
      if (error instanceof Error) {
        // Don't show NEXT_REDIRECT as user error
        if (error.message === "NEXT_REDIRECT") {
          return; // Let the redirect happen
        }

        // Show error toast
        toast.error(error.message, {
          duration: 5000,
          style: {
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });

        setError(error.message);
      } else {
        const errorMsg = "An error occurred while submitting the form";
        toast.error(errorMsg, {
          duration: 5000,
          style: {
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
          },
        });
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="lead_name">Lead Name *</Label>
          <Input
            id="lead_name"
            name="lead_name"
            defaultValue={lead?.lead_name || ""}
            required
            disabled={loading}
            maxLength={150}
            className={formErrors.lead_name ? "border-red-500" : ""}
            placeholder="Masukkan nama lead"
          />
          {formErrors.lead_name && (
            <p className="text-sm text-red-500">{formErrors.lead_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Contact Person</Label>
          <Input
            id="contact"
            name="contact"
            defaultValue={lead?.contact || ""}
            disabled={loading}
            maxLength={150}
            className={formErrors.contact ? "border-red-500" : ""}
            placeholder="Masukkan nama kontak"
          />
          {formErrors.contact && (
            <p className="text-sm text-red-500">{formErrors.contact}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={lead?.email || ""}
            disabled={loading}
            maxLength={150}
            className={formErrors.email ? "border-red-500" : ""}
            placeholder="Masukkan email"
          />
          {formErrors.email && (
            <p className="text-sm text-red-500">{formErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={lead?.phone || ""}
            disabled={loading}
            maxLength={50}
            className={formErrors.phone ? "border-red-500" : ""}
            placeholder="e.g., +62 812 3456 7890"
          />
          {formErrors.phone && (
            <p className="text-sm text-red-500">{formErrors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            defaultValue={lead?.company || ""}
            disabled={loading}
            maxLength={150}
            className={formErrors.company ? "border-red-500" : ""}
            placeholder="Masukkan nama perusahaan"
          />
          {formErrors.company && (
            <p className="text-sm text-red-500">{formErrors.company}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Lokasi *</Label>
          <Select
            name="location"
            value={selectedLocation}
            onValueChange={(val) => setSelectedLocation(val)}
            disabled={loading}
            required
          >
            <SelectTrigger
              className={`w-full ${
                formErrors.location ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Pilih lokasi" />
            </SelectTrigger>
            <SelectContent>
              {LOCATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedLocation === "luar_negeri" && (
            <div className="mt-2">
              <Label htmlFor="country_name" className="mb-2">
                Nama Negara
              </Label>
              <Input
                id="country_name"
                name="country_name"
                value={foreignCountry}
                onChange={(e) => setForeignCountry(e.target.value)}
                placeholder="Contoh: Singapore"
                disabled={loading}
                required
                className="w-full"
              />
            </div>
          )}
          {formErrors.location && (
            <p className="text-sm text-red-500">{formErrors.location}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          {(() => {
            let defaultVal = findOptionValue(
              lead?.type ?? "",
              TYPE_OPTIONS,
              ""
            );
            const raw = lead?.type;
            if (!defaultVal && raw) {
              defaultVal = String(raw);
            }

            const hasMatch =
              !!raw &&
              TYPE_OPTIONS.some(
                (o) =>
                  o.value.toLowerCase() === String(raw).toLowerCase() ||
                  o.label.toLowerCase() === String(raw).toLowerCase()
              );
            const extraOption =
              !hasMatch && raw
                ? {
                    value: String(raw),
                    label: formatStatusDisplay(String(raw)),
                  }
                : null;

            return (
              <Select name="type" defaultValue={defaultVal} disabled={loading}>
                <SelectTrigger
                  className={`w-full ${
                    formErrors.type ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {extraOption && (
                    <SelectItem
                      key={`extra-type-${extraOption.value}`}
                      value={extraOption.value}
                    >
                      {extraOption.label}
                    </SelectItem>
                  )}
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })()}
          {formErrors.type && (
            <p className="text-sm text-red-500">{formErrors.type}</p>
          )}
        </div>

        {/* Source */}
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          {(() => {
            let defaultVal = findOptionValue(
              lead?.source ?? "",
              SOURCE_OPTIONS,
              ""
            );
            const raw = lead?.source;
            if (!defaultVal && raw) {
              defaultVal = String(raw);
            }

            const hasMatch =
              !!raw &&
              SOURCE_OPTIONS.some(
                (o) =>
                  o.value.toLowerCase() === String(raw).toLowerCase() ||
                  o.label.toLowerCase() === String(raw).toLowerCase()
              );
            const extraOption =
              !hasMatch && raw
                ? {
                    value: String(raw),
                    label: formatStatusDisplay(String(raw)),
                  }
                : null;

            return (
              <Select
                name="source"
                defaultValue={defaultVal}
                disabled={loading}
              >
                <SelectTrigger
                  className={`w-full ${
                    formErrors.source ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {extraOption && (
                    <SelectItem
                      key={`extra-source-${extraOption.value}`}
                      value={extraOption.value}
                    >
                      {extraOption.label}
                    </SelectItem>
                  )}
                  {SOURCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })()}
          {formErrors.source && (
            <p className="text-sm text-red-500">{formErrors.source}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          {(() => {
            let defaultVal = findOptionValue(
              lead?.status ?? (mode === "create" ? "new" : ""),
              STATUS_OPTIONS,
              mode === "create" ? "new" : ""
            );
            const raw = lead?.status;
            if (!defaultVal && raw) {
              defaultVal = String(raw);
            }

            const hasMatch =
              !!raw &&
              STATUS_OPTIONS.some(
                (o) =>
                  o.value.toLowerCase() === String(raw).toLowerCase() ||
                  o.label.toLowerCase() === String(raw).toLowerCase()
              );
            const extraOption =
              !hasMatch && raw
                ? {
                    value: String(raw),
                    label: formatStatusDisplay(String(raw)),
                  }
                : null;

            return (
              <Select
                name="status"
                defaultValue={defaultVal}
                disabled={loading}
              >
                <SelectTrigger
                  className={`w-full ${
                    formErrors.status ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {extraOption && (
                    <SelectItem
                      key={`extra-status-${extraOption.value}`}
                      value={extraOption.value}
                    >
                      {extraOption.label}
                    </SelectItem>
                  )}
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })()}
          {formErrors.status && (
            <p className="text-sm text-red-500">{formErrors.status}</p>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="product_interest">Product Interest</Label>
          <div className="w-full">
            <WindowedSelect
              windowThreshold={100}
              isMulti
              name="product_interest"
              options={productOptions}
              value={productInterest}
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
          {formErrors.product_interest && (
            <p className="text-sm text-red-500">
              {formErrors.product_interest}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Notes</Label>
        <Textarea
          id="note"
          name="note"
          rows={4}
          defaultValue={lead?.note || ""}
          disabled={loading}
          maxLength={1000}
          className={formErrors.note ? "border-red-500" : ""}
          placeholder="Catatan tambahan (opsional)"
        />
        {formErrors.note && (
          <p className="text-sm text-red-500">{formErrors.note}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Create Lead"
            : "Update Lead"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/crm/leads")}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
