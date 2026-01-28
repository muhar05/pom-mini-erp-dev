"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatStatusDisplay } from "@/utils/statusHelpers";
import { useSession } from "@/contexts/session-context";
import { users } from "@/types/models";
import {
  getQuotationPermissions,
  QUOTATION_STATUSES,
} from "@/utils/quotationPermissions";
import {
  getAllQuotationsAction,
  updateQuotationAction,
  approveQuotationAction,
  rejectQuotationAction,
} from "@/app/actions/quotations";
import { toast } from "react-hot-toast";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useQuotationsWaitingApproval } from "@/hooks/quotations/useQuotationsWaitingApproval";

type PendingQuotation = {
  id: number;
  quotation_no: string;
  status: string;
  total: number;
  shipping: number;
  discount: number;
  tax: number;
  grand_total: number;
  note?: string | null;
  target_date?: Date | null;
  created_at: Date;
  customer: {
    customer_name: string;
    company?: {
      company_name?: string;
    } | null;
  };
};

type StatusOption = {
  value: string;
  label: string;
};

export default function ManagerSalesPendingTaskPage() {
  const session = useSession();
  const {
    quotations: pendingQuotations,
    loading,
    refetch,
  } = useQuotationsWaitingApproval();
  const [user, setUser] = useState<users | null>(null);
  const [permissions, setPermissions] = useState<any>(null);

  // State untuk update status
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [updating, setUpdating] = useState(false);

  // Set user info when session changes
  useEffect(() => {
    if (session?.user) {
      setUser(session.user as unknown as users);
      setPermissions(getQuotationPermissions(session.user as unknown as users));
    }
  }, [session]);

  // Fetch pending quotations
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Quick approve function
  const handleQuickApprove = async (quotationId: number, note?: string) => {
    try {
      setUpdating(true);
      const result = await approveQuotationAction(
        quotationId,
        note || "Approved by manager",
      );

      if (result?.success) {
        toast.success("Quotation approved successfully");
        setNotes(prev => {
          const newNotes = { ...prev };
          delete newNotes[quotationId];
          return newNotes;
        });
        refetch(); // Refresh data
      } else {
        toast.error(result?.message || "Failed to approve quotation");
      }
    } catch (error) {
      console.error("Error approving quotation:", error);
      toast.error("Error approving quotation");
    } finally {
      setUpdating(false);
    }
  };

  // Quick reject function
  const handleQuickReject = async (quotationId: number, note?: string) => {
    try {
      setUpdating(true);
      const result = await rejectQuotationAction(
        quotationId,
        note || "Rejected by manager",
      );

      if (result?.success) {
        toast.success("Quotation rejected and moved to Draft");
        setNotes(prev => {
          const newNotes = { ...prev };
          delete newNotes[quotationId];
          return newNotes;
        });
        refetch(); // Refresh data
      } else {
        toast.error(result?.message || "Failed to reject quotation");
      }
    } catch (error) {
      console.error("Error rejecting quotation:", error);
      toast.error("Error rejecting quotation");
    } finally {
      setUpdating(false);
    }
  };

  const mappedPendingQuotations: PendingQuotation[] = pendingQuotations.map(
    (q) => ({
      id: Number(q.id), // Convert string to number
      quotation_no: q.quotation_no,
      status: q.status || "",
      total: Number(q.total ?? 0),
      shipping: Number(q.shipping ?? 0),
      discount: Number(q.discount ?? 0),
      tax: Number(q.tax ?? 0),
      grand_total: Number(q.grand_total ?? 0),
      note: q.note,
      target_date: q.target_date ? new Date(q.target_date) : undefined,
      created_at: q.created_at ? new Date(q.created_at) : new Date(),
      customer: q.customer
        ? {
          customer_name: q.customer.customer_name || "-",
          company: q.customer.company
            ? { company_name: q.customer.company.company_name || "-" }
            : null,
        }
        : {
          customer_name: "-",
          company: null,
        },
    }),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm text-muted-foreground">
            Loading pending quotations...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardBreadcrumb
        title="My Pending Tasks"
        text="Quotations waiting for manager approval"
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approval
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingQuotations.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Quotations waiting for approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  pendingQuotations.reduce(
                    (sum, q) => sum + (q.grand_total || 0),
                    0,
                  ),
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Total pending value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oldest Task</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingQuotations.length > 0
                  ? Math.max(
                    ...pendingQuotations.map((q) =>
                      Math.floor(
                        (new Date().getTime() -
                          new Date(q.created_at ?? 0).getTime()) /
                        (1000 * 60 * 60 * 24),
                      ),
                    ),
                  )
                  : 0}{" "}
                days
              </div>
              <p className="text-xs text-muted-foreground">
                Oldest pending task
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Quotations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Quotations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingQuotations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium">All caught up! 🎉</p>
                <p>No quotations waiting for approval.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingQuotations.map((quotation) => (
                  <Card
                    key={quotation.id}
                    className="border-l-4 border-l-yellow-400"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 w-full">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {quotation.quotation_no}
                            </Badge>
                            <Badge variant="secondary">
                              {formatStatusDisplay(quotation.status)}
                            </Badge>
                            {/* Tambahkan badge jika status review */}
                            {quotation.status === QUOTATION_STATUSES.REVIEW && (
                              <Badge variant="destructive" className="ml-2">
                                Butuh Approval (Review)
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Customer:</span>
                              <p className="text-muted-foreground">
                                {quotation.customer?.customer_name || "-"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Company:</span>
                              <p className="text-muted-foreground">
                                {quotation.customer?.company?.company_name ||
                                  "-"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Total:</span>
                              <p className="text-muted-foreground font-medium">
                                {formatCurrency(quotation.grand_total || 0)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>
                              <p className="text-muted-foreground">
                                {formatDate(quotation.created_at)}
                              </p>
                            </div>
                          </div>

                          {quotation.note && (
                            <div className="text-sm bg-muted/50 p-2 rounded">
                              <span className="font-medium">Existing Note:</span>
                              <p className="text-muted-foreground italic">
                                {quotation.note}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 space-y-2">
                            <Label htmlFor={`note-${quotation.id}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Decision Note
                            </Label>
                            <Textarea
                              id={`note-${quotation.id}`}
                              placeholder="Write a reason for accept/reject..."
                              value={notes[quotation.id] || ""}
                              onChange={(e) => setNotes(prev => ({ ...prev, [quotation.id]: e.target.value }))}
                              rows={2}
                              className="resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleQuickApprove(quotation.id, notes[quotation.id])}
                            disabled={updating}
                            className="bg-green-600 hover:bg-green-700 flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleQuickReject(quotation.id, notes[quotation.id])
                            }
                            disabled={updating}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
