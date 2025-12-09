"use client";

import React, { useState, useTransition } from "react";
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
import { users, roles } from "@/types/models";
import { updateUserAction } from "@/app/actions/users";
import { useRouter } from "next/navigation";

interface EditUserFormProps {
  user: users;
  roles: roles[];
}

export default function EditUserForm({ user, roles }: EditUserFormProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateUserAction(formData);
        router.push(`/settings/users/${user.id}`);
      } catch (error: any) {
        setError(error.message || "Failed to update user");
      }
    });
  };

  return (
    <>
      {/* Back Button */}
      <div className="mb-6">
        <Link href={`/settings/users/${user.id}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to User Details
          </Button>
        </Link>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit User Information</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="id" value={user.id} />

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name}
                placeholder="Enter full name"
                required
                disabled={isPending}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                placeholder="Enter email address"
                required
                disabled={isPending}
              />
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                name="role_id"
                defaultValue={user.role_id?.toString()}
                required
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
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

            {/* Current Role Display */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Current Role:</strong>{" "}
                {user.roles?.role_name || "No Role"}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Note:</strong> User will continue to login using OTP
                sent to their email address.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isPending ? "Updating..." : "Update User"}
              </Button>
              <Link href={`/settings/users/${user.id}`}>
                <Button type="button" variant="outline" disabled={isPending}>
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
