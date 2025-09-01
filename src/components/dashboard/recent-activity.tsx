
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal } from "lucide-react";
import { MotionDiv } from "../motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

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
    { name: "Esther Howard", image: `https://i.pravatar.cc/150?u=esther` },
];

const generateMockActivity = (): Activity[] => {
    const activities: Activity[] = [
        {
            id: 'act_1',
            person: MOCK_PEOPLE[0].name,
            personImage: MOCK_PEOPLE[0].image,
            action: 'Courier',
            type: 'present',
            timestamp: '06:20 PM (22 Jun 2024)'
        },
    ];
    return activities;
}

export function LiveTracking() {
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

  const trackingSteps = [
    { status: 'Checking', time: '11:48 AM', completed: true },
    { status: 'In Transit', time: '04:30 PM', completed: true },
    { status: 'Out for Delivery', time: '06:20 PM (22 Jun 2024)', completed: false },
  ];

  return (
    <Card className="h-full flex flex-col shadow-sm border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Live Tracking</CardTitle>
        <Button variant="ghost" size="icon" className="size-6">
            <MoreHorizontal className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0">
        <div className="flex items-center justify-between mb-4">
            <div>
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-semibold">#867dhk-7589ktj</p>
            </div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">On the Way</Badge>
        </div>
        <div className="space-y-6 relative">
             {/* Timeline line */}
             <div className="absolute left-2 top-2 bottom-8 w-0.5 bg-border ml-px" />
            {trackingSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 relative">
                    <div className="size-5 rounded-full bg-background flex items-center justify-center border-2 border-primary z-10">
                        {step.completed && <div className="size-2.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex-grow flex justify-between items-center -mt-1">
                      <p className="text-sm font-medium text-foreground">
                        {step.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.time}
                      </p>
                    </div>
                </div>
            ))}
        </div>
         <div className="flex items-center justify-between mt-6 rounded-lg border p-3">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={MOCK_PEOPLE[0].image} />
                    <AvatarFallback>EH</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">Esther Howard</p>
                    <p className="text-xs text-muted-foreground">Courier</p>
                </div>
            </div>
            <div className="flex gap-1">
                <Button variant="outline" size="icon" className="size-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 8.383V4.617l-6.5 3.9-6.5-3.9V12.5a1 1 0 0 0 .584.922z"/></svg>
                </Button>
                <Button variant="outline" size="icon" className="size-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58z"/></svg>
                </Button>
            </div>
         </div>

         <Button variant="outline" className="w-full mt-4">New Shipping</Button>
      </CardContent>
    </Card>
  );
}
