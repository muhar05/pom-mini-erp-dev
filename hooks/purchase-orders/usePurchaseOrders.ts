"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllPurchaseOrdersAction } from "@/app/actions/purchase-orders";

export function usePurchaseOrders() {
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPurchaseOrders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllPurchaseOrdersAction();
            setPurchaseOrders(data as any[]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [fetchPurchaseOrders]);

    return { purchaseOrders, loading, error, refetch: fetchPurchaseOrders };
}
