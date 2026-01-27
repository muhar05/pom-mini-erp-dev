"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/i18n-context";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DashboardChartsProps {
    variant?: "full" | "gauge";
    funnelData?: { stage: string; count: number }[];
    pipelineData?: { status: string; count: number }[];
    leadSourceData?: { source: string; count: number }[];
    lostReasonData?: { reason: string; count: number }[];
    revenueData?: { month: string; qty: number; rp: number }[];
    winrate: number;
}

export default function DashboardCharts({
    variant = "full",
    funnelData = [],
    pipelineData = [],
    leadSourceData = [],
    lostReasonData = [],
    revenueData = [],
    winrate
}: DashboardChartsProps) {
    const { t } = useI18n();

    // Funnel Chart Options
    const funnelOptions: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true } },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                isFunnel: true,
                distributed: true,
            },
        },
        dataLabels: {
            enabled: true,
            formatter: function (val, opt) {
                return opt.w.globals.labels[opt.dataPointIndex] + ': ' + val;
            },
            dropShadow: { enabled: true }
        },
        colors: ['#487FFF', '#6366F1', '#8B5CF6', '#EC4899', '#06B6D4'],
        xaxis: { categories: funnelData.map(d => d.stage) },
    };

    // Pipeline Chart Options (Donut)
    const pipelineOptions: ApexOptions = {
        chart: { type: 'donut', animations: { enabled: true } },
        labels: pipelineData.map(d => d.status),
        legend: { position: 'bottom', fontSize: '12px' },
        colors: ['#487FFF', '#9DBAFF', '#FFD700', '#32CD32', '#FF4500', '#808080'],
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'TOTAL',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            formatter: (w) => w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0).toString()
                        }
                    }
                }
            }
        },
        stroke: { width: 0 }
    };

    // Winrate Gauge Options
    const winrateOptions: ApexOptions = {
        chart: { type: 'radialBar', sparkline: { enabled: true } },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                track: { background: "#f1f5f9", strokeWidth: "85%" },
                hollow: { size: "65%" },
                dataLabels: {
                    name: { show: false },
                    value: { offsetY: -2, fontSize: '28px', fontWeight: 800, color: '#0f172a', formatter: (val) => val.toFixed(1) + '%' }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                gradientToColors: ['#10b981'],
                stops: [0, 100]
            }
        },
        colors: ['#3b82f6'],
        labels: ['Win Rate'],
    };

    // Lead Source Pie
    const leadSourceOptions: ApexOptions = {
        chart: { type: 'pie' },
        labels: leadSourceData.map(d => d.source),
        legend: { position: 'bottom' },
        colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1'],
        stroke: { width: 1 }
    };

    // Lost Reason Pie
    const lostReasonOptions: ApexOptions = {
        chart: { type: 'pie' },
        labels: lostReasonData.map(d => d.reason),
        legend: { position: 'bottom' },
        colors: ['#ef4444', '#f59e0b', '#6366f1', '#3b82f6', '#10b981'],
        stroke: { width: 1 }
    };

    // Revenue Area Chart
    const revenueOptions: ApexOptions = {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 4 },
        xaxis: {
            categories: revenueData.map(d => d.month),
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: [
            {
                title: { text: "Revenue (Rp)", style: { fontWeight: 600 } },
                labels: { formatter: (val) => `Rp ${(val / 1000000).toFixed(1)}M` }
            },
            {
                opposite: true,
                title: { text: "Orders (Qty)", style: { fontWeight: 600 } }
            }
        ],
        colors: ['#6366f1', '#10b981'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [50, 100]
            }
        },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        legend: { position: 'top', horizontalAlign: 'right' }
    };

    const revenueSeries = [
        { name: 'Revenue (Rp)', type: 'area', data: revenueData.map(d => d.rp) },
        { name: 'Orders (Qty)', type: 'line', data: revenueData.map(d => d.qty) }
    ];

    if (variant === "gauge") {
        return <Chart options={winrateOptions} series={[winrate]} type="radialBar" height={250} />;
    }

    return (
        <div className="space-y-6">
            {/* SECTION 4. PIPELINE & FUNNEL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-none">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Sales Pipeline by SQ Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart options={pipelineOptions} series={pipelineData.map(d => d.count)} type="donut" height={320} />
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-none">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Leads → SO Funnel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart options={funnelOptions} series={[{ name: "Count", data: funnelData.map(d => d.count) }]} type="bar" height={320} />
                    </CardContent>
                </Card>
            </div>

            {/* SECTION 5. ANALYTICS (2 Pie Charts) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-none">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Leads by Source</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {leadSourceData.length > 0 ? (
                            <Chart options={leadSourceOptions} series={leadSourceData.map(d => d.count)} type="pie" height={300} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">No source data available</div>
                        )}
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-none">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Lost SQ Reasons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lostReasonData.length > 0 ? (
                            <Chart options={lostReasonOptions} series={lostReasonData.map(d => d.count)} type="pie" height={300} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">No lost reason data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* SECTION 6. REVENUE (Full Width) */}
            <Card className="shadow-sm border-none">
                <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Monthly Sales Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Chart options={revenueOptions} series={revenueSeries} type="area" height={350} />
                </CardContent>
            </Card>
        </div>
    );
}
