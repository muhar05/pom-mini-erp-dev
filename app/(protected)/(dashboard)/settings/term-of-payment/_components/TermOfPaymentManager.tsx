"use client";

import { useState } from "react";
import {
  usePaymentTerms,
  createPaymentTerm,
  updatePaymentTerm,
  deletePaymentTerm,
  PaymentTerm,
} from "@/hooks/payment-terms/usePaymentTerms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";

type PaymentTermForm = {
  code: string;
  name: string;
  days: string; // Selalu string di form
  note?: string;
  is_active: boolean;
};

export default function TermOfPaymentManager() {
  const { paymentTerms, isLoading, isError, refresh } = usePaymentTerms();
  const [form, setForm] = useState<PaymentTermForm>({
    code: "",
    name: "",
    days: "",
    note: "",
    is_active: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (pt: PaymentTerm) => {
    setEditingId(pt.id);
    setForm({
      code: pt.code,
      name: pt.name,
      days: pt.days !== null && pt.days !== undefined ? String(pt.days) : "",
      note: pt.note ?? "",
      is_active: pt.is_active,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ code: "", name: "", days: "", note: "", is_active: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        days: form.days === "" ? undefined : Number(form.days),
      };

      if (editingId) {
        await updatePaymentTerm(editingId, payload);
        toast.success("Term of payment berhasil diupdate");
      } else {
        await createPaymentTerm(payload as Omit<PaymentTerm, "id">);
        toast.success("Term of payment berhasil ditambah");
      }
      await refresh();
      handleCancel();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus term of payment ini?")) return;
    setLoading(true);
    try {
      await deletePaymentTerm(id);
      toast.success("Term of payment berhasil dihapus");
      await refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader>
        <CardTitle>Manajemen Term of Payment</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6 mt-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Input
              name="code"
              placeholder="Kode (misal: net30, cash)"
              value={form.code || ""}
              onChange={handleChange}
              required
              className="w-32"
              disabled={loading}
            />
            <Input
              name="name"
              placeholder="Nama (misal: Net 30, Cash)"
              value={form.name || ""}
              onChange={handleChange}
              required
              className="w-40"
              disabled={loading}
            />
            <Input
              name="days"
              type="number"
              placeholder="Hari"
              value={form.days ?? ""}
              onChange={handleChange}
              className="w-24"
              min={0}
              disabled={loading}
            />
            <Input
              name="note"
              placeholder="Catatan"
              value={form.note || ""}
              onChange={handleChange}
              className="w-48"
              disabled={loading}
            />
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active ?? true}
                onChange={handleChange}
                disabled={loading}
              />
              Aktif
            </label>
            <Button type="submit" disabled={loading}>
              {editingId ? "Update" : "Tambah"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Batal
              </Button>
            )}
          </div>
        </form>
        <Separator />
        <div>
          {isLoading && <div>Loading...</div>}
          {isError && <div className="text-red-600">Gagal memuat data</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Hari</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentTerms?.map((pt) => (
                <TableRow key={pt.id}>
                  <TableCell>{pt.code}</TableCell>
                  <TableCell>{pt.name}</TableCell>
                  <TableCell>{pt.days ?? "-"}</TableCell>
                  <TableCell>{pt.note ?? "-"}</TableCell>
                  <TableCell>
                    {pt.is_active ? (
                      <span className="text-green-600">Aktif</span>
                    ) : (
                      <span className="text-gray-400">Nonaktif</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(pt)}
                      disabled={loading}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(pt.id)}
                      disabled={loading}
                      className="ml-2"
                    >
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!paymentTerms?.length && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-gray-500"
                  >
                    Belum ada data term of payment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
