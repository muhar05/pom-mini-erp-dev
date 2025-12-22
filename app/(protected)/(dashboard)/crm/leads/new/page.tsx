import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LeadForm from "../_components/lead-form";
import { createLeadAction } from "@/app/actions/leads";
import { getAllProductsAction } from "@/app/actions/products";
import { getAllCustomersAction } from "@/app/actions/customers";
import { getAllCompaniesAction } from "@/app/actions/companies";
import type { customers, companies } from "@/types/models";

export default async function NewLeadPage() {
  const products = (await getAllProductsAction()).map((p) => ({
    ...p,
    price: p.price ? Number(p.price) : null,
  }));

  // getAllCustomersAction returns { data: customers[] }
  // const customersResult = await getAllCustomersAction();
  // const customers = Array.isArray(customersResult)
  //   ? customersResult.map((c) => ({
  //       id: c.id,
  //       customer_name: c.customer_name,
  //       company: c.company
  //         ? { company_name: c.company.company_name ?? c.company.name }
  //         : undefined, // never null
  //     }))
  //   : customersResult.data.map((c: any) => ({
  //       id: c.id,
  //       customer_name: c.customer_name,
  //       company: c.company
  //         ? { company_name: c.company.company_name ?? c.company.name }
  //         : undefined,
  //     }));

  // getAllCompaniesAction returns companies[]
  // const rawCompaniesResult = (await getAllCompaniesAction()) as
  //   | { data?: any[] }
  //   | any[];
  // const rawCompanies = Array.isArray(rawCompaniesResult)
  //   ? rawCompaniesResult
  //   : rawCompaniesResult.data ?? [];

  // const companies = rawCompanies.map((c: any) => ({
  //   id: c.id,
  //   company_name: c.company_name, // use company_name, not name
  // }));

  return (
    <>
      <DashboardBreadcrumb
        title="Add New Lead"
        text="Create a new lead entry"
      />
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Lead Information</h2>
          <LeadForm
            mode="create"
            onSubmit={createLeadAction}
            products={products}
            // customers={customers}
            // companies={companies}
          />
        </div>
      </div>
    </>
  );
}
