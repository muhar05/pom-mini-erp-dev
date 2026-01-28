"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { createStockReservationAction } from "@/app/actions/stock-reservations";
import { getSalesOrderByIdAction } from "@/app/actions/sales-orders";
import { toast } from "react-hot-toast";
import { SALE_STATUSES } from "@/utils/salesOrderPermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangle, Package } from "lucide-react";

type StockReservation = {
  id?: string;
  sale_id?: string;
  status: string;
  note?: string;
  type: string;
  item_detail: any;
};

interface StockReservationFormProps {
  mode: "add" | "edit";
  stockReservation?: any;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function StockReservationForm({
  mode,
  stockReservation,
  onClose,
  onSuccess,
}: StockReservationFormProps) {
  const searchParams = useSearchParams();
  const saleIdFromUrl = searchParams.get("sale_id");

  const [formData, setFormData] = useState<StockReservation>({
    sale_id: stockReservation?.sale_id || saleIdFromUrl || "",
    status: stockReservation?.status || "RESERVED",
    note: stockReservation?.note || "",
    type: stockReservation?.type || "SO_RESERVATION",
    item_detail: stockReservation?.item_detail || {},
  });

  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSO, setFetchingSO] = useState(false);

  useEffect(() => {
    const fetchSO = async () => {
      if (formData.sale_id && formData.type === "SO_RESERVATION") {
        try {
          setFetchingSO(true);
          const res = await getSalesOrderByIdAction(formData.sale_id);
          setSalesOrder(res);
        } catch (error) {
          console.error("Error fetching SO:", error);
        } finally {
          setFetchingSO(false);
        }
      }
    };

    fetchSO();
  }, [formData.sale_id, formData.type]);

  const handleInputChange = (field: keyof StockReservation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === "SO_RESERVATION" && salesOrder && salesOrder.sale_status !== SALE_STATUSES.PO && mode === "add") {
      toast.error("Sales Order harus berstatus PO untuk melakukan Stock Reservation.");
      return;
    }

    setLoading(true);
    try {
      const result = await createStockReservationAction(formData);

      if (result.success) {
        toast.success("Stock Reservation created successfully");
        onSuccess?.();
      } else {
        toast.error(result.message || "Failed to create reservation");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isRestricted = formData.type === "SO_RESERVATION" && salesOrder && salesOrder.sale_status !== SALE_STATUSES.PO && mode === "add";

  return (
    <Card className="shadow-lg border-t-4 border-t-green-600">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Package className="w-5 h-5 text-green-600" />
          {mode === "add" ? "New Stock Reservation" : "Edit Stock Reservation"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {salesOrder && formData.type === "SO_RESERVATION" && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <InfoIcon className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 font-bold">Referenced Sales Order: {salesOrder.sale_no}</AlertTitle>
            <AlertDescription className="text-green-700 text-xs">
              Status SO: <span className="font-bold uppercase">{salesOrder.sale_status}</span> |
              Customer: {salesOrder.customers?.customer_name}
            </AlertDescription>
          </Alert>
        )}

        {isRestricted && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Peringatan!</AlertTitle>
            <AlertDescription>
              Stock Reservation hanya bisa dibuat jika Sales Order berstatus **PO**.
              Status saat ini: **{salesOrder.sale_status}**.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Reservation Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SO_RESERVATION">Based on Sales Order</SelectItem>
                  <SelectItem value="FREE_RESERVATION">Free (Non-SO)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESERVED">RESERVED</SelectItem>
                  <SelectItem value="FULFILLED">FULFILLED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "SO_RESERVATION" && (
              <div className="space-y-2 md:col-span-2">
                <Label>Sales Order ID</Label>
                <Input
                  value={formData.sale_id || ""}
                  onChange={(e) => handleInputChange("sale_id", e.target.value)}
                  placeholder="Enter SO ID or UUID"
                />
                <p className="text-[10px] text-muted-foreground italic">Input manual ID jika tidak lewat dashboard.</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notes / Keterangan</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              placeholder="Tulis alasan reservasi atau detail lainnya..."
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
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading || isRestricted || fetchingSO}
            >
              {loading ? "Memproses..." : "Create Reservation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
