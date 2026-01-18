import { useCallback, useEffect, useState } from "react";

export interface PaymentTerm {
  id: number;
  code: string;
  name: string;
  days?: number | null;
  note?: string | null;
  is_active: boolean;
}

// GET ALL
export function usePaymentTerms() {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<Error | null>(null);

  const fetchPaymentTerms = useCallback(async () => {
    setIsLoading(true);
    setIsError(null);
    try {
      const res = await fetch("/api/payment-terms");
      if (!res.ok)
        throw new Error((await res.json()).message || "Fetch failed");
      setPaymentTerms(await res.json());
    } catch (err: any) {
      setIsError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentTerms();
  }, [fetchPaymentTerms]);

  return { paymentTerms, isLoading, isError, refresh: fetchPaymentTerms };
}

// GET BY ID
export function usePaymentTermById(id?: number) {
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<Error | null>(null);

  const fetchPaymentTerm = useCallback(async () => {
    if (typeof id !== "number" || isNaN(id)) return;
    setIsLoading(true);
    setIsError(null);
    try {
      const res = await fetch(`/api/payment-terms/${id}`);
      if (!res.ok)
        throw new Error((await res.json()).message || "Fetch failed");
      setPaymentTerm(await res.json());
    } catch (err: any) {
      setIsError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPaymentTerm();
  }, [fetchPaymentTerm]);

  return { paymentTerm, isLoading, isError, refresh: fetchPaymentTerm };
}

// CREATE
export async function createPaymentTerm(input: Omit<PaymentTerm, "id">) {
  const res = await fetch("/api/payment-terms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Create failed");
  return res.json();
}

// UPDATE
export async function updatePaymentTerm(
  id: number,
  input: Partial<PaymentTerm>,
) {
  const res = await fetch(`/api/payment-terms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Update failed");
  return res.json();
}

// DELETE
export async function deletePaymentTerm(id: number) {
  const res = await fetch(`/api/payment-terms/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error((await res.json()).message || "Delete failed");
  return res.json();
}
