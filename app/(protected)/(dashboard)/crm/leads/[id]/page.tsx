import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { getLeadByIdAction } from "@/app/actions/leads";
import { formatDate } from "@/utils/formatDate";
import { formatStatusDisplay } from "@/utils/formatStatus";
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface LeadDetailPageProps {
  params: { id: string };
}

// Helper function to get status badge styling
function getStatusBadgeClass(status: string | null | undefined): string {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case "new":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "contacted":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "qualified":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "proposal":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "negotiation":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "closed_won":
      return "bg-green-100 text-green-800 border-green-200";
    case "closed_lost":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadByIdAction(Number(id));

  return (
    <>
      <DashboardBreadcrumb
        title={`Lead: ${lead.lead_name}`}
        text="View lead details"
      />

      <div className="flex gap-2 mb-6">
        <Link href="/crm/leads">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
        </Link>
        <Link href={`/crm/leads/${lead.id}/edit`}>
          <Button size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Lead
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Lead Name
              </label>
              <p className="text-sm">{lead.lead_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Contact Person
              </label>
              <p className="text-sm">{lead.contact || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm">{lead.email || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-sm">{lead.phone || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Company
              </label>
              <p className="text-sm">{lead.company || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Location
              </label>
              <p className="text-sm">{lead.location || "-"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Lead Details</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <p className="text-sm">
                {lead.type ? formatStatusDisplay(lead.type) : "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Source
              </label>
              <p className="text-sm">
                {lead.source ? formatStatusDisplay(lead.source) : "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                    lead.status
                  )}`}
                >
                  {formatStatusDisplay(lead.status)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Product Interest
              </label>
              <p className="text-sm">{lead.product_interest || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created At
              </label>
              <p className="text-sm">{formatDate(lead.created_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Reference No
              </label>
              <p className="text-sm">{lead.reference_no || "-"}</p>
            </div>
          </div>
        </div>

        {lead.note && (
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <p className="text-sm whitespace-pre-wrap">{lead.note}</p>
          </div>
        )}

        {/* User Information if available */}
        {(lead.users_leads_assigned_toTousers ||
          lead.users_leads_id_userTousers) && (
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lead.users_leads_assigned_toTousers && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Assigned To
                  </label>
                  <p className="text-sm">
                    {lead.users_leads_assigned_toTousers.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {lead.users_leads_assigned_toTousers.email}
                  </p>
                </div>
              )}
              {lead.users_leads_id_userTousers && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created By
                  </label>
                  <p className="text-sm">
                    {lead.users_leads_id_userTousers.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {lead.users_leads_id_userTousers.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
