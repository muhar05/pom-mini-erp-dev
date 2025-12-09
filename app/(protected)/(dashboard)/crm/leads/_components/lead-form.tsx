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
import { Lead } from "@/types/models";
import { useRouter } from "next/navigation";
import { createLeadSchema, updateLeadSchema } from "@/lib/schemas";
import { ZodError } from "zod";
import toast from "react-hot-toast";
import { STATUS_OPTIONS, formatStatusDisplay } from "@/utils/formatStatus";

interface LeadFormProps {
  mode: "create" | "edit";
  lead?: Lead;
  onSubmit: (
    formData: FormData
  ) => Promise<void> | Promise<{ success: boolean; message: string }>;
}

interface FormErrors {
  [key: string]: string;
}

export default function LeadForm({ mode, lead, onSubmit }: LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const router = useRouter();

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
        const errors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
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
          />
          {formErrors.company && (
            <p className="text-sm text-red-500">{formErrors.company}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={lead?.location || ""}
            disabled={loading}
            maxLength={150}
            className={formErrors.location ? "border-red-500" : ""}
          />
          {formErrors.location && (
            <p className="text-sm text-red-500">{formErrors.location}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            name="type"
            defaultValue={lead?.type || ""}
            disabled={loading}
          >
            <SelectTrigger className={formErrors.type ? "border-red-500" : ""}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="government">Government</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.type && (
            <p className="text-sm text-red-500">{formErrors.type}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Select
            name="source"
            defaultValue={lead?.source || ""}
            disabled={loading}
          >
            <SelectTrigger
              className={formErrors.source ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="cold_call">Cold Call</SelectItem>
              <SelectItem value="event">Event</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.source && (
            <p className="text-sm text-red-500">{formErrors.source}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            defaultValue={lead?.status || "new"}
            disabled={loading}
          >
            <SelectTrigger
              className={formErrors.status ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.status && (
            <p className="text-sm text-red-500">{formErrors.status}</p>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="product_interest">Product Interest</Label>
          <Input
            id="product_interest"
            name="product_interest"
            defaultValue={lead?.product_interest || ""}
            disabled={loading}
            maxLength={200}
            className={formErrors.product_interest ? "border-red-500" : ""}
          />
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
