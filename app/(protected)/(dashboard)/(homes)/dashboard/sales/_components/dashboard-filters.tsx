"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardFiltersProps {
    onFilterChange: (filters: { start?: string; end?: string; year?: number }) => void;
}

export default function DashboardFilters({ onFilterChange }: DashboardFiltersProps) {
    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    const handleApply = () => {
        onFilterChange({
            start: start || undefined,
            end: end || undefined,
            year: parseInt(year),
        });
    };

    const handleReset = () => {
        const defaultYear = new Date().getFullYear();
        setStart("");
        setEnd("");
        setYear(defaultYear.toString());
        onFilterChange({
            start: undefined,
            end: undefined,
            year: defaultYear
        });
    };

    return (
        <Card className="mb-6 border-none shadow-sm bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Input
                                type="date"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-40 h-10 pl-3 pr-2"
                            />
                        </div>
                        <span className="text-muted-foreground px-1 font-bold">~</span>
                        <div className="relative">
                            <Input
                                type="date"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="w-40 h-10 pl-3 pr-2"
                            />
                        </div>
                    </div>

                    <div className="w-32">
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 ml-auto">
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground h-10">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                        <Button size="sm" onClick={handleApply} className="h-10 px-6 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
