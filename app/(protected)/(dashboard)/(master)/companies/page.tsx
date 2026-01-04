"use client";

import { useEffect, useState } from "react";
import CompaniesClient from "./_components/companies-client";
import { getAllCompaniesAction } from "@/app/actions/companies";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { serializeDecimal } from "@/utils/formatDecimal";

export default function CompanyPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAllCompaniesAction()
      .then((data) => {
        if (mounted)
          setCompanies(
            data.map((company: any) => {
              return {
                ...serializeDecimal(company),
                company_level: serializeDecimal(company.company_level),
                customers: Array.isArray(company.customers)
                  ? company.customers.map(serializeDecimal)
                  : company.customers,
              };
            })
          );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <>
        <DashboardBreadcrumb
          title="Company List"
          text="Manage and monitor your companies"
        />
        <div className="flex justify-center items-center p-16 w-full h-full">
          <div className="flex flex-col w-full justify-center items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return <CompaniesClient companies={companies} />;
}
