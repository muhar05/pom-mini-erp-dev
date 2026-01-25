import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { getOpportunityByIdAction } from "@/app/actions/opportunities";
import OpportunityForm from "../../_components/opportunity-form";
import { getAllProductsAction } from "@/app/actions/products";
import { getAllUsersAction } from "@/app/actions/users";
import { auth } from "@/auth";
import { isSales, isManagerSales, isSuperuser } from "@/utils/userHelpers";

interface EditOpportunityPageProps {
  params: { id: string };
}

export default async function EditOpportunityPage(
  props: EditOpportunityPageProps,
) {
  const { params } = await props;
  const session = await auth();
  const opportunity = await getOpportunityByIdAction(Number(params.id));
  const products = await getAllProductsAction();
  const allUsers = await getAllUsersAction();

  // Filter users yang bisa di-assign (Hanya Sales)
  const salesUsers = allUsers.filter((u: any) =>
    isSales(u)
  ).map((u: any) => ({
    id: Number(u.id),
    name: u.name || "Unknown User",
  }));

  return (
    <>
      <DashboardBreadcrumb
        title={`Edit Opportunity: ${opportunity.opportunity_no}`}
        text="Update opportunity information"
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Edit Opportunity Information
          </h2>
          <OpportunityForm
            mode="edit"
            opportunity={opportunity}
            products={products}
            salesUsers={salesUsers}
          />
        </div>
      </div>
    </>
  );
}
