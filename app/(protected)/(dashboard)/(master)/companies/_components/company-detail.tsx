"use client";

import { formatDate } from "@/utils/formatDate";
import type { company } from "@/types/models";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CompanyDetail({ company }: { company: company }) {
  return (
    <div className="w-full mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {company.company_name}
            {company.company_level?.level_name && (
              <Badge variant="secondary" className="ml-2">
                {company.company_level.level_name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Level</div>
              <div className="font-medium">
                {company.company_level?.level_name || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Created At</div>
              <div className="font-medium">
                {formatDate(company.created_at)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Address</div>
              <div className="font-medium">{company.address || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">NPWP</div>
              <div className="font-medium">{company.npwp || "-"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">Note</div>
              <div className="font-medium">{company.note || "-"}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Customers</div>
            {company.customers && company.customers.length > 0 ? (
              <ul className="list-disc ml-6">
                {company.customers.map((c) => (
                  <li key={c.id} className="text-sm">
                    <span className="font-semibold">{c.customer_name}</span>
                    {c.email && (
                      <span className="text-gray-500 ml-1">({c.email})</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-400 italic">
                data customer belum ada
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Link href={`/companies/${company.id}/edit`} passHref>
              <Button
                variant="outline"
                className="bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Edit
              </Button>
            </Link>
            <Link href="/companies" passHref>
              <Button variant="secondary">Back</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
