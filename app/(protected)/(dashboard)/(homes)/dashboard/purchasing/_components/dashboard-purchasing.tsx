"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, FileText, Package, CheckCircle, Clock, AlertCircle } from "lucide-react";
import StatCard, { StatCardData } from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/stat-card";
import { useI18n } from "@/contexts/i18n-context";
import { getPurchasingDashboardDataAction } from "@/app/actions/sales-orders";
import { formatCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SALE_STATUSES } from "@/utils/salesOrderPermissions";

export default function DashboardPurchasing() {
    const { t } = useI18n();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getPurchasingDashboardDataAction();
            setData(res);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const statCards: StatCardData[] = useMemo(() => [
        {
            title: "Siap Diproses (PR)",
            value: data?.readyToProcess?.length || 0,
            icon: AlertCircle,
            iconBg: "bg-red-500",
            gradientFrom: "from-red-600/10",
            description: "Awaiting PO creation",
        },
        {
            title: "Dalam Proses (PO/SR)",
            value: data?.inProcess?.length || 0,
            icon: Clock,
            iconBg: "bg-blue-600",
            gradientFrom: "from-blue-600/10",
            description: "Procurement in progress",
        },
        {
            title: "Selesai Purchasing",
            value: data?.completedPurchasing?.length || 0,
            icon: CheckCircle,
            iconBg: "bg-green-600",
            gradientFrom: "from-green-600/10",
            description: "Handed over to next stage",
        },
    ], [data]);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading purchasing metrics...</div>;
    }

    return (
        <div className="space-y-6">
            <DashboardBreadcrumb
                title={t("page.dashboard.purchasing_title")}
                text={t("sidebar.purchasing")}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard data={statCards} />
            </div>

            {/* Widget 1: Sales Order Siap Diproses (PR) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        Sales Order Siap Diproses
                    </CardTitle>
                    <Badge variant="destructive">{data?.readyToProcess?.length || 0} PR Pending</Badge>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                                    <th className="p-3">SO Number</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3 text-right">Total</th>
                                    <th className="p-3">Sales Owner</th>
                                    <th className="p-3">Tanggal PR</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.readyToProcess?.length > 0 ? (
                                    data.readyToProcess.map((so: any) => (
                                        <tr key={so.id} className="border-b hover:bg-gray-50/50">
                                            <td className="p-3 font-mono font-bold text-blue-600">{so.sale_no}</td>
                                            <td className="p-3">{so.customer_name}</td>
                                            <td className="p-3 text-right font-medium">{formatCurrency(so.total)}</td>
                                            <td className="p-3">{so.sales_owner}</td>
                                            <td className="p-3">{format(new Date(so.created_at), "dd/MM/yyyy")}</td>
                                            <td className="p-3 text-center">
                                                <Link href={`/purchasing/purchase-orders/new?sale_id=${so.id}`}>
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">Proses PO</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground italic">Tidak ada Sales Order dengan status PR.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Widget 2: Dalam Proses (PO/SR) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Sales Order Dalam Proses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data?.inProcess?.length > 0 ? (
                            data.inProcess.map((so: any) => (
                                <div key={so.id} className="p-4 border rounded-lg flex justify-between items-center bg-white dark:bg-gray-900 border-l-4 border-l-blue-500 shadow-sm">
                                    <div>
                                        <p className="text-sm font-bold">{so.sale_no}</p>
                                        <p className="text-xs text-muted-foreground">{so.customer_name}</p>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <Badge variant={so.sale_status === SALE_STATUSES.PO ? "outline" : "default"} className={so.sale_status === SALE_STATUSES.PO ? "text-blue-600 border-blue-600" : "bg-green-600"}>
                                            {so.sale_status === SALE_STATUSES.PO ? "PO Created" : "Stock Reserved"}
                                        </Badge>
                                        <Link href={`/sales/sales-orders/${so.id}`}>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View SO"><FileText className="w-4 h-4" /></Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-2 text-center py-4 text-muted-foreground">Tidak ada proses Purchasing yang sedang berjalan.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Widget 3: Selesai Purchasing */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Sales Order Selesai Purchasing (Read-only)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50/50">
                                    <th className="p-2">SO Number</th>
                                    <th className="p-2">Customer</th>
                                    <th className="p-2">Last Status</th>
                                    <th className="p-2">Sales Owner</th>
                                    <th className="p-2 text-right">Grand Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.completedPurchasing?.slice(0, 10).map((so: any) => (
                                    <tr key={so.id} className="border-b text-muted-foreground">
                                        <td className="p-2">{so.sale_no}</td>
                                        <td className="p-2">{so.customer_name}</td>
                                        <td className="p-2">
                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold">{so.sale_status}</Badge>
                                        </td>
                                        <td className="p-2">{so.sales_owner}</td>
                                        <td className="p-2 text-right">{formatCurrency(so.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 text-center">
                            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-4">Viewing latest 10 completed orders</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
