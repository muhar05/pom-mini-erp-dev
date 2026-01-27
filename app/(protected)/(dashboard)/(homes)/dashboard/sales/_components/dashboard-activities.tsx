"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { History } from "lucide-react";

interface Activity {
    id: string;
    user: string;
    action: string;
    date: string | Date | null;
}

interface DashboardActivitiesProps {
    activities: Activity[];
}

export default function DashboardActivities({ activities }: DashboardActivitiesProps) {
    return (
        <Card className="shadow-sm border-none bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b dark:border-slate-800">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Recent Activities
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y dark:divide-slate-800">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <Avatar className="w-10 h-10 border-2 border-primary/10">
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                        {activity.user.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-bold text-sm truncate">{activity.user}</p>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: true }) : "-"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                                        {activity.action}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground italic">
                            No recent activities found
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
