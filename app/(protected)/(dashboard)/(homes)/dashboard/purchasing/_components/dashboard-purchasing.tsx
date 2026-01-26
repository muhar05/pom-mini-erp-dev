"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, FileText, Package } from "lucide-react";
import StatCard, { StatCardData } from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/stat-card";
import { useI18n } from "@/contexts/i18n-context";

export default function DashboardPurchasing() {
    const { t } = useI18n();

    // Temporary dummy data
    const statCards: StatCardData[] = [
        {
            title: "Open PO",
            value: "12",
            icon: ShoppingCart,
            iconBg: "bg-blue-600",
            gradientFrom: "from-blue-600/10",
            description: "Purchase orders awaiting processing",
        },
        {
            title: "Delivery Requests",
            value: "5",
            icon: FileText,
            iconBg: "bg-orange-600",
            gradientFrom: "from-orange-600/10",
            description: "Pending delivery notes",
        },
        {
            title: "Stock Reservations",
            value: "8",
            icon: Package,
            iconBg: "bg-green-600",
            gradientFrom: "from-green-600/10",
            description: "Items reserved for orders",
        },
    ];

    return (
        <>
            <DashboardBreadcrumb
                title={t("page.dashboard.purchasing_title")}
                text={t("sidebar.purchasing")}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard data={statCards} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="min-h-[300px] flex items-center justify-center border-dashed">
                    <CardContent>
                        <p className="text-muted-foreground italic">
                            Purchasing activities and charts will be displayed here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
