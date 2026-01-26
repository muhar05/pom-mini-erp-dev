"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, BadgeDollarSign, FileCheck, Landmark } from "lucide-react";
import StatCard, { StatCardData } from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/stat-card";
import { useI18n } from "@/contexts/i18n-context";

export default function DashboardFinance() {
    const { t } = useI18n();

    // Temporary dummy data
    const statCards: StatCardData[] = [
        {
            title: "Pending Approvals",
            value: "9",
            icon: FileCheck,
            iconBg: "bg-amber-500",
            gradientFrom: "from-amber-600/10",
            description: "Financial approvals requiring attention",
        },
        {
            title: "Total Transactions",
            value: "Rp 245M",
            icon: BadgeDollarSign,
            iconBg: "bg-green-600",
            gradientFrom: "from-green-600/10",
            description: "Validated transactions this month",
        },
        {
            title: "Outstanding FAR",
            value: "3",
            icon: Wallet,
            iconBg: "bg-blue-600",
            gradientFrom: "from-blue-600/10",
            description: "Fixed Asset Requests pending",
        },
    ];

    return (
        <>
            <DashboardBreadcrumb
                title={t("page.dashboard.finance_title")}
                text={t("sidebar.finance")}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard data={statCards} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 min-h-[400px] flex flex-col items-center justify-center border-dashed">
                    <Landmark className="w-16 h-16 text-muted-foreground mb-4 opacity-10" />
                    <CardContent>
                        <p className="text-muted-foreground italic">
                            Revenue and expense analytics will be visualized here.
                        </p>
                    </CardContent>
                </Card>

                <Card className="min-h-[400px] flex items-center justify-center border-dashed">
                    <CardContent>
                        <p className="text-muted-foreground italic text-center">
                            Awaiting Financial Verification
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
