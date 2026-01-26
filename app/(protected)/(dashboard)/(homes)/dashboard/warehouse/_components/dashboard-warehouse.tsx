"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Boxes, Package, History } from "lucide-react";
import StatCard, { StatCardData } from "@/app/(protected)/(dashboard)/(homes)/dashboard/(components)/stat-card";
import { useI18n } from "@/contexts/i18n-context";

export default function DashboardWarehouse() {
    const { t } = useI18n();

    // Temporary dummy data
    const statCards: StatCardData[] = [
        {
            title: "Active DO",
            value: "24",
            icon: Truck,
            iconBg: "bg-blue-600",
            gradientFrom: "from-blue-600/10",
            description: "Delivery orders in transit/ready",
        },
        {
            title: "Total Stock",
            value: "1,240",
            icon: Boxes,
            iconBg: "bg-green-600",
            gradientFrom: "from-green-600/10",
            description: "Items currently in inventory",
        },
        {
            title: "Low Stock Items",
            value: "15",
            icon: Package,
            iconBg: "bg-red-600",
            gradientFrom: "from-red-600/10",
            description: "Items below minimum threshold",
        },
    ];

    return (
        <>
            <DashboardBreadcrumb
                title={t("page.dashboard.warehouse_title")}
                text={t("sidebar.warehouse")}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard data={statCards} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="min-h-[400px] flex items-center justify-center border-dashed">
                    <CardContent>
                        <p className="text-muted-foreground italic">
                            Inventory levels and stock movements chart will be here.
                        </p>
                    </CardContent>
                </Card>

                <Card className="min-h-[400px] flex flex-col items-center justify-center border-dashed">
                    <History className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <CardContent>
                        <p className="text-muted-foreground italic text-center">
                            Recent Warehouse Activities
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
