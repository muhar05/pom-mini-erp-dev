"use client";

import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRoles } from "@/hooks/users/useRoles";
import { useCreateUser } from "@/hooks/users/useCreateUser";

export default function NewUserPage() {
  const { roles, isLoading: rolesLoading, error: rolesError } = useRoles();
  const { isLoading, error, createUser } = useCreateUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const userData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role_id: formData.get("role_id") as string,
    };

    await createUser(userData);
  };

  return (
    <>
      <DashboardBreadcrumb
        title="Add New User"
        text="Create a new user account"
      />

      {/* Back Button */}
      <div className="mb-6">
        <Link href="/settings/users">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Button>
        </Link>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          {(error || rolesError) && (
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error || rolesError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter full name"
                required
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                required
                disabled={isLoading}
              />
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                name="role_id"
                required
                disabled={isLoading || rolesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      rolesLoading ? "Loading roles..." : "Select user role"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> User will login using OTP sent to their
                email address. No password required.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? "Creating..." : "Create User"}
              </Button>
              <Link href="/settings/users">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
