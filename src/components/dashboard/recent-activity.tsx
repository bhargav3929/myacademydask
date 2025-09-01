
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, LogIn, UserPlus } from "lucide-react";
import { MotionDiv } from "../motion";

type ActivityType = 'present' | 'absent' | 'login' | 'new_student';

type Activity = {
  id: string;
  person: string;
  personImage?: string;
  action: string;
  type: ActivityType;
  timestamp: string;
};

const MOCK_PEOPLE = [
    { name: "Alex Johnson", image: `https://i.pravatar.cc/150?u=alex` },
    { name: "Maria Garcia", image: `https://i.pravatar.cc/150?u=maria` },
    { name: "Coach Mike", image: `https://i.pravatar.cc/150?u=coachmike` },
    { name: "David Smith", image: `https://i.pravatar.cc/150?u=david` },
    { name: "Coach Sarah", image: `https://i.pravatar.cc/150?u=coachsarah` },
];

const generateMockActivity = (): Activity[] => {
    const activities: Activity[] = [
        {
            id: 'act_1',
            person: MOCK_PEOPLE[0].name,
            personImage: MOCK_PEOPLE[0].image,
            action: 'marked as present',
            type: 'present',
            timestamp: '5m ago'
        },
        {
            id: 'act_2',
            person: MOCK_PEOPLE[1].name,
            personImage: MOCK_PEOPLE[1].image,
            action: 'marked as absent',
            type: 'absent',
            timestamp: '12m ago'
        },
        {
            id: 'act_3',
            person: MOCK_PEOPLE[2].name,
            personImage: MOCK_PEOPLE[2].image,
            action: 'logged in',
            type: 'login',
            timestamp: '30m ago'
        },
        {
            id: 'act_4',
            person: MOCK_PEOPLE[3].name,
            action: 'was added to North Stadium',
            type: 'new_student',
            timestamp: '45m ago'
        },
         {
            id: 'act_5',
            person: MOCK_PEOPLE[4].name,
            personImage: MOCK_PEOPLE[4].image,
            action: 'logged in',
            type: 'login',
            timestamp: '1h ago'
        },
    ];
    return activities.sort(() => Math.random() - 0.5); // Randomize for effect
}


export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
        setActivities(generateMockActivity());
        setLoading(false);
    }, 1200);
     return () => clearTimeout(timer);
  }, []);

  const icons: Record<ActivityType, React.ReactNode> = {
      present: <CheckCircle2 className="size-5 text-green-500" />,
      absent: <XCircle className="size-5 text-red-500" />,
      login: <LogIn className="size-5 text-primary" />,
      new_student: <UserPlus className="size-5 text-purple-500" />,
  };

  return (
    <Card className="h-full flex flex-col shadow-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Live Activity Feed</CardTitle>
        <CardDescription>A real-time stream of events in your academy.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-[280px]">
          <div className="p-6 pt-0">
            {loading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-20" />
                      </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border/70" />
                <div className="space-y-8">
                {activities.map((activity, index) => (
                  <MotionDiv
                    key={activity.id}
                    className="flex items-start gap-4 relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <div className="size-10 rounded-full bg-background flex items-center justify-center border-2 border-border/70 z-10">
                        {icons[activity.type]}
                    </div>
                    <div className="flex-grow pt-1.5">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{activity.person}</span> {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.timestamp}
                      </p>
                    </div>
                  </MotionDiv>
                ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No recent activity.</p>
              </div>
            )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
