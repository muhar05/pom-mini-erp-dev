"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateCustomer } from "@/hooks/customers/useCreateCustomer";
import { useUpdateCustomer } from "@/hooks/customers/useUpdateCustomer";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Company = {
  id: number;
  company_name: string;
};

type Customer = {
  id?: string;
  customer_name: string;
  email: string;
  phone: string;
  contact_person: string;
  address: string;
  customer_type: string;
  status: string;
  company_id?: number;
};

interface CustomerFormProps {
  mode: "add" | "edit";
  customer?: Customer;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function CustomerForm({
  mode,
  customer,
  onClose,
  onSuccess,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<Customer>({
    customer_name: customer?.customer_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    contact_person: customer?.contact_person || "",
    address: customer?.address || "",
    customer_type: customer?.customer_type || "INDIVIDUAL", // Default ke Individual
    status: customer?.status || "active",
    company_id: customer?.company_id,
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const { createCustomer, loading: creating } = useCreateCustomer();
  const { updateCustomer, loading: updating } = useUpdateCustomer();
  const loading = creating || updating;
  const router = useRouter();

  // Fetch companies
  useEffect(() => {
    setLoadingCompanies(true);
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data.data || data))
      .finally(() => setLoadingCompanies(false));
  }, []);

  const handleInputChange = (
    field: keyof Customer,
    value: string | number | undefined
  ) => {
    setFormData((prev) => {
      // Jika field company_id dan value valid, set customer_type ke COMPANY
      if (field === "company_id") {
        if (value !== undefined && value !== "none") {
          return {
            ...prev,
            company_id: Number(value),
            customer_type: "COMPANY",
          };
        } else {
          // Jika tidak memilih company, kembalikan customer_type ke INDIVIDUAL
          return {
            ...prev,
            company_id: undefined,
            customer_type: "INDIVIDUAL",
          };
        }
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare payload
    const payload = {
      customer_name: formData.customer_name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      note: "",
      type: formData.customer_type,
      company_id: formData.company_id ? Number(formData.company_id) : undefined,
    };

    try {
      if (mode === "add") {
        await createCustomer(payload);
        toast.success("Customer created successfully");
      } else {
        await updateCustomer(customer?.id!, payload);
        toast.success("Customer updated successfully");
      }
      onSuccess?.();
      onClose?.();
      router.push("/customers");
    } catch (error: any) {
      toast.error(error.message || "Failed to save customer");
    }
  };

  return (
    <Card className="w-full mx-auto bg-gray-800">
      <CardHeader>
        <CardTitle>
          {mode === "add" ? "Add New Customer" : "Edit Customer"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    handleInputChange("customer_name", e.target.value)
                  }
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) =>
                    handleInputChange("contact_person", e.target.value)
                  }
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_type">Customer Type *</Label>
                <Select
                  value={formData.customer_type}
                  onValueChange={(value) =>
                    handleInputChange("customer_type", value)
                  }
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPANY">Company</SelectItem>
                    <SelectItem value="SME">SME</SelectItem>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id">Company</Label>
                <Select
                  value={
                    formData.company_id ? String(formData.company_id) : "none"
                  }
                  onValueChange={(value) =>
                    handleInputChange(
                      "company_id",
                      value === "none" ? undefined : Number(value)
                    )
                  }
                  disabled={loadingCompanies}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Company</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : mode === "add"
                ? "Create Customer"
                : "Update Customer"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
