"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import dynamic from "next/dynamic";
import { useI18n } from "@/contexts/i18n-context";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const LeadSourceChart = () => {
    const { data: stats, loading } = useDashboardStats();
    const { t } = useI18n();

    if (loading) {
        return (
            <Card className="card">
                <CardContent className="px-0">
                    <div className="px-6">
                        <div className="h-6 w-1/3 bg-muted animate-pulse rounded mb-2" />
                        <div className="h-4 w-1/4 bg-muted animate-pulse rounded mb-4" />
                    </div>
                    <div className="mt-4 flex justify-center">
                        <div className="h-64 w-64 bg-muted animate-pulse rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!stats || !stats.leadsBySource) return null;

    const sources = Object.keys(stats.leadsBySource);
    const series = Object.values(stats.leadsBySource);
    const total = series.reduce((a, b) => a + b, 0);

    const options: any = {
        chart: {
            type: "pie",
            height: 350,
        },
        labels: sources,
        colors: ['#487FFF', "#FF9F29", '#45B369', '#EF4A00', '#8b5cf6', '#ec4899', '#06b6d4'],
        stroke: {
            show: false
        },
        legend: {
            position: "bottom",
            horizontalAlign: 'center'
        },
        dataLabels: {
            enabled: true,
            formatter: function (val: number, opts: any) {
                return opts.w.config.series[opts.seriesIndex] + " (" + val.toFixed(1) + "%)";
            },
        },
        tooltip: {
            y: {
                formatter: (val: number) => `${val} Leads`
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: '100%'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    return (
        <Card className="card h-full">
            <CardContent className="px-0 h-full flex flex-col">
                <div className="px-6">
                    <h6 className="text-lg mb-2 font-semibold">{t("page.dashboard.source_dist")}</h6>
                    <p className="text-sm text-muted-foreground">
                        Breakdown of where your leads are coming from
                    </p>
                </div>

                <div className="mt-4 flex-grow flex items-center justify-center">
                    {total === 0 ? (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                            {t("common.no_data")}
                        </div>
                    ) : (
                        <div className="w-full">
                            <Chart
                                options={options}
                                series={series}
                                type="pie"
                                height={350}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default LeadSourceChart;
