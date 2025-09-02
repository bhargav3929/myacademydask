
"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CalendarCheck, CalendarX } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from "date-fns";

type ActivityType = 'present' | 'absent' | 'new_student';

type Activity = {
  id: string;
  person: string;
  action: string;
  type: ActivityType;
  timestamp: string;
};

const activityIcons: Record<ActivityType, React.ReactNode> = {
  present: <CalendarCheck className="size-4 text-green-500" />,
  absent: <CalendarX className="size-4 text-red-500" />,
  new_student: <UserPlus className="size-4 text-blue-500" />,
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newStudentsQuery = query(collection(firestore, "students"), orderBy("createdAt", "desc"), limit(5));
    const attendanceQuery = query(collection(firestore, "attendance"), orderBy("timestamp", "desc"), limit(5));

    const unsubStudents = onSnapshot(newStudentsQuery, (snapshot) => {
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            setActivities(prev => {
                const newActivity = {
                    id: doc.id,
                    person: data.fullName,
                    action: "joined the academy.",
                    type: "new_student" as ActivityType,
                    timestamp: formatDistanceToNow(data.createdAt.toDate(), { addSuffix: true }),
                };
                if (prev.some(act => act.id === newActivity.id)) return prev;
                return [...prev, newActivity].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
            });
        });
        setLoading(false);
    });

    const unsubAttendance = onSnapshot(attendanceQuery, async (snapshot) => {
        for(const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            const studentDoc = await getDoc(doc(firestore, "students", data.studentId));
            if (studentDoc.exists()) {
                const studentName = studentDoc.data().fullName;
                setActivities(prev => {
                    const newActivity = {
                        id: docSnapshot.id,
                        person: studentName,
                        action: `was marked ${data.status}.`,
                        type: data.status as ActivityType,
                        timestamp: formatDistanceToNow(data.timestamp.toDate(), { addSuffix: true }),
                    };
                    if (prev.some(act => act.id === newActivity.id)) return prev;
                    return [...prev, newActivity].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
                });
            }
        }
        setLoading(false);
    });

    return () => {
        unsubStudents();
        unsubAttendance();
    };

  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0 space-y-4">
        {loading ? (
           Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="flex items-start gap-4">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-grow space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
             </div>
            ))
        ) : activities.length > 0 ? (
          activities.map((activity) => (
             <div key={activity.id} className="flex items-start gap-4">
                <div className="mt-1 size-9 rounded-full bg-muted flex items-center justify-center border">
                    {activityIcons[activity.type]}
                </div>
                <div className="flex-grow">
                    <p className="text-sm leading-tight">
                        <span className="font-semibold">{activity.person}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground pt-1">{activity.timestamp}</p>
                </div>
             </div>
          ))
        ) : (
          <div className="flex h-24 items-center justify-center text-center text-muted-foreground">
            <p className="text-sm">No recent activity to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
