
"use client";

import { useEffect, useState } from "react";
import { collectionGroup, query, orderBy, limit, onSnapshot, doc, getDoc, getDocs, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CalendarCheck, CalendarX } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Student } from "@/lib/types";

type ActivityType = 'present' | 'absent' | 'new_student';

type Activity = {
  id: string;
  person: string;
  action: string;
  type: ActivityType;
  timestamp: Date;
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
    setLoading(true);

    const studentsQuery = query(collectionGroup(firestore, "students"), orderBy("createdAt", "desc"), limit(5));
    const attendanceQuery = query(collectionGroup(firestore, "attendance"), orderBy("timestamp", "desc"), limit(5));

    const studentDocsCache = new Map<string, Student>();
    let combinedActivities: Activity[] = [];

    const mergeAndSortActivities = (newActivities: Activity[]) => {
      combinedActivities = [...newActivities, ...combinedActivities]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i) // Remove duplicates
        .slice(0, 5);
      setActivities(combinedActivities);
    };

    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentActivities = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          person: data.fullName,
          action: "joined the academy.",
          type: "new_student" as ActivityType,
          timestamp: data.createdAt.toDate(),
        };
      });
      mergeAndSortActivities(studentActivities);
      setLoading(false);
    }, (error) => {
      // If this query fails due to index, we can just ignore new user activities for now.
      console.warn("Could not fetch recent students for activity feed, probably missing index:", error.message);
      setLoading(false);
    });

    const unsubAttendance = onSnapshot(attendanceQuery, async (snapshot) => {
        const attendancePromises = snapshot.docs.map(async (attendanceDoc) => {
            const data = attendanceDoc.data();
            let studentName = "A student";
            
            // This is a potential source of error if a student is deleted but attendance remains
            try {
                 if (studentDocsCache.has(data.studentId)) {
                    studentName = studentDocsCache.get(data.studentId)!.fullName;
                } else {
                    const studentSubcollectionRef = collection(firestore, `stadiums/${data.stadiumId}/students`);
                    const studentRef = doc(studentSubcollectionRef, data.studentId);
                    const studentDoc = await getDoc(studentRef);

                    if (studentDoc.exists()) {
                        const studentData = { id: studentDoc.id, ...studentDoc.data() } as Student;
                        studentName = studentData.fullName;
                        studentDocsCache.set(data.studentId, studentData);
                    }
                }
            } catch (e) {
                // Stale reference, student might have been deleted.
                // We can ignore this error for the activity feed.
                console.warn(`Could not find student with ID ${data.studentId} in stadium ${data.stadiumId}`);
            }
           
            return {
                id: attendanceDoc.id,
                person: studentName,
                action: `was marked ${data.status}.`,
                type: data.status as ActivityType,
                timestamp: data.timestamp.toDate(),
            };
        });

        const attendanceActivities = await Promise.all(attendancePromises);
        mergeAndSortActivities(attendanceActivities);
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
                    <p className="text-xs text-muted-foreground pt-1">{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</p>
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
