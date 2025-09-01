
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

const MOCK_PEOPLE = [
    { name: "Esther Howard", image: `https://i.pravatar.cc/150?u=esther` },
    { name: "Cody Fisher", image: `https://i.pravatar.cc/150?u=cody` },
    { name: "Brooklyn Simmons", image: `https://i.pravatar.cc/150?u=brooklyn` },
];

const generateMockActivity = (): Activity[] => {
    return [
        {
            id: 'act_1',
            person: MOCK_PEOPLE[0].name,
            personImage: MOCK_PEOPLE[0].image,
            action: 'marked as Present',
            type: 'present',
            timestamp: '9:30 AM'
        },
        {
            id: 'act_2',
            person: MOCK_PEOPLE[1].name,
            personImage: MOCK_PEOPLE[1].image,
            action: 'registered as a new student.',
            type: 'new_student',
            timestamp: 'Yesterday'
        },
        {
            id: 'act_3',
            person: MOCK_PEOPLE[2].name,
            personImage: MOCK_PEOPLE[2].image,
            action: 'marked as Absent',
            type: 'absent',
            timestamp: '2 days ago'
        },
    ];
}

const activityIcons = {
    present: <CalendarCheck className="size-4 text-green-500" />,
    absent: <CalendarX className="size-4 text-destructive" />,
    new_student: <UserPlus className="size-4 text-primary" />,
};

export function RecentActivity() {
  const activities = generateMockActivity();

  return (
    <Card className="h-full flex flex-col shadow-sm border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="ghost" size="icon" className="size-6">
            <MoreHorizontal className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0 space-y-4">
        {activities.map((activity) => (
             <div key={activity.id} className="flex items-start gap-4">
                <div className="size-9 rounded-full bg-muted flex items-center justify-center">
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
        ))}
      </CardContent>
    </Card>
  );
}
