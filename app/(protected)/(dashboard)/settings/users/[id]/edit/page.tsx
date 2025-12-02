import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import EditUserForm from "@/components/user/edit-user-form";
import { getUserById, getAllRoles } from "@/app/actions/user-actions";
import { notFound } from "next/navigation";

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  try {
    const [user, roles] = await Promise.all([
      getUserById(parseInt(params.id)),
      getAllRoles(),
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
