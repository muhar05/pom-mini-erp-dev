"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Mail,
  Calendar,
  DollarSign,
  Building2,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Opportunity } from "@/types/models";
import { updateOpportunityAction } from "@/app/actions/opportunities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  LEAD_STATUS_OPTIONS,
  OPPORTUNITY_STATUS_OPTIONS,
} from "@/utils/statusHelpers";

interface OpportunityDetailClientProps {
  opportunity: Opportunity;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "converted":
      return "bg-green-100 text-green-800";
    case "qualified":
    case "opportunityqualified":
    case "leadqualified":
      return "bg-blue-100 text-blue-800";
    case "lost":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStageBadgeClass(stage: string): string {
  switch (stage?.toLowerCase()) {
    case "converted":
      return "bg-green-100 text-green-800";
    case "qualified":
    case "opportunityqualified":
    case "leadqualified":
      return "bg-blue-100 text-blue-800";
    case "lost":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusFlow() {
  // Gabungkan lead dan opportunity status
  return [...LEAD_STATUS_OPTIONS, ...OPPORTUNITY_STATUS_OPTIONS];
}

export default function OpportunityDetailClient({
  opportunity,
}: OpportunityDetailClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  // Open dialog and set which status to update
  const openConfirmDialog = (status: string) => {
    setPendingStatus(status);
    setDialogOpen(true);
  };

  // Handle confirm in dialog
  const handleConfirm = async () => {
    if (!pendingStatus) return;
    setIsLoading(true);
    try {
      await fetch(`/api/opportunities/${opportunity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pendingStatus }),
      });
      setDialogOpen(false);
      setPendingStatus(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Status flow indicator
  const statusFlow = getStatusFlow();

  return (
    <div className="w-full mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {opportunity.opportunity_no}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Opportunity Details</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={getStageBadgeClass(opportunity.stage)}>
                {opportunity.stage === "opp_sq" ? "SQ" : opportunity.stage}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Back Button */}
          <div className="mb-6">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Opportunity Information */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">
                Opportunity Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Opportunity Number</p>
                    <p className="font-medium">{opportunity.opportunity_no}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Stage</p>
                    <Badge className={getStageBadgeClass(opportunity.stage)}>
                      {opportunity.stage === "opp_sq"
                        ? "SQ"
                        : opportunity.stage}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium">{opportunity.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Customer Email</p>
                    <p className="font-medium">
                      {opportunity.customer_email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Customer Type</p>
                    <p className="font-medium">{opportunity.type || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{opportunity.company || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Sales PIC</p>
                    <p className="font-medium">
                      {opportunity.sales_pic || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Total Harga</p>
                    <p className="font-medium text-lg">
                      {opportunity.potential_value.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Input</p>
                    <p className="font-medium">{opportunity.created_at}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Update Section */}
            {opportunity.status?.toLowerCase() !== "lost" && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Update Status</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Current Status:
                      </p>
                      <Badge
                        className={getStatusBadgeClass(opportunity.status)}
                        variant="secondary"
                      >
                        {opportunity.status === "opp_sq"
                          ? "SQ"
                          : opportunity.status}
                      </Badge>
                    </div>
                    <div className="flex gap-3">
                      {/* Show Qualified button if current status is LeadQualified */}
                      {opportunity.status?.toLowerCase() ===
                        "leadqualified" && (
                        <Button
                          size="sm"
                          variant="default"
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                          onClick={() => openConfirmDialog("Qualified")}
                          disabled={isLoading}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Set as Qualified
                        </Button>
                      )}

                      {/* Show Lost button for all valid statuses */}
                      {(opportunity.status?.toLowerCase() === "prospecting" ||
                        opportunity.status?.toLowerCase() === "qualified" ||
                        opportunity.status?.toLowerCase() ===
                          "leadqualified") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex items-center gap-2"
                          onClick={() => openConfirmDialog("Lost")}
                          disabled={isLoading}
                        >
                          <XCircle className="w-4 h-4" />
                          Mark as Lost
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status flow indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Status Flow:</p>
                    <div className="flex items-center gap-2 text-sm">
                      {statusFlow.map((status) => (
                        <span
                          key={status.value}
                          className={`px-2 py-1 rounded ${
                            opportunity.status === status.value
                              ? "bg-blue-100 text-blue-800 font-semibold"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status.value === "opp_sq" ? "SQ" : status.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Final status message for Lost opportunities */}
            {opportunity.status?.toLowerCase() === "lost" && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Status</h3>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-medium">
                      This opportunity has been marked as Lost and cannot be
                      updated further.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog for confirmation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingStatus === "Lost"
                ? "Confirm Mark as Lost"
                : "Confirm Status Change"}
            </DialogTitle>
            <DialogDescription>
              {pendingStatus === "Lost"
                ? "Are you sure you want to mark this opportunity as Lost? This action cannot be undone."
                : `Are you sure you want to change status to ${
                    pendingStatus === "Qualified"
                      ? "OpportunityQualified"
                      : pendingStatus
                  }?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              variant={pendingStatus === "Lost" ? "destructive" : "default"}
            >
              {isLoading ? "Processing..." : "Yes, Confirm"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
