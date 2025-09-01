
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle } from "lucide-react";

type Activity = {
  id: string;
  studentName: string;
  coachName: string;
  status: 'present' | 'absent';
  timestamp: string;
};

const MOCK_STUDENTS = ["Alex Johnson", "Maria Garcia", "David Smith", "Emily White", "Chris Lee"];
const MOCK_COACHES = ["Coach Sarah", "Coach Mike"];

const generateMockActivity = (): Activity[] => {
    return Array.from({length: 10}, (_, i) => ({
        id: `activity_${i}`,
        studentName: MOCK_STUDENTS[Math.floor(Math.random() * MOCK_STUDENTS.length)],
        coachName: MOCK_COACHES[Math.floor(Math.random() * MOCK_COACHES.length)],
        status: Math.random() > 0.3 ? 'present' : 'absent',
        timestamp: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2,'0')} PM`
    }));
}


export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using mock data since auth is disabled
    setLoading(true);
    setTimeout(() => {
        setActivities(generateMockActivity());
        setLoading(false);
    }, 1200);
  }, []);

  return (
    <Card className="h-full flex flex-col transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest attendance markings (using mock data).</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[250px]">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {activity.status === 'present' ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.studentName} marked as {activity.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      by {activity.coachName} at {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No recent activity.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
