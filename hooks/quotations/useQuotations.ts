import { useEffect, useState, useCallback } from "react";
import { quotations } from "@/types/models";

// Tipe untuk tabel, bisa pakai langsung dari models atau buat tipe baru jika perlu
export type QuotationTable = {
  id: string;
  quotation_no: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  total_amount: number;
  status: string;
  last_update: string;
  opportunity_no: string;
  user_id?: number | null; // <-- Tambahkan
  lead_id?: number | null; // <-- Tambahkan
};

interface QuotationFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useQuotations(filters?: QuotationFilters) {
  const [quotationsData, setQuotationsData] = useState<QuotationTable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status && filters.status !== "all") params.append("status", filters.status);
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.append("dateTo", filters.dateTo);

    const url = `/api/quotations${params.toString() ? `?${params.toString()}` : ""}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: quotations[]) => {
        // Mapping dari tipe quotations (models) ke QuotationTable
        const mapped: QuotationTable[] = data.map((q) => ({
          id: String(q.id),
          quotation_no: q.quotation_no,
          created_at: q.created_at
            ? new Date(q.created_at).toISOString().split("T")[0]
            : "",
          updated_at: q.updated_at
            ? new Date(q.updated_at).toISOString().split("T")[0]
            : "",
          customer_name: q.customer?.customer_name || "-",
          customer_email: q.customer?.email || "-",
          sales_pic: q.user?.name || "-", // <-- Ambil dari relasi user
          type: q.customer?.type || "-",
          company: q.customer?.company?.company_name || "-",
          total_amount: Number(q.grand_total ?? q.total ?? 0),
          status: q.status || "-",
          last_update: q.updated_at
            ? new Date(q.updated_at).toISOString().split("T")[0]
            : "",
          opportunity_no: "-", // isi jika ada relasi opportunity
          user_id: q.user_id, // <-- Tambahkan
          lead_id: q.lead_id, // <-- Tambahkan
        }));
        setQuotationsData(mapped);
      })
      .catch((error) => {
        console.error("Error fetching quotations:", error);
        setQuotationsData([]);
      })
      .finally(() => setLoading(false));
  }, [filters?.search, filters?.status, filters?.dateFrom, filters?.dateTo]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  return {
    quotations: quotationsData,
    loading,
    setQuotations: setQuotationsData,
    refetch: fetchQuotations, // Tambahkan refetch function
  };
}
