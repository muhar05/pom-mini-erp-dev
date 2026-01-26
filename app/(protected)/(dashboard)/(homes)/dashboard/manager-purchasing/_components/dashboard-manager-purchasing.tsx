"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, FileText, Package, CheckCircle } from "lucide-react";
import StatCard, { StatCardData } from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/stat-card";
import { useI18n } from "@/contexts/i18n-context";

export default function DashboardManagerPurchasing() {
    const { t } = useI18n();

    // Temporary dummy data
    const statCards: StatCardData[] = [
        {
            title: "Total PO (Team)",
            value: "45",
            icon: ShoppingCart,
            iconBg: "bg-green-600",
            gradientFrom: "from-green-600/10",
            description: "Across all purchasing staff",
        },
        {
            title: "Pending Approvals",
            value: "7",
            icon: CheckCircle,
            iconBg: "bg-amber-500",
            gradientFrom: "from-amber-600/10",
            description: "POs awaiting your signature",
        },
        {
            title: "Active Vendors",
            value: "14",
            icon: Package,
            iconBg: "bg-blue-600",
            gradientFrom: "from-blue-600/10",
            description: "Currently supplying materials",
        },
    ];

    return (
        <>
            <DashboardBreadcrumb
                title={t("page.dashboard.manager_purchasing_title")}
                text={t("sidebar.purchasing")}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard data={statCards} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 min-h-[400px] flex items-center justify-center border-dashed">
                    <CardContent>
                        <p className="text-muted-foreground italic">
                            Managerial purchasing analytics and team performance will be here.
                        </p>
                    </CardContent>
                </Card>

                <Card className="min-h-[400px] flex items-center justify-center border-dashed">
                    <CardContent>
                        <p className="text-muted-foreground italic text-center">
                            Approval Queue
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
