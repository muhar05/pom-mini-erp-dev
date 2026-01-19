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
  Phone,
  MapPin,
  Briefcase,
  Tag,
  Info,
  Clock,
  Repeat,
} from "lucide-react";
import { Opportunity } from "@/types/models";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useUpdateOpportunityStatus } from "@/hooks/opportunities/useUpdateOpportunitiesStatus";
import { useConvertOpportunityToSQ } from "@/hooks/opportunities/useConvertOpportunityToSQ";
import { toast } from "react-hot-toast";

interface OpportunityDetailClientProps {
  opportunity: Opportunity;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "opp_sq":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case "opp_lost":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    case "prospecting":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
}

export default function OpportunityDetailClient({
  opportunity,
}: OpportunityDetailClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Pakai custom hook
  const { convert, loading, error, result } = useConvertOpportunityToSQ();

  // Handler untuk buka dialog konfirmasi convert SQ
  const handleOpenConvertSQDialog = () => {
    setDialogOpen(true);
  };

  // Handler untuk konfirmasi convert SQ
  const handleConfirmConvertSQ = async () => {
    const success = await convert(opportunity.id, null);
    if (success && result && result.id) {
      toast.success("Berhasil convert ke SQ!");
      setDialogOpen(false);
      router.push(`/sales/quotations/${result.id}/edit`);
    } else {
      toast.error(error || "Gagal convert ke SQ");
    }
  };

  return (
    <div className="w-full mx-auto py-4 space-y-6">
      {/* Header dengan Back Button dan Actions */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 dark:border-gray-700 dark:hover:bg-gray-800"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        {/* Button Convert SQ */}
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleOpenConvertSQDialog}
          disabled={loading || opportunity.status === "opp_sq"}
        >
          <Repeat className="w-4 h-4" />
          Convert SQ
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Customer Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Card */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-gray-100">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Customer Name</span>
                  </div>
                  <p className="font-medium text-lg dark:text-gray-100">
                    {opportunity.customer_name}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>Customer Email</span>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    {opportunity.customer_email || "-"}
                  </p>
                </div>
              </div>

              {/* Contact & Company Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Contact Person</span>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    {opportunity.contact || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    {opportunity.phone || "-"}
                  </p>
                </div>
              </div>

              {/* Company Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Building2 className="w-4 h-4" />
                    <span>Company</span>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    {opportunity.company || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Tag className="w-4 h-4" />
                    <span>Customer Type</span>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    {opportunity.type || "-"}
                  </p>
                </div>
              </div>

              {/* Location & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    {opportunity.location || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Info className="w-4 h-4" />
                    <span>Source</span>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    {opportunity.source || "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product & Notes Card */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-gray-100">
                <FileText className="w-5 h-5" />
                Product & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Interest */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Tag className="w-4 h-4" />
                  <span>Product Interest</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border dark:border-gray-700">
                  <p className="whitespace-pre-line dark:text-gray-300">
                    {opportunity.product_interest ||
                      "No product interest specified"}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Info className="w-4 h-4" />
                  <span>Notes</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border dark:border-gray-700">
                  <p className="whitespace-pre-line dark:text-gray-300">
                    {opportunity.notes ||
                      opportunity.note ||
                      "No notes available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Opportunity & Status Info */}
        <div className="space-y-6">
          {/* Opportunity Card */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-gray-100">
                <Briefcase className="w-5 h-5" />
                Opportunity Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span>Opportunity Number</span>
                  </div>
                  <p className="font-medium text-lg dark:text-gray-100">
                    {opportunity.opportunity_no}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Sales PIC</span>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    {opportunity.sales_pic || opportunity.id_user_name || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Created Date</span>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    {opportunity.created_at}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Last Updated</span>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    {opportunity.updated_at}
                  </p>
                </div>
              </div>

              <Separator className="dark:bg-gray-700" />

              {/* Potential Value */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span>Potential Value</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-semibold dark:border-gray-600 dark:text-gray-300"
                  >
                    IDR
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary dark:text-blue-400">
                  {opportunity.potential_value.toLocaleString("id-ID", {
                    minimumFractionDigits: 0,
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update Card */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-gray-100">
                <TrendingUp className="w-5 h-5" />
                Status Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Status */}
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Status
                </p>
                <Badge
                  className={`${getStatusBadgeClass(
                    opportunity.status
                  )} px-3 py-1.5 text-base font-medium w-full justify-center`}
                >
                  {opportunity.status === "opp_sq"
                    ? "SQ"
                    : opportunity.status === "opp_lost"
                    ? "Lost"
                    : opportunity.status === "prospecting"
                    ? "Prospecting"
                    : opportunity.status}
                </Badge>
              </div>

              {/* Lost Status Message */}
              {opportunity.status?.toLowerCase() === "lost" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Opportunity Lost</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    This opportunity has been marked as Lost and cannot be
                    updated further.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog konfirmasi convert SQ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">
              Convert to SQ
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Apakah Anda yakin ingin mengubah opportunity ini menjadi
              SQ/Quotation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleConfirmConvertSQ}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Ya, Convert
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={loading}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Batal
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
