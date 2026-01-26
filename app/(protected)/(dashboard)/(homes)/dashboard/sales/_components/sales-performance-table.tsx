"use client";

import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/i18n-context";

interface SalesPerformance {
    sales_name: string;
    total_leads: number;
    total_quotations: number;
    total_orders: number;
    total_revenue: number;
}

interface SalesPerformanceTableProps {
    data: SalesPerformance[];
}

export default function SalesPerformanceTable({ data }: SalesPerformanceTableProps) {
    const { t } = useI18n();

    if (!data || data.length === 0) return null;

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Sales Performance Ranking</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sales Name</TableHead>
                            <TableHead className="text-center">Leads</TableHead>
                            <TableHead className="text-center">Quotations</TableHead>
                            <TableHead className="text-center">Orders</TableHead>
                            <TableHead className="text-right">Total Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item, index) => (
                            <TableRow key={index} className={index === 0 ? "bg-green-50/50 dark:bg-green-900/10" : ""}>
                                <TableCell className="font-medium">
                                    {item.sales_name}
                                    {index === 0 && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                                            Top Performer
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">{item.total_leads}</TableCell>
                                <TableCell className="text-center">{item.total_quotations}</TableCell>
                                <TableCell className="text-center">{item.total_orders}</TableCell>
                                <TableCell className="text-right font-semibold">
                                    Rp {item.total_revenue.toLocaleString("id-ID")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
