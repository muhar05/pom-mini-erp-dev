import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import EditUserForm from "@/app/(protected)/(dashboard)/settings/users/_components/edit-user-form";
import { getUserByIdAction, getAllRolesAction } from "@/app/actions/users";
import { notFound } from "next/navigation";

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  try {
    const [user, roles] = await Promise.all([
      getUserByIdAction(parseInt(params.id)),
      getAllRolesAction(),
    ]);

    if (!user) {
      notFound();
    }

    return (
      <>
        <DashboardBreadcrumb
          title="Edit User"
          text="Update user account information"
        />

        <EditUserForm user={user} roles={roles} />
      </>
    );
  } catch (error) {
    notFound();
  }
}
