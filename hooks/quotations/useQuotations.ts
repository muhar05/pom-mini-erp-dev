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
};

export function useQuotations() {
  const [quotationsData, setQuotationsData] = useState<QuotationTable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = useCallback(() => {
    setLoading(true);
    fetch("/api/quotations")
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
          sales_pic: "-", // isi jika ada relasi sales PIC
          type: q.customer?.type || "-",
          company: q.customer?.company?.company_name || "-",
          total_amount: Number(q.grand_total ?? q.total ?? 0),
          status: q.status || "-",
          last_update: q.updated_at
            ? new Date(q.updated_at).toISOString().split("T")[0]
            : "",
          opportunity_no: "-", // isi jika ada relasi opportunity
        }));
        setQuotationsData(mapped);
      })
      .catch((error) => {
        console.error("Error fetching quotations:", error);
        setQuotationsData([]); // Set empty array on error
      })
      .finally(() => setLoading(false));
  }, []);

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
