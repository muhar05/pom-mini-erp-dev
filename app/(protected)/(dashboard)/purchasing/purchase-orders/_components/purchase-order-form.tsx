"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPurchaseOrderAction, updatePurchaseOrderAction } from "@/app/actions/purchase-orders";
import { getSalesOrderByIdAction } from "@/app/actions/sales-orders";
import { toast } from "react-hot-toast";
import { SALE_STATUSES } from "@/utils/salesOrderPermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangle } from "lucide-react";

type PurchaseOrder = {
  id?: string;
  po_no: string;
  sale_id?: string;
  supplier_id?: string;
  total: number;
  status: string;
  note?: string;
  po_detail_items: any[];
};

interface PurchaseOrderFormProps {
  mode: "add" | "edit";
  purchaseOrder?: any;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function PurchaseOrderForm({
  mode,
  purchaseOrder,
  onClose,
  onSuccess,
}: PurchaseOrderFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const saleIdFromUrl = searchParams.get("sale_id");

  const [formData, setFormData] = useState<PurchaseOrder>({
    po_no: purchaseOrder?.po_no || "",
    sale_id: purchaseOrder?.sale_id || saleIdFromUrl || "",
    supplier_id: purchaseOrder?.supplier_id || "",
    total: purchaseOrder?.total || 0,
    status: purchaseOrder?.status || "DRAFT",
    note: purchaseOrder?.note || "",
    po_detail_items: purchaseOrder?.po_detail_items || [],
  });

  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSO, setFetchingSO] = useState(false);

  useEffect(() => {
    const fetchSO = async () => {
      if (formData.sale_id) {
        try {
          setFetchingSO(true);
          const res = await getSalesOrderByIdAction(formData.sale_id);
          setSalesOrder(res);

          // If add mode and from SO, prepopulate total and items (if empty)
          if (mode === "add" && formData.po_detail_items.length === 0) {
            setFormData(prev => ({
              ...prev,
              total: res.total || 0,
              // Map SO items to PO items if needed, simplified here
            }));
          }
        } catch (error) {
          console.error("Error fetching SO:", error);
          toast.error("Sales Order tidak ditemukan atau terjadi kesalahan.");
        } finally {
          setFetchingSO(false);
        }
      }
    };

    fetchSO();
  }, [formData.sale_id, mode]);

  const handleInputChange = (field: keyof PurchaseOrder, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (salesOrder && salesOrder.sale_status !== SALE_STATUSES.PR && mode === "add") {
      toast.error("Sales Order harus berstatus PR untuk membuat PO.");
      return;
    }

    setLoading(true);
    try {
      const result = mode === "add"
        ? await createPurchaseOrderAction(formData)
        : await updatePurchaseOrderAction(purchaseOrder.id, formData);

      if (result.success) {
        toast.success(mode === "add" ? "Purchase Order created" : "Purchase Order updated");
        onSuccess?.();
      } else {
        toast.error(result.message || "Failed to save Purchase Order");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isRestricted = salesOrder && salesOrder.sale_status !== SALE_STATUSES.PR && mode === "add";

  return (
    <Card className="shadow-lg border-t-4 border-t-blue-600">
      <CardHeader>
        <CardTitle className="text-xl">
          {mode === "add" ? "Create Purchase Order" : "Edit Purchase Order"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {salesOrder && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 font-bold">Referenced Sales Order: {salesOrder.sale_no}</AlertTitle>
            <AlertDescription className="text-blue-700">
              Status SO: <span className="font-bold uppercase">{salesOrder.sale_status}</span> |
              Customer: {salesOrder.customers?.customer_name} |
              Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(salesOrder.total)}
            </AlertDescription>
          </Alert>
        )}

        {isRestricted && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Peringatan! Status Tidak Sesuai</AlertTitle>
            <AlertDescription>
              PO hanya bisa dibuat jika Sales Order berstatus **PR**.
              Saat ini status SO adalah **{salesOrder.sale_status}**.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="po_no">PO Number (Optional)</Label>
              <Input
                id="po_no"
                value={formData.po_no}
                onChange={(e) => handleInputChange("po_no", e.target.value)}
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">PO Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="OPEN">OPEN</SelectItem>
                  <SelectItem value="ORDERED">ORDERED</SelectItem>
                  <SelectItem value="RECEIVED">RECEIVED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total Amount (Estimated)</Label>
              <Input
                id="total"
                type="number"
                value={formData.total}
                onChange={(e) => handleInputChange("total", parseFloat(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Sales Order ID (Reference)</Label>
              <Input
                value={formData.sale_id || "Manual / Non-SO"}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notes</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              placeholder="Tulis catatan di sini..."
              rows={3}
            />
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || isRestricted || fetchingSO}
            >
              {loading ? "Menyimpan..." : (mode === "add" ? "Create Purchase Order" : "Update Purchase Order")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
