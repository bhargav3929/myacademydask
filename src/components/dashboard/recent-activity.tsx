
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, UserPlus, CalendarCheck, CalendarX } from "lucide-react";
import { Button } from "../ui/button";

type ActivityType = 'present' | 'absent' | 'new_student';

type Activity = {
  id: string;
  person: string;
  personImage?: string;
  action: string;
  type: ActivityType;
  timestamp: string;
};

const activityIcons = {
    present: <CalendarCheck className="size-4 text-green-500" />,
    absent: <CalendarX className="size-4 text-destructive" />,
    new_student: <UserPlus className="size-4 text-primary" />,
};

export function RecentActivity() {
  const activities: Activity[] = [
    // Data will be fetched from Firestore
  ];

  return (
    <Card className="h-full flex flex-col shadow-sm border-border/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="ghost" size="icon" className="size-6">
            <MoreHorizontal className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0 space-y-4">
        {activities.length > 0 ? activities.map((activity) => (
             <div key={activity.id} className="flex items-start gap-4">
                <div className="size-9 rounded-full bg-secondary flex items-center justify-center border">
                    {activityIcons[activity.type]}
                </div>
                <div className="flex-grow">
                    <p className="text-sm">
                        <span className="font-semibold">{activity.person}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
             </div>
        )) : (
            <div className="flex h-24 items-center justify-center text-center text-muted-foreground">
                <p className="text-sm">No recent activity to display.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
