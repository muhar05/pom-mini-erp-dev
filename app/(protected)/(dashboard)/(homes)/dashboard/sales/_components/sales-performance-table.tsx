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
    leads_qty: number;
    opp_qty: number;
    opp_rp: number;
    sq_qty: number;
    sq_rp: number;
    so_qty: number;
    so_rp: number;
    winrate: number;
}

interface SalesPerformanceTableProps {
    data: SalesPerformance[];
}

export default function SalesPerformanceTable({ data }: SalesPerformanceTableProps) {
    const { t } = useI18n();

    if (!data || data.length === 0) return null;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(val).replace("IDR", "Rp");
    };

    return (
        <Card className="mb-6 overflow-hidden border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    Sales Team Performance Table
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="font-bold py-4">Sales Name</TableHead>
                                <TableHead className="text-center font-bold">Leads</TableHead>
                                <TableHead className="text-center font-bold">Opp. (Qty)</TableHead>
                                <TableHead className="text-right font-bold">Opp. (Rp)</TableHead>
                                <TableHead className="text-center font-bold">SQ (Qty)</TableHead>
                                <TableHead className="text-right font-bold">SQ (Rp)</TableHead>
                                <TableHead className="text-center font-bold">SO (Qty)</TableHead>
                                <TableHead className="text-right font-bold">SO (Rp)</TableHead>
                                <TableHead className="text-center font-bold text-primary">WinRate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow
                                    key={index}
                                    className={`transition-colors hover:bg-muted/30 ${index === 0 ? "bg-primary/5" : ""}`}
                                >
                                    <TableCell className="font-medium whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {item.sales_name}
                                            {index === 0 && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-yellow-400 text-yellow-900 border border-yellow-500 shadow-sm animate-pulse">
                                                    STREAK
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{item.leads_qty}</TableCell>
                                    <TableCell className="text-center">{item.opp_qty}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.opp_rp)}</TableCell>
                                    <TableCell className="text-center">{item.sq_qty}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.sq_rp)}</TableCell>
                                    <TableCell className="text-center">{item.so_qty}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(item.so_rp)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="font-black text-primary">{item.winrate.toFixed(1)}%</span>
                                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${Math.min(item.winrate, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

