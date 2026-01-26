"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Clock, CheckCircle2 } from "lucide-react";
import StatCard, { StatCardData } from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/stat-card";
import { useI18n } from "@/contexts/i18n-context";

export default function DashboardDelivery() {
    const { t } = useI18n();

    // Temporary dummy data
    const statCards: StatCardData[] = [
        {
            title: "Active Deliveries",
            value: "18",
            icon: Truck,
            iconBg: "bg-blue-600",
            gradientFrom: "from-blue-600/10",
            description: "Packages currently in transit",
        },
        {
            title: "Pending Pickup",
            value: "7",
            icon: Package,
            iconBg: "bg-amber-500",
            gradientFrom: "from-amber-600/10",
            description: "Ready and waiting for courier",
        },
        {
            title: "Awaiting Request",
            value: "12",
            icon: Clock,
            iconBg: "bg-purple-600",
            gradientFrom: "from-purple-600/10",
            description: "New delivery requests to process",
        },
        {
            title: "Completed Today",
            value: "25",
            icon: CheckCircle2,
            iconBg: "bg-green-600",
            gradientFrom: "from-green-600/10",
            description: "Successfully delivered items",
        },
    ];

    return (
        <>
            <DashboardBreadcrumb
                title={t("page.dashboard.delivery_title")}
                text={t("sidebar.delivery_orders")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard data={statCards} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 min-h-[400px] flex flex-col items-center justify-center border-dashed">
                    <Truck className="w-16 h-16 text-muted-foreground mb-4 opacity-10" />
                    <CardContent>
                        <p className="text-muted-foreground italic text-center">
                            Delivery tracking map and status distribution chart will be here.
                        </p>
                    </CardContent>
                </Card>

                <Card className="min-h-[400px] flex items-center justify-center border-dashed">
                    <CardContent>
                        <p className="text-muted-foreground italic text-center">
                            Urgent Delivery Requests
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
